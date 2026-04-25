import {
  doc,
  setDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import { getDbInstance } from "./config";

export type NotificationSettings = {
  enabled: boolean;
  reminderTime: string;
  timezone: string;
};

const settingsDoc = (uid: string) =>
  doc(getDbInstance(), "users", uid, "settings", "notifications");

export const saveNotificationSettings = async (
  uid: string,
  settings: NotificationSettings,
) => {
  await setDoc(
    settingsDoc(uid),
    {
      enabled: settings.enabled,
      reminderTime: settings.reminderTime,
      timezone: settings.timezone,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const saveFcmToken = async (uid: string, token: string) => {
  await setDoc(
    settingsDoc(uid),
    {
      fcmTokens: { [token]: true },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const removeFcmToken = async (uid: string, token: string) => {
  await setDoc(
    settingsDoc(uid),
    {
      fcmTokens: { [token]: deleteField() },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const detectTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};
