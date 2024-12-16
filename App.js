import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { EventType } from '@notifee/react-native';
import { store, persistor } from './src/Redux/store';
import Navigation from './src/Navigations/Navigation';
// import NotificationSounds from 'react-native-notification-sounds';
import { Linking } from 'react-native';

function App() {
  // useEffect(() => {
  //   notifee.onBackgroundEvent(async ({type, detail}) => {
  //     console.log(`Background event type: ${type}`, detail);
  //   });
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     DisplayNotification(remoteMessage);
  //   });

  //   return unsubscribe;
  // }, []);

  // const DisplayNotification = async (data) => {
  //   const clickActionUrl = data?.notification?.android?.clickAction;
  //   await notifee.requestPermission();
  //   const soundsList = await NotificationSounds.getNotifications('notification');
  //   const channelId = await notifee.createChannel({
  //     id: "custom-sound",
  //     name: "System Sound",
  //     sound: soundsList[0].url,
  //     vibration: true,
  //     vibrationPattern: [300, 500],
  //   });

  //   // Define the action to open the link
  //   const openLinkAction = {
  //     title: 'Open Link',
  //     pressAction: {
  //       id: 'openLink',
  //       url: clickActionUrl,
  //     },
  //   };
  //   notifee.onForegroundEvent(({ type, detail }) => {
  //     if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
  //       Linking.openURL(clickActionUrl)
  //     }
  //   });

  //   await notifee.displayNotification({
  //     title: data.notification.title,
  //     body: data.notification.body,
  //     android: {
  //       smallIcon: 'finallogo', 
  //       largeIcon: require("./src/assets/finallogo.png"),
  //       timestamp: data.sentTime,
  //       showTimestamp: true,
  //       channelId,
  //       actions: [openLinkAction],
  //     },
  //   });
  // };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Navigation />
      </PersistGate>
    </Provider>
  );
}

export default App;
