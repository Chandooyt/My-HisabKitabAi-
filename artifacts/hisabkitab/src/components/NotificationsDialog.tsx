import { useEffect, useState } from "react";
import {
  initMessaging,
  requestNotificationPermission,
} from "@/firebase/messaging";
import {
  detectTimezone,
  saveNotificationSettings,
} from "@/firebase/notifications";

type Props = {
  open: boolean;
  onClose: () => void;
  uid: string;
};

export function NotificationsDialog({ open, onClose, uid }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const perm =
      typeof Notification !== "undefined" ? Notification.permission : "default";
    setEnabled(perm === "granted");
    setError(null);
    setSuccess(null);
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      if (enabled) {
        const perm = await requestNotificationPermission();
        if (perm === "unsupported") {
          setError(
            "This browser doesn't support web notifications. Try Chrome, Edge, or Firefox.",
          );
          setSaving(false);
          return;
        }
        if (perm !== "granted") {
          setError(
            "Notifications are blocked. Tap the lock icon in your browser's address bar and allow notifications for this site.",
          );
          setSaving(false);
          return;
        }
        await initMessaging(uid);
      }

      try {
        await saveNotificationSettings(uid, {
          enabled,
          timezone: detectTimezone(),
        });
      } catch {
        // server-side settings save failed; client-side alerts still work
      }

      setSuccess(
        enabled
          ? "Notifications enabled. You'll get an alert when you near or cross your daily and category budgets."
          : "Notifications turned off.",
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-emerald-700">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Get an alert when you reach 80% of a budget and another when you cross
          it — for both your daily limit and any category limits you've set.
        </p>

        <label className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <span className="font-semibold text-emerald-700">
            Enable budget alerts
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-emerald-600"
            data-testid="toggle-notifications-enabled"
          />
        </label>

        {error && (
          <div
            className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"
            data-testid="text-notification-error"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3"
            data-testid="text-notification-success"
          >
            {success}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg py-3 border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg py-3 shadow-sm"
            data-testid="button-save-notifications"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
