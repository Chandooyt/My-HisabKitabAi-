import { useMemo } from "react";
import type { Expense } from "@/firebase/expenses";
import { CATEGORIES, iconFor } from "@/lib/categories";
import { formatRupees } from "@/lib/format";

type Props = { expenses: Expense[] };

export function CategoriesPage({ expenses }: Props) {
  const stats = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const key =
        e.category === "Other" && e.customCategory ? e.customCategory : e.category;
      const cur = map.get(key) ?? { total: 0, count: 0 };
      map.set(key, { total: cur.total + e.amount, count: cur.count + 1 });
    }
    return map;
  }, [expenses]);

  const customCats = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) {
      if (e.category === "Other" && e.customCategory) {
        set.add(e.customCategory);
      }
    }
    return Array.from(set).sort();
  }, [expenses]);

  const renderRow = (name: string) => {
    const s = stats.get(name) ?? { total: 0, count: 0 };
    return (
      <li
        key={name}
        className="flex items-center justify-between py-3"
        data-testid={`row-category-${name}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-base shrink-0">
            {iconFor(name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500">
              {s.count} {s.count === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>
        <span className="text-base font-bold text-gray-900 whitespace-nowrap">
          {formatRupees(s.total)}
        </span>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Categories
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Spending by category across all time.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-2">
          Built-in categories
        </h3>
        <ul className="divide-y divide-gray-100">
          {CATEGORIES.filter((c) => c !== "Other").map(renderRow)}
        </ul>
      </div>

      {customCats.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Custom categories
          </h3>
          <ul className="divide-y divide-gray-100">
            {customCats.map(renderRow)}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-2">Other</h3>
        <ul className="divide-y divide-gray-100">{renderRow("Other")}</ul>
        <p className="text-xs text-gray-500 mt-3">
          You can add your own category name when logging an expense as "Other".
        </p>
      </div>
    </div>
  );
}
