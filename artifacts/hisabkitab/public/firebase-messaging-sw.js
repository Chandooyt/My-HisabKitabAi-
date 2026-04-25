/* global importScripts, firebase */
// Firebase Cloud Messaging Service Worker
// You must replace the config below with your real Firebase config.
// Keep the values in sync with the values you put in your .env file.

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "HisabKitab";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: "/favicon.ico",
  };
  self.registration.showNotification(title, options);
});
