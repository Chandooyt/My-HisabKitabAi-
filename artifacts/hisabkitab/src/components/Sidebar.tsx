import { Logo } from "@/components/Logo";

export type PageId =
  | "dashboard"
  | "expenses"
  | "categories"
  | "budget"
  | "insights"
  | "assistant"
  | "plans"
  | "payment"
  | "notifications"
  | "settings";

type Item = {
  id: PageId;
  label: string;
  icon: string;
  premium?: boolean;
};

const ITEMS: Item[] = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "expenses", label: "Expenses", icon: "🧾" },
  { id: "categories", label: "Categories", icon: "🗂️" },
  { id: "budget", label: "Budget", icon: "💼" },
  { id: "insights", label: "Insights", icon: "📊" },
  { id: "assistant", label: "AI Assistant", icon: "🤖", premium: true },
  { id: "plans", label: "Plans", icon: "👑" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

type Props = {
  active: PageId;
  onNavigate: (id: PageId) => void;
  isPremium: boolean;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ active, onNavigate, isPremium, open, onClose }: Props) {
  const click = (id: PageId) => {
    onNavigate(id);
    onClose();
  };

  const content = (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      <div className="px-5 py-5 border-b border-gray-100">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => click(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
              data-testid={`nav-${item.id}`}
            >
              <span aria-hidden className="text-base">
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.premium && !isPremium && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  PRO
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div
          className={`rounded-2xl p-4 text-center ${
            isPremium
              ? "bg-amber-50 border border-amber-200"
              : "bg-emerald-50 border border-emerald-100"
          }`}
        >
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
            Current Plan
          </p>
          <p
            className={`text-base font-bold mt-1 ${
              isPremium ? "text-amber-700" : "text-emerald-700"
            }`}
            data-testid="text-current-plan"
          >
            {isPremium ? "Premium" : "Free Plan"}
          </p>
          {!isPremium && (
            <>
              <p className="text-xs text-gray-600 mt-1 leading-snug">
                Upgrade to unlock all features.
              </p>
              <button
                type="button"
                onClick={() => click("payment")}
                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg py-2 inline-flex items-center justify-center gap-1"
                data-testid="button-sidebar-upgrade"
              >
                <span aria-hidden>👑</span> Upgrade Now
              </button>
            </>
          )}
          {isPremium && (
            <p className="text-xs text-amber-700/80 mt-1">
              All features unlocked.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {content}
      </aside>
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85%] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
