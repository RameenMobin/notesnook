import React, {Fragment, useEffect, useState, createRef} from 'react';
import {View, TextInput, Platform, DeviceEventEmitter} from 'react-native';
import {
  COLOR_SCHEME,
  SIZE,
  br,
  ph,
  pv,
  opacity,
  FONT,
  WEIGHT,
} from '../../common/common';
import Icon from 'react-native-vector-icons/Ionicons';
import {getElevation} from '../../utils/utils';
import * as Animatable from 'react-native-animatable';
import {DDS} from '../../../App';
export const Search = props => {
  const [colors, setColors] = useState(COLOR_SCHEME);
  const [focus, setFocus] = useState(false);

  const inputRef = createRef();
  return (
    <Animatable.View
      onLayout={e => {
        props.sendHeight(e.nativeEvent.layout.height);
      }}
      transition="opacity"
      duration={200}
      style={{
        opacity: props.hide ? 0 : 1,
      }}>
      <Animatable.View
        transition={[
          'marginTop',
          'borderWidth',
          'marginBottom',
          'paddingVertical',
        ]}
        duration={300}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: DDS.isTab ? '95%' : '90%',
          alignSelf: 'center',
          borderRadius: br,
          borderWidth: props.hide ? 0 : 1.5,
          paddingHorizontal: ph,
          paddingVertical: props.hide
            ? 0
            : Platform.OS == 'ios'
            ? pv - 3
            : pv - 8,
          marginBottom: props.hide ? 0 : 10,
          borderColor: focus ? colors.accent : colors.nav,
          marginTop: props.hide ? -60 : 0,
        }}>
        <TextInput
          ref={inputRef}
          style={{
            fontFamily: WEIGHT.regular,
            color: colors.pri,
            maxWidth: '90%',
            paddingVertical: 10,
            width: '90%',
            fontSize: SIZE.md,
          }}
          onChangeText={props.onChangeText}
          onSubmitEditing={props.onSubmitEditing}
          onFocus={() => {
            setFocus(true);
            props.onFocus;
          }}
          onBlur={() => {
            setFocus(false);
            props.onBlur;
          }}
          numberOfLines={1}
          placeholder={props.placeholder}
          placeholderTextColor={colors.icon}
        />
        <Icon
          style={{paddingRight: DDS.isTab ? '1.25%' : '2.5%'}}
          onPress={() => {
            props.clear();
            props.value.length > 0 ? props.clearSearch() : null;
            inputRef.current.setNativeProps({
              text: '',
            });
          }}
          name={
            props.value && props.value.length > 0 ? 'ios-close' : 'ios-search'
          }
          color={focus ? colors.accent : colors.icon}
          size={SIZE.xl}
        />
      </Animatable.View>
    </Animatable.View>
  );
};
