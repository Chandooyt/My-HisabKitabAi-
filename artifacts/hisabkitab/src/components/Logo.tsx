export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
        H
      </div>
      <div className="leading-tight">
        <div className="text-lg font-bold text-emerald-700">HisabKitab</div>
        <div className="text-[11px] text-emerald-600/70 -mt-0.5">
          Expense Tracker
        </div>
      </div>
    </div>
  );
}
