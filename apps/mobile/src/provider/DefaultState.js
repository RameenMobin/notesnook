export const defaultState = {
  isMenuOpen: {
    current: false,
  },
  selectionMode: false,
  selectedItemsList: [],
  notes: [],
  notebooks: [],
  trash: [],
  favorites: [],
  syncing: false,
  pinned: {
    notes: [],
    notebooks: [],
  },
  tags: [],
  colorNotes: [],
  user: null,
  fullscreen:false,
  premiumUser: true,
  settings: {
    showToolbarOnTop: false,
    showKeyboardOnOpen: false,
    fontScale: 1,
    forcePortraitOnTablet: false,
    useSystemTheme: false,
    reminder: 'off',
    encryptedBackups: false,
    homepage: 'Notes',
    sort: 'default',
    sortOrder: 'des',
    screenshotMode: true,
    privacyScreen: false,
  },
  currentScreen: 'notes',
  deviceMode:null,
  colors: {
    night: false,
    bg: 'white',
    fg: '#0560FF',
    navbg: '#f6fbfc',
    nav: '#f0f0f0',
    pri: 'black',
    sec: 'white',
    accent: '#0560FF',
    shade: '#0560FF12',
    normal: 'black',
    icon: 'gray',
    errorBg: '#FFD2D2',
    errorText: '#D8000C',
    successBg: '#DFF2BF',
    successText: '#4F8A10',
    warningBg: '#FEEFB3',
    warningText: '#9F6000',
  },
  preventDefaultMargins: false,
  isLoginNavigator: false,
  currentEditingNote: null,
  loading: true,
  searchResults: [],
  headerMenuState: true,
  headerTextState: {
    heading: 'Notes',
    color: null,
  },
  headerVerticalMenu: false,
  searchState: {
    data: [],
    type: 'notes',
    placeholder: 'Search all notes',
  },
  containerBottomButton: {
    onPress: () => {},
  },
  messageBoardState: {
    visible: false,
    message: null,
    actionText: null,
    onPress: () => {},
    data: {},
    icon: 'account-outline',
  },
  keyword: [],
  menuPins:[],
  lastSynced:"Never"
};
