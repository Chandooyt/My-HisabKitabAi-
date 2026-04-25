import { useEffect, useState } from "react";
import {
  getReminderTime,
  getRemindersEnabled,
  setReminderTime,
  setRemindersEnabled,
} from "@/lib/notifications";
import { requestNotificationPermission } from "@/firebase/messaging";

type Props = {
  open: boolean;
  onClose: () => void;
  uid: string;
};

export function ReminderDialog({ open, onClose, uid }: Props) {
  const [time, setTime] = useState("21:00");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTime(getReminderTime(uid));
    setEnabled(getRemindersEnabled(uid));
    setError(null);
  }, [open, uid]);

  if (!open) return null;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      if (enabled) {
        const perm = await requestNotificationPermission();
        if (perm !== "granted") {
          setError(
            "Please allow notifications in your browser to receive reminders.",
          );
          setSaving(false);
          return;
        }
      }
      setReminderTime(uid, time);
      setRemindersEnabled(uid, enabled);
      onClose();
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
          <h2 className="text-lg font-bold text-emerald-700">
            Reminder settings
          </h2>
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
          Get push notifications for daily reminders, budget warnings, and when
          you cross your limits.
        </p>

        <label className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
          <span className="font-semibold text-emerald-700">
            Enable notifications
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-emerald-600"
            data-testid="toggle-reminders-enabled"
          />
        </label>

        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Daily reminder time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={!enabled}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
            data-testid="input-reminder-time"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll remind you to log your spending at this time each day. Keep
            HisabKitab open in a tab to receive reminders even if your phone is
            locked.
          </p>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
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
            data-testid="button-save-reminder"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
