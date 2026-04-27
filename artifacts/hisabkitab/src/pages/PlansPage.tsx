import { useState } from "react";
import { useAuth } from "@/firebase/auth";
import { setPremium } from "@/firebase/profile";

type Props = { isPremium: boolean };

const FREE_FEATURES = [
  "Basic expense tracking",
  "Daily budget & category limits",
  "Basic dashboard",
  "Limited insights (top 2)",
  "Push notifications for budgets",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "AI Assistant chat",
  "Full smart insights",
  "Weekly summary & comparisons",
  "Advanced charts and analytics",
  "Priority support",
];

export function PlansPage({ isPremium }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const upgrade = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await setPremium(user.uid, true);
    } finally {
      setBusy(false);
    }
  };

  const downgrade = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await setPremium(user.uid, false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs sm:text-sm font-bold rounded-full px-4 py-1.5 shadow-md animate-pulse"
          data-testid="banner-50-off"
        >
          <span aria-hidden>🔥</span>
          50% OFF — Limited Time Offer
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
          Choose your plan
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
          Start free and unlock everything with a one-time payment. No monthly
          fees. No subscriptions. Pay once, use forever.
        </p>
      </div>

      {isPremium && (
        <div
          className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4"
          data-testid="banner-premium-active"
        >
          <div className="h-12 w-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl">
            👑
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800">You are on Premium Plan</p>
            <p className="text-sm text-amber-700/90">
              All features are unlocked. Thank you for your support!
            </p>
          </div>
          <button
            type="button"
            onClick={downgrade}
            disabled={busy}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
            data-testid="button-downgrade"
          >
            Switch to Free
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <div
          className={`rounded-2xl border p-6 bg-white shadow-sm ${
            !isPremium ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-200"
          }`}
          data-testid="card-plan-free"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Free</h2>
            {!isPremium && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-1">
                CURRENT
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">For getting started</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            Rs 0
            <span className="text-sm font-medium text-gray-500"> forever</span>
          </p>
          <ul className="mt-5 space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="h-5 w-5 mt-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center shrink-0">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled
            className="mt-6 w-full bg-gray-100 text-gray-500 font-semibold rounded-lg py-2.5 cursor-default"
          >
            {isPremium ? "Use Switch to Free above" : "Your current plan"}
          </button>
        </div>

        <div
          className={`rounded-2xl border p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md relative overflow-hidden ${
            isPremium ? "ring-2 ring-amber-300" : ""
          }`}
          data-testid="card-plan-premium"
        >
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-bl-lg px-3 py-1">
            RECOMMENDED
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Premium</h2>
            {isPremium && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-300 rounded-full px-2 py-1">
                CURRENT
              </span>
            )}
          </div>
          <p className="text-sm text-emerald-100 mt-1">
            For serious money management
          </p>
          <div className="mt-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-extrabold" data-testid="text-price-now">
                Rs 299
              </span>
              <span
                className="text-lg font-semibold text-emerald-200/80 line-through decoration-2"
                data-testid="text-price-old"
              >
                Rs 599
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-1">
                SAVE 50%
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-100">
              One-time payment · Lifetime access
            </p>
          </div>
          <ul className="mt-5 space-y-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="h-5 w-5 mt-0.5 rounded-full bg-white text-emerald-700 text-xs flex items-center justify-center shrink-0">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <button
              type="button"
              disabled
              className="mt-6 w-full bg-white/20 text-white font-semibold rounded-lg py-2.5 cursor-default"
            >
              You are on Premium Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={upgrade}
              disabled={busy}
              className="mt-6 w-full bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-lg py-2.5 inline-flex items-center justify-center gap-2"
              data-testid="button-upgrade-plan"
            >
              <span aria-hidden>👑</span>
              {busy ? "Upgrading..." : "Upgrade to Premium"}
            </button>
          )}
        </div>
      </div>

      <div className="text-center space-y-1 max-w-md mx-auto">
        <p className="text-sm font-semibold text-gray-700">
          ⏳ Limited time offer — price goes back to Rs 599 soon.
        </p>
        <p className="text-xs text-gray-400">
          Demo: clicking "Upgrade" toggles your plan instantly. Connect a
          payment provider to charge real money.
        </p>
      </div>
    </div>
  );
}
