import { useEffect, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import { setBudget, type Budget } from "@/firebase/expenses";
import { useAuth } from "@/firebase/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  current: Budget;
};

export function BudgetDialog({ open, onClose, current }: Props) {
  const { user } = useAuth();
  const [daily, setDaily] = useState<string>("");
  const [perCategory, setPerCategory] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDaily(current.daily ? String(current.daily) : "");
      const init: Record<string, string> = {};
      for (const c of CATEGORIES) {
        const v = current.perCategory[c];
        init[c] = v && v > 0 ? String(v) : "";
      }
      setPerCategory(init);
      setError(null);
    }
  }, [open, current]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const dailyVal = daily.trim() === "" ? null : Number(daily);
      if (dailyVal !== null && (!Number.isFinite(dailyVal) || dailyVal <= 0)) {
        setError("Daily budget must be greater than 0 or empty.");
        setBusy(false);
        return;
      }
      const cleanedPerCat: Record<string, number> = {};
      for (const [k, v] of Object.entries(perCategory)) {
        if (v.trim() === "") continue;
        const num = Number(v);
        if (Number.isFinite(num) && num > 0) {
          cleanedPerCat[k] = num;
        }
      }
      await setBudget(user.uid, {
        daily: dailyVal,
        perCategory: cleanedPerCat,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save budget.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl border border-emerald-100 max-h-[90vh] overflow-auto"
        data-testid="dialog-budget"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-emerald-700">Set budget</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
              data-testid="button-close-budget"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Daily budget (Rs)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                placeholder="Leave empty for no limit"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="input-daily-budget"
              />
              <p className="text-xs text-gray-500 mt-1">
                Warnings only show when a limit is set.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Per-category daily budget (optional)
              </p>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <div key={c} className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-700">{c}</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={perCategory[c] ?? ""}
                      onChange={(e) =>
                        setPerCategory((prev) => ({
                          ...prev,
                          [c]: e.target.value,
                        }))
                      }
                      placeholder="—"
                      className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid={`input-cat-${c}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold rounded-lg py-3 hover:bg-gray-50"
                data-testid="button-cancel-budget"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg py-3 shadow-sm"
                data-testid="button-save-budget"
              >
                {busy ? "Saving..." : "Save budget"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
