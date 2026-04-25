import logoUrl from "@assets/Black_White_Minimalist_Elegant_Monogram_Initial_Logo_20260425__1777135391206.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt="HisabKitab"
        className="h-10 w-10 rounded-full object-cover shadow-sm"
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
