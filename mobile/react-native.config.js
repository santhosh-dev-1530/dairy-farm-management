module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/'],
  dependencies: {
    '@react-native-firebase/app': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-firebase/app/android',
          packageImportPath: 'import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;',
        },
        ios: {
          podspecPath: '../node_modules/@react-native-firebase/app/ReactNativeFirebaseApp.podspec',
        },
      },
    },
    '@react-native-firebase/messaging': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-firebase/messaging/android',
          packageImportPath: 'import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingPackage;',
        },
        ios: {
          podspecPath: '../node_modules/@react-native-firebase/messaging/ReactNativeFirebaseMessaging.podspec',
        },
      },
    },
  },
};

