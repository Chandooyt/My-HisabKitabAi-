import { useEffect, useState } from "react";
import { useAuth } from "@/firebase/auth";
import { setBudget, type Budget, type Expense } from "@/firebase/expenses";
import { CATEGORIES, iconFor } from "@/lib/categories";
import { formatRupees, startOfTodayMs } from "@/lib/format";

type Props = { budget: Budget; expenses: Expense[] };

export function BudgetPage({ budget, expenses }: Props) {
  const { user } = useAuth();
  const [daily, setDaily] = useState<string>("");
  const [perCat, setPerCat] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDaily(budget.daily ? String(budget.daily) : "");
    const m: Record<string, string> = {};
    for (const c of CATEGORIES) {
      m[c] = budget.perCategory[c] ? String(budget.perCategory[c]) : "";
    }
    setPerCat(m);
  }, [budget]);

  const todayStart = startOfTodayMs();
  const spentToday = (cat: string) =>
    expenses
      .filter((e) => e.createdAt >= todayStart && e.category === cat)
      .reduce((a, e) => a + e.amount, 0);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      const dailyNum = Number(daily);
      const newBudget: Budget = {
        daily: dailyNum > 0 ? dailyNum : null,
        perCategory: {},
      };
      for (const [cat, val] of Object.entries(perCat)) {
        const n = Number(val);
        if (n > 0) newBudget.perCategory[cat] = n;
      }
      await setBudget(user.uid, newBudget);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set daily and per-category limits. We'll alert you at 80% and 100%.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900">Daily budget</h3>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">
          The total you want to stay under each day.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-semibold">Rs</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="any"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
            placeholder="e.g. 1000"
            className="flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-base focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
            data-testid="input-daily-budget"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900">Category limits</h3>
        <p className="text-xs text-gray-500 mt-0.5 mb-4">
          Optional per-category caps. Leave blank to skip.
        </p>
        <ul className="space-y-2">
          {CATEGORIES.map((c) => {
            const spent = spentToday(c);
            const limit = Number(perCat[c]);
            const over = limit > 0 && spent > limit;
            return (
              <li
                key={c}
                className="flex items-center gap-3"
                data-testid={`row-cat-${c}`}
              >
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-base shrink-0">
                  {iconFor(c)}
                </div>
                <span className="font-medium text-gray-800 flex-1 min-w-0 truncate">
                  {c}
                </span>
                <span
                  className={`text-xs hidden sm:inline ${over ? "text-red-600 font-semibold" : "text-gray-500"}`}
                >
                  Today: {formatRupees(spent)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Rs</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="any"
                    value={perCat[c] ?? ""}
                    onChange={(e) =>
                      setPerCat((prev) => ({ ...prev, [c]: e.target.value }))
                    }
                    placeholder="—"
                    className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                    data-testid={`input-cat-${c}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2.5 inline-flex items-center gap-2"
          data-testid="button-save-budget"
        >
          {saving ? "Saving..." : "Save budget"}
        </button>
        {success && (
          <span
            className="text-sm text-emerald-700 font-semibold"
            data-testid="text-budget-saved"
          >
            ✓ Saved
          </span>
        )}
      </div>
    </div>
  );
}
