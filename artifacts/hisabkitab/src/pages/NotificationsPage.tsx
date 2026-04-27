import { useMemo } from "react";
import { useAuth } from "@/firebase/auth";
import {
  clearAllNotifications,
  deleteNotification,
  markAllAsRead,
  markAsRead,
  type NotifLog,
} from "@/firebase/notificationsLog";
import { formatDateTime } from "@/lib/format";

type Props = { notifications: NotifLog[] };

const iconForKind = (kind: string): string => {
  if (kind.includes("over")) return "⚠️";
  if (kind.includes("warn")) return "🔔";
  if (kind.includes("welcome")) return "👋";
  return "🔔";
};

const timeAgo = (ms: number): string => {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDateTime(ms);
};

export function NotificationsPage({ notifications }: Props) {
  const { user } = useAuth();

  const unreadIds = useMemo(
    () => notifications.filter((n) => !n.read).map((n) => n.id),
    [notifications],
  );

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllAsRead(user.uid, unreadIds);
  };

  const handleClearAll = async () => {
    if (!user) return;
    if (typeof window !== "undefined" && !window.confirm("Clear all notifications?")) {
      return;
    }
    await clearAllNotifications(user.uid);
  };

  const handleClick = async (n: NotifLog) => {
    if (!user || n.read) return;
    await markAsRead(user.uid, n.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All your alerts in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadIds.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-2"
              data-testid="button-mark-all-read"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-2"
              data-testid="button-clear-all"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-5xl mb-3">🔕</div>
            <p className="text-gray-700 font-semibold">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">
              We'll alert you when you near or cross your budgets.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`px-4 sm:px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 ${
                  !n.read ? "bg-emerald-50/30" : ""
                }`}
                onClick={() => handleClick(n)}
                data-testid={`notif-${n.id}`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-base shrink-0 ${
                    n.read
                      ? "bg-gray-100 text-gray-500"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {iconForKind(n.kind)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {n.title}
                    </p>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 leading-snug">
                    {n.body}
                  </p>
                </div>
                {!n.read && (
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0"
                    aria-label="unread"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user) void deleteNotification(user.uid, n.id);
                  }}
                  className="text-gray-300 hover:text-red-500 text-sm"
                  aria-label="Delete notification"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
