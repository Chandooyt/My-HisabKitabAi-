import { Fragment, useMemo, useState } from "react";
import type { Expense } from "@/firebase/expenses";
import { removeExpense } from "@/firebase/expenses";
import { useAuth } from "@/firebase/auth";
import { formatDateTime, formatRupees } from "@/lib/format";
import { CATEGORIES, iconFor } from "@/lib/categories";
import { AdSlot } from "@/components/AdSlot";

type Props = {
  expenses: Expense[];
  isPremium: boolean;
  onAdd: () => void;
};

const AD_AFTER_ROW = 6;

const labelFor = (e: Expense): string =>
  e.category === "Other" && e.customCategory ? e.customCategory : e.category;

export function ExpensesPage({ expenses, isPremium, onAdd }: Props) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = expenses;
    if (filter !== "all") {
      list = list.filter((e) => e.category === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          labelFor(e).toLowerCase().includes(q) ||
          (e.note ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [expenses, filter, search]);

  const total = filtered.reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Expenses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All your tracked expenses, filterable.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm inline-flex items-center gap-2"
          data-testid="button-add-expense-page"
        >
          <span aria-hidden>＋</span> Add Expense
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
            data-testid="input-search-expenses"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700"
            data-testid="select-filter-category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
          <span>
            {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
          </span>
          <span className="font-semibold text-gray-700">
            Total: {formatRupees(total)}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-gray-700 font-medium">No expenses match</p>
            <p className="text-sm text-gray-500">
              Try changing the search or filter.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((e, idx) => (
              <Fragment key={e.id}>
                <li
                  className="py-3 flex items-center justify-between gap-3"
                  data-testid={`row-expense-${e.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-base shrink-0">
                      {iconFor(e.category)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {labelFor(e)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(e.createdAt)}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-gray-900 whitespace-nowrap">
                      {formatRupees(e.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => user && removeExpense(user.uid, e.id)}
                      className="text-gray-400 hover:text-red-600 text-sm"
                      aria-label="Delete expense"
                      data-testid={`button-delete-${e.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
                {idx === AD_AFTER_ROW - 1 && filtered.length > AD_AFTER_ROW && (
                  <li className="py-3">
                    <AdSlot slot="8298734981" isPremium={isPremium} />
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
