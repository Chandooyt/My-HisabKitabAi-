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
  apiKey: "AIzaSyANVP33CBfVa7dZ_2ssR0uF5jCqC0dGMGk",
  authDomain: "hisabkitab-5db94.firebaseapp.com",
  projectId: "hisabkitab-5db94",
  storageBucket: "hisabkitab-5db94.firebasestorage.app",
  messagingSenderId: "785345266180",
  appId: "1:785345266180:web:bf18ea5402f67a9dbb6b51",
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
