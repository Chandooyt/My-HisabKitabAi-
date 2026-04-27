type Props = {
  title: string;
  description: string;
  onUpgrade: () => void;
};

export function PremiumLock({ title, description, onUpgrade }: Props) {
  return (
    <div
      className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 text-center max-w-xl mx-auto"
      data-testid="premium-lock"
    >
      <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
        🔒
      </div>
      <h2 className="mt-4 text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-6 py-3 inline-flex items-center gap-2"
        data-testid="button-lock-upgrade"
      >
        <span aria-hidden>👑</span> Upgrade to Premium
      </button>
    </div>
  );
}
