import notifee, { EventType } from '@notifee/react-native';
import NotificationSounds from 'react-native-notification-sounds';
import { Linking } from 'react-native';

export default async function DisplayNotification(data) {
    console.log(data)
  const clickActionUrl = data?.notification?.android?.clickAction;
  await notifee.requestPermission();

  const soundsList = await NotificationSounds.getNotifications('notification');
  const channelId = await notifee.createChannel({
    id: "custom-sound",
    name: "System Sound",
    sound: soundsList[0].url,
    vibration: true,
    vibrationPattern: [300, 500],
  });

  const openLinkAction = {
    title: 'Open Link',
    pressAction: {
      id: 'openLink',
      url: clickActionUrl,
    },
  };
  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
      Linking.openURL(clickActionUrl)
    }
  });
  await notifee.displayNotification({
    title: data.notification.title,
    body: data.notification.body,
    android: {
      smallIcon: 'finallogo',
      largeIcon: require('./assets/finallogo.png'),
      timestamp: data.sentTime,
      showTimestamp: true,
      channelId,
      actions: [openLinkAction],
    },
  });
}



notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'openLink') {
      Linking.openURL(detail.pressAction.url);
    }
  });