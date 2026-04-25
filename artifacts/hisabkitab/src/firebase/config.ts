import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getMessaging, type Messaging, isSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "YOUR_API_KEY",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "YOUR_PROJECT_ID",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "YOUR_PROJECT.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "YOUR_APP_ID",
};

export const VAPID_KEY: string =
  (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined) ?? "";

export const isFirebaseConfigured = (): boolean => {
  return (
    !!import.meta.env.VITE_FIREBASE_API_KEY &&
    !!import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    !!import.meta.env.VITE_FIREBASE_APP_ID
  );
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
};

export const getAuthInstance = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
};

export const getDbInstance = (): Firestore => {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
};

export const getMessagingInstance = async (): Promise<Messaging | null> => {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(getFirebaseApp());
  } catch {
    return null;
  }
};
