import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Budget, Expense } from "@/firebase/expenses";
import {
  computeInsights,
  computeWeeklySummary,
  categoryTotalsLast7Days,
} from "@/lib/insights";
import { formatRupees } from "@/lib/format";
import { iconFor } from "@/lib/categories";
import { PremiumLock } from "@/components/PremiumLock";
import type { PageId } from "@/components/Sidebar";

type Props = {
  expenses: Expense[];
  budget: Budget;
  isPremium: boolean;
  onNavigate: (id: PageId) => void;
};

export function InsightsPage({ expenses, budget, isPremium, onNavigate }: Props) {
  const insights = useMemo(
    () => computeInsights(expenses, budget),
    [expenses, budget],
  );
  const weekly = useMemo(() => computeWeeklySummary(expenses), [expenses]);
  const cats = useMemo(() => categoryTotalsLast7Days(expenses), [expenses]);

  const visibleInsights = isPremium ? insights : insights.slice(0, 2);
  const lockedCount = insights.length - visibleInsights.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Insights
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Patterns and trends in your spending.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Smart insights
        </h3>
        <ul className="space-y-2">
          {visibleInsights.map((i) => (
            <li
              key={i.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                i.tone === "good"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : i.tone === "warn"
                    ? "bg-amber-50 border-amber-100 text-amber-800"
                    : "bg-sky-50 border-sky-100 text-sky-800"
              }`}
              data-testid={`insight-${i.id}`}
            >
              <span className="text-lg leading-tight" aria-hidden>
                {i.icon}
              </span>
              <span className="leading-snug">{i.text}</span>
            </li>
          ))}
        </ul>
        {!isPremium && lockedCount > 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-800">
                🔒 {lockedCount} more {lockedCount === 1 ? "insight" : "insights"} locked
              </p>
              <p className="text-xs text-amber-700/90 mt-0.5">
                Upgrade to see your full spending intelligence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("plans")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-4 py-2 whitespace-nowrap"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {isPremium ? (
        <>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
              This week
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <span className="text-3xl sm:text-4xl font-bold">
                {formatRupees(weekly.thisWeekTotal)}
              </span>
              {weekly.diffPct !== null && (
                <span className="text-xs font-semibold rounded-full px-2 py-1 bg-white/15">
                  {weekly.diffPct > 0 ? "↑" : weekly.diffPct < 0 ? "↓" : "•"}{" "}
                  {Math.abs(weekly.diffPct)}% vs last week
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-emerald-50/95">{weekly.message}</p>
            {weekly.topCategory && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">
                <span aria-hidden>{iconFor(weekly.topCategory.name)}</span>
                Top: {weekly.topCategory.name} ·{" "}
                {formatRupees(weekly.topCategory.amount)}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Top categories (last 7 days)
            </h3>
            {cats.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                Log expenses to see your top categories.
              </p>
            ) : (
              <div className="h-64 -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cats}
                    margin={{ top: 5, right: 12, bottom: 0, left: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid stroke="#f3f4f6" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#374151"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(v: number) => formatRupees(v)}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #d1fae5",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      ) : (
        <PremiumLock
          title="Weekly summary & advanced charts"
          description="See this week vs last week, top category trends, and detailed bar charts. Available on Premium."
          onUpgrade={() => onNavigate("plans")}
        />
      )}
    </div>
  );
}
