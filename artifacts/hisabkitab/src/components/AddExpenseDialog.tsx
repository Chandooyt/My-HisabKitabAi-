import { useEffect, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import { addExpense } from "@/firebase/expenses";
import { useAuth } from "@/firebase/auth";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddExpenseDialog({ open, onClose }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setCategory(CATEGORIES[0]);
      setCustomCategory("");
      setNote("");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (category === "Other" && !customCategory.trim()) {
      setError("Please enter a custom category name.");
      return;
    }

    setBusy(true);
    try {
      await addExpense(user.uid, {
        amount: numericAmount,
        category,
        customCategory:
          category === "Other" ? customCategory.trim() : null,
        note: note.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl border border-emerald-100 max-h-[90vh] overflow-auto"
        data-testid="dialog-add-expense"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-emerald-700">Add expense</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
              data-testid="button-close"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Amount (Rs)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
                data-testid="input-amount"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                data-testid="select-category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {category === "Other" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Custom category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Pet supplies"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  data-testid="input-custom-category"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was it for?"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="input-note"
              />
            </div>

            {error && (
              <div
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"
                data-testid="text-error"
              >
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold rounded-lg py-3 hover:bg-gray-50"
                data-testid="button-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg py-3 shadow-sm"
                data-testid="button-save"
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
