import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { AdBanner } from "@/components/AdBanner";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { BudgetDialog } from "@/components/BudgetDialog";
import { NotificationsDialog } from "@/components/NotificationsDialog";
import { useAuth } from "@/firebase/auth";
import {
  subscribeBudget,
  subscribeExpenses,
  removeExpense,
  type Budget,
  type Expense,
} from "@/firebase/expenses";
import {
  endOfTodayMs,
  formatDateTime,
  formatRupees,
  startOfTodayMs,
} from "@/lib/format";
import {
  initMessaging,
  requestNotificationPermission,
  showLocalNotification,
} from "@/firebase/messaging";
import { VAPID_KEY } from "@/firebase/config";
import { fireOnce } from "@/lib/notifications";

export function DashboardPage() {
  const { user, logOut } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({ daily: null, perCategory: {} });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubExp = subscribeExpenses(
      user.uid,
      (items) => {
        setExpenses(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    const unsubBud = subscribeBudget(
      user.uid,
      (b) => setBudget(b),
      (err) => setError(err.message),
    );
    return () => {
      unsubExp();
      unsubBud();
    };
  }, [user]);

  const todayExpenses = useMemo(() => {
    const start = startOfTodayMs();
    const end = endOfTodayMs();
    return expenses.filter(
      (e) => e.createdAt >= start && e.createdAt <= end,
    );
  }, [expenses]);

  const todayTotal = useMemo(
    () => todayExpenses.reduce((acc, e) => acc + e.amount, 0),
    [todayExpenses],
  );

  const budgetStatus = useMemo(() => {
    if (!budget.daily) return null;
    if (todayTotal > budget.daily) return "over" as const;
    if (todayTotal === budget.daily) return "equal" as const;
    return "under" as const;
  }, [budget.daily, todayTotal]);

  useEffect(() => {
    if (!user || permission !== "granted") return;
    if (!budget.daily) return;
    const ratio = todayTotal / budget.daily;
    if (ratio >= 1) {
      fireOnce(
        user.uid,
        "daily-over",
        "Budget crossed",
        `You crossed today's budget of ${formatRupees(budget.daily)}. Spent ${formatRupees(todayTotal)}.`,
      );
    } else if (ratio >= 0.8) {
      fireOnce(
        user.uid,
        "daily-warn",
        "Budget warning",
        `You've used ${Math.round(ratio * 100)}% of today's ${formatRupees(budget.daily)} budget.`,
      );
    }
  }, [user, permission, budget.daily, todayTotal]);

  useEffect(() => {
    if (!user || permission !== "granted") return;
    const cats = Object.entries(budget.perCategory);
    if (cats.length === 0) return;
    for (const [cat, limit] of cats) {
      if (!limit || limit <= 0) continue;
      const spent = todayExpenses
        .filter((e) => e.category === cat)
        .reduce((a, e) => a + e.amount, 0);
      const ratio = spent / limit;
      if (ratio >= 1) {
        fireOnce(
          user.uid,
          `cat-over-${cat}`,
          `${cat} budget crossed`,
          `Spent ${formatRupees(spent)} on ${cat} (limit ${formatRupees(limit)}).`,
        );
      } else if (ratio >= 0.8) {
        fireOnce(
          user.uid,
          `cat-warn-${cat}`,
          `${cat} nearing limit`,
          `${Math.round(ratio * 100)}% of your ${cat} budget used (${formatRupees(spent)} of ${formatRupees(limit)}).`,
        );
      }
    }
  }, [user, permission, budget.perCategory, todayExpenses]);

  const askPermission = async () => {
    const result = await requestNotificationPermission();
    if (result === "unsupported") {
      setPermission("unsupported");
      return;
    }
    setPermission(result);
    if (result === "granted") {
      await initMessaging(user?.uid);
      showLocalNotification(
        "Notifications enabled",
        "We'll remind you to log your expenses.",
      );
    }
  };

  const smartMessage = useMemo(() => {
    if (todayTotal === 0) return "No spending today. Good job!";
    return `You spent ${formatRupees(todayTotal)} today`;
  }, [todayTotal]);

  return (
    <div className="min-h-screen bg-emerald-50/40">
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotifications(true)}
              className="text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-2 inline-flex items-center gap-1"
              data-testid="button-notification-settings"
              aria-label="Notification settings"
              title="Notification settings"
            >
              <span aria-hidden>🔔</span>
              <span className="hidden sm:inline">Alerts</span>
            </button>
            <button
              type="button"
              onClick={() => logOut()}
              className="text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              data-testid="button-logout"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-32">
        <AdBanner placement="top" />

        <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 mb-4">
          <p className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wide">
            Today's spending
          </p>
          <div
            className="mt-2 text-4xl sm:text-5xl font-bold text-emerald-700"
            data-testid="text-today-total"
          >
            {formatRupees(todayTotal)}
          </div>
          <p className="mt-3 text-base text-gray-700" data-testid="text-smart-message">
            {smartMessage}
          </p>

          <div className="mt-5">
            {budget.daily ? (
              <div
                className={`rounded-xl p-4 text-base font-semibold ${
                  budgetStatus === "over"
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : budgetStatus === "equal"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
                data-testid="text-budget-status"
              >
                {budgetStatus === "over" &&
                  `You crossed your budget. Limit ${formatRupees(budget.daily)}.`}
                {budgetStatus === "equal" &&
                  `You reached your budget of ${formatRupees(budget.daily)}.`}
                {budgetStatus === "under" &&
                  `You are under your budget of ${formatRupees(budget.daily)}.`}
              </div>
            ) : (
              <div className="rounded-xl p-4 bg-gray-50 border border-gray-100 text-sm text-gray-600">
                Set a daily budget to see spending alerts.
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg py-3 shadow-sm"
              data-testid="button-add-expense"
            >
              + Add expense
            </button>
            <button
              type="button"
              onClick={() => setShowBudget(true)}
              className="bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-lg py-3 border border-emerald-200"
              data-testid="button-set-budget"
            >
              Set budget
            </button>
          </div>
        </section>

        {budget.daily && Object.keys(budget.perCategory).length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 mb-4">
            <p className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wide mb-3">
              Category limits today
            </p>
            <ul className="space-y-2">
              {Object.entries(budget.perCategory).map(([cat, limit]) => {
                const spent = todayExpenses
                  .filter((e) => e.category === cat)
                  .reduce((a, e) => a + e.amount, 0);
                const over = spent > limit;
                const equal = spent === limit;
                return (
                  <li
                    key={cat}
                    className="flex items-center justify-between text-sm"
                    data-testid={`row-cat-budget-${cat}`}
                  >
                    <span className="font-medium text-gray-700">{cat}</span>
                    <span
                      className={
                        over
                          ? "text-red-700 font-semibold"
                          : equal
                            ? "text-amber-700 font-semibold"
                            : "text-emerald-700 font-semibold"
                      }
                    >
                      {formatRupees(spent)} / {formatRupees(limit)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wide">
              Today's expenses
            </p>
            <span className="text-xs text-gray-500" data-testid="text-count">
              {todayExpenses.length}{" "}
              {todayExpenses.length === 1 ? "item" : "items"}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm py-6 text-center">Loading...</p>
          ) : error ? (
            <p
              className="text-red-600 text-sm py-6 text-center"
              data-testid="text-list-error"
            >
              {error}
            </p>
          ) : todayExpenses.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-gray-700 font-medium">Nothing logged yet</p>
              <p className="text-gray-500 text-sm">
                Tap "+ Add expense" to start tracking.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todayExpenses.map((e) => (
                <li
                  key={e.id}
                  className="py-3 flex items-center justify-between gap-3"
                  data-testid={`row-expense-${e.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {e.category === "Other" && e.customCategory
                        ? e.customCategory
                        : e.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(e.createdAt)}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-emerald-700 whitespace-nowrap">
                      {formatRupees(e.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => user && removeExpense(user.uid, e.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                      aria-label="Delete expense"
                      data-testid={`button-delete-${e.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {expenses.length > todayExpenses.length && (
          <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 mt-4">
            <p className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wide mb-3">
              Earlier
            </p>
            <ul className="divide-y divide-gray-100">
              {expenses
                .filter((e) => !todayExpenses.find((t) => t.id === e.id))
                .slice(0, 20)
                .map((e) => (
                  <li
                    key={e.id}
                    className="py-3 flex items-center justify-between gap-3"
                    data-testid={`row-earlier-${e.id}`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {e.category === "Other" && e.customCategory
                          ? e.customCategory
                          : e.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(e.createdAt)}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                    </div>
                    <span className="text-base font-bold text-gray-700 whitespace-nowrap">
                      {formatRupees(e.amount)}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {permission === "default" && (
          <section className="bg-emerald-600 text-white rounded-2xl shadow-sm p-5 mt-4">
            <p className="font-semibold">Turn on budget alerts</p>
            <p className="text-sm text-emerald-50 mt-1">
              Get a warning when you reach 80% of a budget and an alert when
              you cross it — for both your daily limit and any category limits.
              {!VAPID_KEY && (
                <>
                  {" "}
                  <span className="block mt-1 text-emerald-100/90 text-xs">
                    Tip: add a VAPID key in your .env to also enable Firebase
                    Cloud Messaging from a server.
                  </span>
                </>
              )}
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={askPermission}
                className="bg-white text-emerald-700 font-semibold rounded-lg px-4 py-2"
                data-testid="button-enable-notifications-card"
              >
                Enable
              </button>
            </div>
          </section>
        )}

        <AdBanner placement="bottom" />
      </main>

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-emerald-600 text-white text-3xl shadow-lg flex items-center justify-center"
        aria-label="Add expense"
        data-testid="button-fab-add"
      >
        +
      </button>

      <AddExpenseDialog open={showAdd} onClose={() => setShowAdd(false)} />
      <BudgetDialog
        open={showBudget}
        onClose={() => setShowBudget(false)}
        current={budget}
      />
      {user && (
        <NotificationsDialog
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          uid={user.uid}
        />
      )}
    </div>
  );
}
