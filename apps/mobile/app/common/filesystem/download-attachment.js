/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import Sodium from "@ammarahmed/react-native-sodium";
import { getFileNameWithExtension } from "@notesnook/core";
import { strings } from "@notesnook/intl";
import React from "react";
import { Platform } from "react-native";
import RNFetchBlob from "react-native-blob-util";
import * as ScopedStorage from "react-native-scoped-storage";
import { subscribe, zip } from "react-native-zip-archive";
import { ShareComponent } from "../../components/sheets/export-notes/share";
import { ToastManager, presentSheet } from "../../services/event-manager";
import { useAttachmentStore } from "../../stores/use-attachment-store";
import { IOS_APPGROUPID } from "../../utils/constants";
import { DatabaseLogger, db } from "../database";
import Storage from "../database/storage";
import { createCacheDir, exists } from "./io";
import { cacheDir, copyFileAsync, releasePermissions } from "./utils";

export const FileDownloadStatus = {
  Success: 1,
  Fail: 0
};

/**
 * Download all user's attachments
 * @returns
 */
export async function downloadAllAttachments() {
  const attachments = await db.attachments.all.ids();
  return downloadAttachments(attachments);
}

/**
 * Downloads provided attachments to a .zip file
 * on user's device.
 * @param {string[]} attachments
 * @param onProgress
 * @returns
 */
export async function downloadAttachments(attachments) {
  await createCacheDir();
  if (!attachments || !attachments.length) return;
  const groupId = `download-all-${Date.now()}`;

  let outputFolder;
  if (Platform.OS === "android") {
    // Ask the user to select a directory to store the file
    let file = await ScopedStorage.openDocumentTree(true);
    outputFolder = file.uri;
    if (!outputFolder) return;
  } else {
    outputFolder = await Storage.checkAndCreateDir("/downloads/");
  }

  // Create the folder to zip;
  const zipSourceFolder = `${cacheDir}/notesnook-attachments`;
  const zipOutputFile =
    Platform.OS === "ios"
      ? `${outputFolder}/notesnook-attachments-${Date.now()}.zip`
      : `${cacheDir}/notesnook-attachments.zip`;
  if (await RNFetchBlob.fs.exists(zipSourceFolder)) {
    await RNFetchBlob.fs.unlink(zipSourceFolder);
  }

  await RNFetchBlob.fs.mkdir(zipSourceFolder);

  const isCancelled = () => {
    if (useAttachmentStore.getState().downloading[groupId]?.canceled) {
      RNFetchBlob.fs.unlink(zipSourceFolder).catch(console.log);
      useAttachmentStore.getState().setDownloading({
        groupId,
        current: 0,
        total: 0,
        success: false,
        message: strings.network.dowloadCancelled(),
        canceled: true
      });
      return true;
    }
  };

  for (let i = 0; i < attachments.length; i++) {
    if (isCancelled()) return;
    let attachment = await db.attachments.attachment(attachments[i]);
    const hash = attachment.hash;
    try {
      useAttachmentStore.getState().setDownloading({
        groupId: groupId,
        current: i + 1,
        total: attachments.length,
        filename: attachment.hash
      });
      // Download to cache
      let uri = await downloadAttachment(hash, false, {
        silent: true,
        cache: true,
        groupId: groupId
      });

      if (isCancelled()) return;

      if (!uri) throw new Error(strings.failedToDownloadFile());
      // Move file to the source folder we will zip eventually and rename the file to it's actual name.
      const filePath = `${zipSourceFolder}/${attachment.filename}`;
      await RNFetchBlob.fs.mv(`${cacheDir}/${uri}`, filePath);
    } catch (e) {
      DatabaseLogger.error(e);
    }
  }

  useAttachmentStore.getState().setDownloading({
    groupId: groupId,
    current: 0,
    total: 0,
    success: true
  });

  if (isCancelled()) return;

  let sub;
  try {
    useAttachmentStore.getState().setDownloading({
      current: 0,
      total: 1,
      message: `${strings.savingZipFile()}... ${strings.pleaseWait()}`,
      groupId
    });
    // If all goes well, zip the notesnook-attachments folder in cache.

    sub = subscribe(({ progress }) => {
      useAttachmentStore.getState().setDownloading({
        groupId,
        current: progress,
        total: 1,
        message: `${strings.savingZipFile()} (${(progress * 100).toFixed(
          1
        )}%)... ${strings.pleaseWait()}`
      });
    });
    await zip(zipSourceFolder, zipOutputFile);
    sub?.remove();

    if (Platform.OS === "android") {
      // Move the zip to user selected directory.
      const file = await ScopedStorage.createFile(
        outputFolder,
        `notesnook-attachments-${Date.now()}.zip`,
        "application/zip"
      );
      await copyFileAsync(`file://${zipOutputFile}`, file.uri);
    }

    useAttachmentStore.getState().setDownloading({
      current: 0,
      total: 0,
      message: undefined,
      success: true,
      groupId
    });
    releasePermissions(outputFolder);
  } catch (e) {
    useAttachmentStore.getState().setDownloading({
      current: 0,
      total: 0,
      message: undefined,
      success: false,
      groupId
    });
    releasePermissions(outputFolder);
    sub?.remove();
    ToastManager.error(e, "Error zipping attachments");
  }
  // Remove source & zip file from cache.
  RNFetchBlob.fs.unlink(zipSourceFolder).catch(console.log);
  if (Platform.OS === "android") {
    RNFetchBlob.fs.unlink(zipOutputFile).catch(console.log);
  }
}

export default async function downloadAttachment(
  hash,
  global = true,
  options = {
    silent: false,
    cache: false,
    throwError: false,
    groupId: undefined,
    base64: false,
    text: false
  }
) {
  await createCacheDir();

  let attachment = await db.attachments.attachment(hash);
  if (!attachment) {
    DatabaseLogger.log("Attachment not found");
    return;
  }

  let folder = {};
  if (!options.cache) {
    if (Platform.OS === "android") {
      folder = await ScopedStorage.openDocumentTree();
      if (!folder) return;
    } else {
      folder.uri = await Storage.checkAndCreateDir("/downloads/");
    }
  }

  try {
    await db
      .fs()
      .downloadFile(
        options.groupId || attachment.hash,
        attachment.hash,
        attachment.chunkSize
      );
    if (!(await exists(attachment.hash))) {
      DatabaseLogger.log("Attachment does not exist after download.");
      return;
    }

    if (options.base64 || options.text) {
      DatabaseLogger.log(`Starting to decrypt... hash: ${attachment.hash}`);
      return await db.attachments.read(
        attachment.hash,
        options.base64 ? "base64" : "text"
      );
    }

    let filename = getFileNameWithExtension(
      attachment.filename,
      attachment.mimeType
    );

    let key = await db.attachments.decryptKey(attachment.key);

    let info = {
      iv: attachment.iv,
      salt: attachment.salt,
      length: attachment.size,
      alg: attachment.alg,
      hash: attachment.hash,
      hashType: attachment.hashType,
      mime: attachment.mimeType,
      fileName: options.cache ? undefined : filename,
      uri: options.cache ? undefined : folder.uri,
      chunkSize: attachment.chunkSize,
      appGroupId: IOS_APPGROUPID
    };
    let fileUri = await Sodium.decryptFile(
      key,
      info,
      options.cache ? "cache" : "file"
    );

    if (!options.silent) {
      ToastManager.show({
        heading: strings.network.downloadSuccess(),
        message: strings.network.fileDownloaded(filename),
        type: "success"
      });
    }

    if (Platform.OS === "ios" && !options.cache) {
      fileUri = folder.uri + `/${filename}`;
    }
    if (!options.silent) {
      presentSheet({
        title: strings.network.fileDownloaded(),
        paragraph: strings.fileSaved(filename, Platform.OS),
        icon: "download",
        context: global ? null : attachment.hash,
        component: <ShareComponent uri={fileUri} name={filename} padding={12} />
      });
    }

    return fileUri;
  } catch (e) {
    if (attachment.dateUploaded) {
      RNFetchBlob.fs
        .unlink(RNFetchBlob.fs.dirs.CacheDir + `/${attachment.hash}`)
        .catch(console.log);
      RNFetchBlob.fs
        .unlink(RNFetchBlob.fs.dirs.CacheDir + `/${attachment.hash}_dcache`)
        .catch(console.log);
    }
    DatabaseLogger.error(e);
    useAttachmentStore.getState().remove(attachment.hash);
    if (options.throwError) {
      throw e;
    }
  }
}
