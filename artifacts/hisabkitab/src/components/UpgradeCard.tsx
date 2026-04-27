type Props = {
  onUpgrade: () => void;
};

const FEATURES = [
  "AI Assistant",
  "Advanced Insights",
  "Weekly Reports",
  "Export Data",
];

export function UpgradeCard({ onUpgrade }: Props) {
  return (
    <div
      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 relative overflow-hidden"
      data-testid="card-upgrade"
    >
      <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-bl-lg px-2.5 py-1">
        50% OFF
      </div>
      <div className="flex items-center gap-2 mb-2 mt-3">
        <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-base">
          👑
        </div>
        <p className="font-bold text-emerald-800">Upgrade to Premium</p>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-extrabold text-emerald-700">Rs 299</span>
        <span className="text-sm text-gray-400 line-through font-semibold">
          Rs 599
        </span>
        <span className="text-[10px] font-bold text-emerald-700">
          one-time
        </span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Pay once, use forever. Unlock AI Assistant, advanced insights, and
        weekly reports.
      </p>
      <ul className="mt-3 space-y-1.5">
        {FEATURES.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <span className="h-4 w-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg py-2.5 inline-flex items-center justify-center gap-2"
        data-testid="button-upgrade-card"
      >
        <span aria-hidden>👑</span> Upgrade Now
      </button>
    </div>
  );
}
