import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/firebase/auth";
import { ConfigWarning } from "@/components/ConfigWarning";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { AssistantPage } from "@/pages/AssistantPage";
import { PlansPage } from "@/pages/PlansPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Layout } from "@/components/Layout";
import type { PageId } from "@/components/Sidebar";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { NotificationsDialog } from "@/components/NotificationsDialog";
import {
  subscribeBudget,
  subscribeExpenses,
  type Budget,
  type Expense,
} from "@/firebase/expenses";
import {
  resetMonthlyTotal,
  subscribeProfile,
  type Profile,
} from "@/firebase/profile";
import {
  subscribeNotifications,
  type NotifLog,
} from "@/firebase/notificationsLog";
import { fireOnce } from "@/lib/notifications";
import { formatRupees, startOfTodayMs, endOfTodayMs } from "@/lib/format";

function AuthedShell() {
  const { user } = useAuth();
  const [page, setPage] = useState<PageId>("dashboard");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({
    daily: null,
    perCategory: {},
  });
  const [profile, setProfile] = useState<Profile>({
    isPremium: false,
    displayName: null,
    premiumSince: null,
    paymentRequested: false,
    paymentRequestedAt: null,
    paymentMethod: null,
    paymentReference: null,
    monthlyTotal: 0,
  });
  const [notifications, setNotifications] = useState<NotifLog[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [permission] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported",
  );

  useEffect(() => {
    if (!user) return;
    const unsubE = subscribeExpenses(user.uid, setExpenses);
    const unsubB = subscribeBudget(user.uid, setBudget);
    const unsubP = subscribeProfile(user.uid, setProfile);
    const unsubN = subscribeNotifications(user.uid, setNotifications);
    return () => {
      unsubE();
      unsubB();
      unsubP();
      unsubN();
    };
  }, [user]);

  const todayExpenses = useMemo(() => {
    const start = startOfTodayMs();
    const end = endOfTodayMs();
    return expenses.filter((e) => e.createdAt >= start && e.createdAt <= end);
  }, [expenses]);

  const todayTotal = useMemo(
    () => todayExpenses.reduce((a, e) => a + e.amount, 0),
    [todayExpenses],
  );

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  let pageContent: React.ReactNode = null;
  switch (page) {
    case "dashboard":
      pageContent = (
        <DashboardPage
          expenses={expenses}
          monthlyTotal={profile.monthlyTotal}
          notifications={notifications}
          isPremium={profile.isPremium}
          onNavigate={setPage}
          onAddExpense={() => setShowAdd(true)}
          onResetMonth={async () => {
            if (user) await resetMonthlyTotal(user.uid);
          }}
        />
      );
      break;
    case "expenses":
      pageContent = (
        <ExpensesPage expenses={expenses} onAdd={() => setShowAdd(true)} />
      );
      break;
    case "categories":
      pageContent = <CategoriesPage expenses={expenses} />;
      break;
    case "budget":
      pageContent = <BudgetPage budget={budget} expenses={expenses} />;
      break;
    case "insights":
      pageContent = (
        <InsightsPage
          expenses={expenses}
          budget={budget}
          isPremium={profile.isPremium}
          onNavigate={setPage}
        />
      );
      break;
    case "assistant":
      pageContent = (
        <AssistantPage
          expenses={expenses}
          budget={budget}
          isPremium={profile.isPremium}
          onNavigate={setPage}
        />
      );
      break;
    case "plans":
      pageContent = (
        <PlansPage isPremium={profile.isPremium} onNavigate={setPage} />
      );
      break;
    case "payment":
      pageContent = <PaymentPage profile={profile} onNavigate={setPage} />;
      break;
    case "notifications":
      pageContent = (
        <div className="space-y-4">
          <NotificationsPage notifications={notifications} />
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowNotifSettings(true)}
              className="text-sm font-semibold text-emerald-700 underline"
            >
              Open notification settings
            </button>
          </div>
        </div>
      );
      break;
    case "settings":
      pageContent = (
        <SettingsPage profile={profile} onNavigate={setPage} />
      );
      break;
  }

  return (
    <>
      <Layout
        active={page}
        onNavigate={setPage}
        isPremium={profile.isPremium}
        unreadCount={unreadCount}
      >
        {pageContent}
      </Layout>

      <AddExpenseDialog open={showAdd} onClose={() => setShowAdd(false)} />
      {user && (
        <NotificationsDialog
          open={showNotifSettings}
          onClose={() => setShowNotifSettings(false)}
          uid={user.uid}
        />
      )}
    </>
  );
}

function AppShell() {
  const { user, loading, configured } = useAuth();
  if (!configured) return <ConfigWarning />;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-emerald-700 font-semibold">Loading...</div>
      </div>
    );
  }
  return user ? <AuthedShell /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
