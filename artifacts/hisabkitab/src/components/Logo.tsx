import logoUrl from "@assets/file_0000000036647208be29fa4d970126e5_1777136350500.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt="HisabKitab"
        className="h-10 w-10 rounded-xl object-cover shadow-sm"
      />
      <div className="leading-tight">
        <div className="text-lg font-bold text-emerald-700">HisabKitab</div>
        <div className="text-[11px] text-emerald-600/70 -mt-0.5">
          Expense Tracker
        </div>
      </div>
    </div>
  );
}
