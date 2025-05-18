import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Must use physical device for notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Permission denied", "Push notification permission is required.");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo Push Token:", token);
  return token;
}

export async function scheduleReminderNotification(time, message) {
  const trigger = new Date(time);
  if (trigger < new Date()) {
    trigger.setDate(trigger.getDate() + 1); 
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "MedRem Reminder 💊",
      body: message,
      sound: true,
    },
    trigger,
  });
}
