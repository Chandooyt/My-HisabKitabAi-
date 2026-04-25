# HisabKitab — Firebase Setup

HisabKitab uses Firebase for authentication, data storage, and push notifications.
Follow these steps once to connect your own Firebase project.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** and follow the wizard.
3. Inside the project, go to **Build → Authentication → Get started** and enable
   **Email/Password** as a sign-in method.
4. Go to **Build → Firestore Database → Create database** and start in
   **production mode** (or test mode while developing).

## 2. Get your web app config

1. In the Firebase console go to **Project settings** (gear icon).
2. Scroll to **Your apps** and click the web icon `</>` to register a web app.
3. Copy the `firebaseConfig` object that Firebase shows you.

## 3. Add the values to this project

Create a file named `.env` inside `artifacts/hisabkitab/` (next to `package.json`)
with these keys (copy `.env.example` as a starting point):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Restart the dev server after saving so Vite picks up the new variables.

## 4. (Optional) Enable web push notifications

1. In Firebase console go to **Project settings → Cloud Messaging**.
2. Under **Web configuration → Web Push certificates**, click **Generate key pair**.
3. Copy the public key and add it to your `.env`:

   ```
   VITE_FIREBASE_VAPID_KEY=...
   ```

4. Open `public/firebase-messaging-sw.js` and replace the placeholder
   `firebaseConfig` values with the same values you put in `.env`.
   (Service workers cannot read Vite env variables, so this file needs the values
   inlined.)

## 5. Firestore security rules

Use these rules so each user can only access their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 6. (Optional) Server-side push notifications via Cloud Functions

The app already shows reminders, budget warnings, and budget-crossed alerts
when HisabKitab is open in a browser tab. To deliver them as **real push
notifications even when the app is closed**, deploy the included Cloud
Functions to your Firebase project.

### Requirements

1. Firebase project must be on the **Blaze (pay-as-you-go) plan** — scheduled
   functions and FCM at scale require Blaze. Free usage limits still apply
   and HisabKitab traffic should fit comfortably within them for personal use.
2. Install the Firebase CLI: `npm install -g firebase-tools`
3. Log in: `firebase login`
4. Make sure you completed step 4 above (web push VAPID key).

### Deploy

From the `artifacts/hisabkitab/` directory:

```
cd functions
npm install
cd ..
firebase use hisabkitab-5db94    # or your own project ID
firebase deploy --only functions,firestore:rules
```

This deploys one function:

- **`onExpenseCreated`** — runs when a new expense is added; sends a push
  warning at 80% of the daily / category budget and an alert when crossed.

### How the client connects

When users tap **🔔 Alerts**, enable notifications, and save, the app:

- Stores their FCM web push token under
  `users/{uid}/settings/notifications.fcmTokens`
- Stores enabled flag and timezone in the same doc
- The deployed function reads these and sends push messages to those tokens.

Tokens that become invalid (uninstalled / cleared browsers) are pruned
automatically by the function.

## 7. (Optional) AdSense

The app reserves space for AdSense banners at the top and bottom of the dashboard.
To activate them:

1. Open `index.html` and uncomment the AdSense `<script>` tag, replacing
   `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID.
2. In `src/components/AdBanner.tsx`, replace `data-ad-client` and
   `data-ad-slot` placeholders with your real values.

That's it — you're ready to run HisabKitab.
