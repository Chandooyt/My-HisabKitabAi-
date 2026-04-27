import { useState } from "react";
import { useAuth } from "@/firebase/auth";
import type { Profile } from "@/firebase/profile";
import { setDisplayName } from "@/firebase/profile";
import type { PageId } from "@/components/Sidebar";

type Props = {
  profile: Profile;
  onNavigate: (id: PageId) => void;
};

export function SettingsPage({ profile, onNavigate }: Props) {
  const { user, logOut } = useAuth();
  const [name, setName] = useState(profile.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveName = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await setDisplayName(user.uid, name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Email
            </label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              {user?.email ?? "—"}
            </p>
          </div>
          <div>
            <label
              className="text-xs font-semibold text-gray-600"
              htmlFor="displayName"
            >
              Display name
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                data-testid="input-display-name"
              />
              <button
                type="button"
                onClick={saveName}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg px-4 py-2 text-sm"
                data-testid="button-save-name"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            {saved && (
              <p className="mt-1 text-xs text-emerald-700 font-semibold">
                ✓ Saved
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Plan</h3>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {profile.isPremium ? "👑 Premium" : "Free Plan"}
            </p>
            <p className="text-xs text-gray-500">
              {profile.isPremium
                ? "All features unlocked."
                : "Upgrade to unlock the AI Assistant and more."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("plans")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-4 py-2 whitespace-nowrap"
            data-testid="button-view-plans"
          >
            View plans
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Notifications
        </h3>
        <p className="text-sm text-gray-600">
          Manage budget alerts and push permissions.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("notifications")}
          className="mt-3 text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-lg px-4 py-2"
        >
          View notifications
        </button>
      </section>

      <section className="bg-white border border-red-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-red-700 mb-2">Account</h3>
        <p className="text-sm text-gray-600 mb-3">
          Sign out of your HisabKitab AI account.
        </p>
        <button
          type="button"
          onClick={() => logOut()}
          className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg px-4 py-2 text-sm border border-red-200"
          data-testid="button-settings-logout"
        >
          Log out
        </button>
      </section>
    </div>
  );
}
