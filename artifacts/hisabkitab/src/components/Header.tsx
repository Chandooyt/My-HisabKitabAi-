import { useState, useEffect, useRef } from "react";
import type { PageId } from "@/components/Sidebar";
import { useAuth } from "@/firebase/auth";

type Props = {
  onMenu: () => void;
  onNavigate: (id: PageId) => void;
  unreadCount: number;
};

export function Header({ onMenu, onNavigate, unreadCount }: Props) {
  const { user, logOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const email = user?.email ?? "";
  const initials = email
    ? email
        .split("@")[0]
        .split(/[._-]/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  const shortName = email.split("@")[0] || "User";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="lg:hidden h-10 w-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700"
          aria-label="Open menu"
          data-testid="button-menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" />
          </svg>
        </button>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-gray-50 border border-gray-100 rounded-full pl-9 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex-1 sm:hidden" />

        <button
          type="button"
          onClick={() => onNavigate("notifications")}
          className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700"
          aria-label="Notifications"
          data-testid="button-bell"
        >
          <span className="text-lg" aria-hidden>
            🔔
          </span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
              data-testid="badge-unread"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-full pl-1 pr-3 py-1"
            data-testid="button-user"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
              {initials}
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline max-w-[120px] truncate">
              {shortName}
            </span>
            <span className="text-gray-400 text-xs hidden sm:inline">▾</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-40">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {shortName}
                </p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("settings");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <span aria-hidden>⚙️</span> Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("plans");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <span aria-hidden>👑</span> Plans
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void logOut();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  data-testid="button-logout"
                >
                  <span aria-hidden>↪</span> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
