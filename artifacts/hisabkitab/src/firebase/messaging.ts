import { getToken, onMessage } from "firebase/messaging";
import { getMessagingInstance, VAPID_KEY } from "./config";
import { saveFcmToken } from "./notifications";

export const requestNotificationPermission = async (): Promise<
  "granted" | "denied" | "default" | "unsupported"
> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const result = await Notification.requestPermission();
  return result;
};

export const initMessaging = async (uid?: string): Promise<string | null> => {
  if (!VAPID_KEY) return null;
  const messaging = await getMessagingInstance();
  if (!messaging) return null;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
    const registration = await navigator.serviceWorker.register(swUrl);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "HisabKitab";
      const body = payload.notification?.body ?? "";
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    });

    if (token && uid) {
      try {
        await saveFcmToken(uid, token);
      } catch {
        // ignore — token will retry next session
      }
    }

    return token ?? null;
  } catch {
    return null;
  }
};

export const showLocalNotification = (title: string, body: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    // ignore
  }
};
