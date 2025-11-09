import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// Register background message handler for Firebase
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
