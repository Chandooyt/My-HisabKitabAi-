import logoUrl from "@assets/Black_White_Minimalist_Elegant_Monogram_Initial_Logo_20260425__1777135391206.png";

export function ConfigWarning() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-md border border-emerald-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={logoUrl}
            alt="HisabKitab"
            className="h-10 w-10 rounded-full object-cover"
          />
          <h1 className="text-2xl font-bold text-emerald-700">
            Connect Firebase to start
          </h1>
        </div>
        <p className="text-gray-700 mb-4">
          HisabKitab needs your Firebase project credentials. Create a file
          called <code className="bg-emerald-50 px-1 rounded">.env</code> inside{" "}
          <code className="bg-emerald-50 px-1 rounded">
            artifacts/hisabkitab/
          </code>{" "}
          with the following keys:
        </p>
        <pre className="bg-gray-900 text-emerald-100 text-xs rounded-lg p-4 overflow-auto">
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Optional - web push
VITE_FIREBASE_VAPID_KEY=...`}
        </pre>
        <p className="text-gray-700 mt-4">
          Then enable <strong>Email/Password</strong> sign-in and{" "}
          <strong>Firestore</strong> in the Firebase console, and restart the
          dev server. Full instructions are in{" "}
          <code className="bg-emerald-50 px-1 rounded">SETUP.md</code>.
        </p>
      </div>
    </div>
  );
}
