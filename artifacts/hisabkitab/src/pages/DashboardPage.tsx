import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Expense } from "@/firebase/expenses";
import type { NotifLog } from "@/firebase/notificationsLog";
import { formatRupees, formatDateTime, startOfTodayMs } from "@/lib/format";
import { iconFor } from "@/lib/categories";
import {
  categoryTotalsLast7Days,
  dailyTotalsLast7Days,
} from "@/lib/insights";
import { UpgradeCard } from "@/components/UpgradeCard";
import { AdSlot } from "@/components/AdSlot";
import type { PageId } from "@/components/Sidebar";

type Props = {
  expenses: Expense[];
  monthlyTotal: number;
  notifications: NotifLog[];
  isPremium: boolean;
  onNavigate: (id: PageId) => void;
  onAddExpense: () => void;
  onResetMonth: () => void | Promise<void>;
};

const PIE_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#fbbf24", "#60a5fa", "#a78bfa"];

const labelFor = (e: Expense): string =>
  e.category === "Other" && e.customCategory ? e.customCategory : e.category;

const monthName = (): string =>
  new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

export function DashboardPage({
  expenses,
  monthlyTotal,
  notifications,
  isPremium,
  onNavigate,
  onAddExpense,
  onResetMonth,
}: Props) {
  const todayStart = startOfTodayMs();

  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.createdAt >= todayStart),
    [expenses, todayStart],
  );

  const todayTotal = todayExpenses.reduce((a, e) => a + e.amount, 0);

  const recent = expenses.slice(0, 5);

  const handleResetMonth = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        `Reset all expenses for ${monthName()}?\n\nThis will set your "Total Expenses (This Month)" back to Rs 0. Your individual expense history is NOT deleted. Use this when the month is over to start fresh.`,
      )
    ) {
      void onResetMonth();
    }
  };

  const cats = useMemo(() => categoryTotalsLast7Days(expenses), [expenses]);
  const totalCats = cats.reduce((a, c) => a + c.total, 0);
  const pieData = cats.map((c) => ({
    name: c.name,
    value: c.total,
    pct: totalCats > 0 ? Math.round((c.total / totalCats) * 100) : 0,
  }));

  const dailyTrend = useMemo(() => dailyTotalsLast7Days(expenses), [expenses]);

  const recentNotifications = notifications.slice(0, 3);
  const userGreeting = "Welcome back! Here's your financial overview.";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">{userGreeting}</p>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm inline-flex items-center gap-2"
          data-testid="button-add-expense-header"
        >
          <span aria-hidden>＋</span> Add Expense
        </button>
      </div>

      <AdSlot slot="7037624203" isPremium={isPremium} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {monthName()} overview
              </p>
              <button
                type="button"
                onClick={handleResetMonth}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1"
                data-testid="button-reset-month"
                title="Clear this month's total — use when the month is over"
              >
                <span aria-hidden>🗑️</span> Reset Month Expense
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatCard
                title="Total Expenses"
                subtitle="This Month"
                value={formatRupees(monthlyTotal)}
                footer="Cumulative — only resets when you tap Reset"
                icon="💵"
                testid="stat-month-total"
              />
              <StatCard
                title="Today's Expenses"
                subtitle="Today"
                value={formatRupees(todayTotal)}
                footer={`${todayExpenses.length} ${todayExpenses.length === 1 ? "item" : "items"}`}
                icon="🧾"
                testid="stat-today"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Recent Expenses" right={
              <button
                type="button"
                onClick={() => onNavigate("expenses")}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View All
              </button>
            }>
              {recent.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">
                  No expenses yet. Tap "Add Expense" to start.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recent.map((e) => (
                    <li
                      key={e.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                      data-testid={`row-recent-${e.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-base shrink-0">
                          {iconFor(e.category)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {labelFor(e)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(e.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatRupees(e.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Top Categories">
              {pieData.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">
                  Log expenses to see category breakdown.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={42}
                          outerRadius={70}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => formatRupees(v)}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #d1fae5",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="flex-1 space-y-1.5 min-w-0">
                    {pieData.slice(0, 5).map((p, i) => (
                      <li
                        key={p.name}
                        className="flex items-center justify-between text-xs gap-2"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="truncate text-gray-700 font-medium">
                            {p.name}
                          </span>
                        </span>
                        <span className="text-gray-600 font-semibold shrink-0">
                          {p.pct}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>

          <Card title="Expense Trend" subtitle="Last 7 days">
            <div className="h-56 -ml-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyTrend}
                  margin={{ top: 5, right: 12, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                    }
                  />
                  <Tooltip
                    formatter={(v: number) => formatRupees(v)}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #d1fae5",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ fill: "#059669", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card
            title="Notifications"
            right={
              <button
                type="button"
                onClick={() => onNavigate("notifications")}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View All
              </button>
            }
          >
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                You're all caught up.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentNotifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3"
                    data-testid={`notif-preview-${n.id}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        n.read
                          ? "bg-gray-100 text-gray-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {n.kind.includes("over") ? "⚠️" : n.kind.includes("warn") ? "🔔" : "✓"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {n.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate("notifications")}
                className="mt-4 w-full text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-lg py-2"
              >
                Go to Notifications
              </button>
            )}
          </Card>

          {!isPremium && <UpgradeCard onUpgrade={() => onNavigate("payment")} />}
          {isPremium && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <div className="h-10 w-10 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center text-lg">
                👑
              </div>
              <p className="mt-2 font-bold text-amber-800">You're on Premium</p>
              <p className="text-xs text-amber-700/80 mt-1">
                All features unlocked. Thank you!
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  title,
  subtitle,
  value,
  footer,
  icon,
  testid,
}: {
  title: string;
  subtitle: string;
  value: string;
  footer: string;
  icon: string;
  testid: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      data-testid={testid}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500">{title}</p>
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-base shrink-0">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{footer}</p>
    </div>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
