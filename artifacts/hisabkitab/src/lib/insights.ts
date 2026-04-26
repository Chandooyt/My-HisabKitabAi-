import type { Expense, Budget } from "@/firebase/expenses";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (ms: number): number => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const dayKey = (ms: number): string => {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const labelFor = (e: Expense): string =>
  e.category === "Other" && e.customCategory ? e.customCategory : e.category;

export const sumIn = (
  expenses: Expense[],
  fromMs: number,
  toMs: number,
): number =>
  expenses
    .filter((e) => e.createdAt >= fromMs && e.createdAt < toMs)
    .reduce((a, e) => a + e.amount, 0);

const groupByCategory = (
  expenses: Expense[],
  fromMs: number,
  toMs: number,
): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const e of expenses) {
    if (e.createdAt < fromMs || e.createdAt >= toMs) continue;
    const k = labelFor(e);
    out[k] = (out[k] ?? 0) + e.amount;
  }
  return out;
};

const topEntry = (
  obj: Record<string, number>,
): { name: string; amount: number } | null => {
  const entries = Object.entries(obj);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { name: entries[0][0], amount: entries[0][1] };
};

export type Insight = {
  id: string;
  icon: string;
  text: string;
  tone: "good" | "warn" | "info";
};

export const computeInsights = (
  expenses: Expense[],
  budget: Budget,
): Insight[] => {
  const insights: Insight[] = [];
  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - DAY_MS;
  const sevenAgoStart = todayStart - 6 * DAY_MS;
  const fourteenAgoStart = todayStart - 13 * DAY_MS;

  const todayTotal = sumIn(expenses, todayStart, todayStart + DAY_MS);
  const yesterdayTotal = sumIn(expenses, yesterdayStart, todayStart);

  if (yesterdayTotal > 0) {
    const diffPct = Math.round(
      ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100,
    );
    if (diffPct >= 10) {
      insights.push({
        id: "vs-yesterday-up",
        icon: "📈",
        text: `You spent ${diffPct}% more than yesterday.`,
        tone: "warn",
      });
    } else if (diffPct <= -10) {
      insights.push({
        id: "vs-yesterday-down",
        icon: "📉",
        text: `You spent ${Math.abs(diffPct)}% less than yesterday. Nice!`,
        tone: "good",
      });
    }
  }

  const last7 = groupByCategory(expenses, sevenAgoStart, todayStart + DAY_MS);
  const top7 = topEntry(last7);
  if (top7 && top7.amount > 0) {
    insights.push({
      id: "top-category",
      icon: "🏆",
      text: `Your highest spending category this week is ${top7.name}.`,
      tone: "info",
    });
  }

  const thisWeek = groupByCategory(
    expenses,
    sevenAgoStart,
    todayStart + DAY_MS,
  );
  const lastWeek = groupByCategory(expenses, fourteenAgoStart, sevenAgoStart);

  let biggestJump: { name: string; jump: number; pct: number } | null = null;
  for (const [name, amount] of Object.entries(thisWeek)) {
    const prev = lastWeek[name] ?? 0;
    const jump = amount - prev;
    if (jump > 0 && prev > 0) {
      const pct = Math.round((jump / prev) * 100);
      if (pct >= 25 && (!biggestJump || pct > biggestJump.pct)) {
        biggestJump = { name, jump, pct };
      }
    }
  }
  if (biggestJump) {
    insights.push({
      id: "rising-category",
      icon: "⚠️",
      text: `You are spending ${biggestJump.pct}% more on ${biggestJump.name} this week.`,
      tone: "warn",
    });
  }

  const last3 = sumIn(expenses, todayStart - 2 * DAY_MS, todayStart + DAY_MS);
  const prior3 = sumIn(
    expenses,
    todayStart - 5 * DAY_MS,
    todayStart - 2 * DAY_MS,
  );
  if (prior3 > 0) {
    const pct = Math.round(((last3 - prior3) / prior3) * 100);
    if (pct >= 15) {
      insights.push({
        id: "trend-up",
        icon: "📊",
        text: `Your spending trend is increasing (${pct}% over the last 3 days).`,
        tone: "warn",
      });
    } else if (pct <= -15) {
      insights.push({
        id: "trend-down",
        icon: "✅",
        text: `Your spending trend is decreasing (${Math.abs(pct)}% lower). Keep it up!`,
        tone: "good",
      });
    }
  }

  if (budget.daily && top7) {
    const share = top7.amount / Math.max(1, Object.values(last7).reduce((a, v) => a + v, 0));
    if (share >= 0.4) {
      insights.push({
        id: "category-dominance",
        icon: "🍽️",
        text: `${top7.name} is ${Math.round(share * 100)}% of your weekly spending — try cutting it down.`,
        tone: "warn",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: "all-good",
      icon: "🌱",
      text: "Spending looks steady. Keep logging to unlock more insights.",
      tone: "info",
    });
  }

  return insights.slice(0, 4);
};

export type WeeklySummary = {
  thisWeekTotal: number;
  lastWeekTotal: number;
  diffPct: number | null;
  topCategory: { name: string; amount: number } | null;
  message: string;
};

export const computeWeeklySummary = (expenses: Expense[]): WeeklySummary => {
  const now = Date.now();
  const todayStart = startOfDay(now);
  const sevenAgoStart = todayStart - 6 * DAY_MS;
  const fourteenAgoStart = todayStart - 13 * DAY_MS;

  const thisWeekTotal = sumIn(expenses, sevenAgoStart, todayStart + DAY_MS);
  const lastWeekTotal = sumIn(expenses, fourteenAgoStart, sevenAgoStart);
  const byCat = groupByCategory(expenses, sevenAgoStart, todayStart + DAY_MS);
  const topCategory = topEntry(byCat);

  let diffPct: number | null = null;
  if (lastWeekTotal > 0) {
    diffPct = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
  }

  let message: string;
  if (thisWeekTotal === 0) {
    message = "No spending logged this week yet.";
  } else if (topCategory) {
    message = `This week you spent Rs ${thisWeekTotal.toLocaleString("en-IN")}, mostly on ${topCategory.name}.`;
  } else {
    message = `This week you spent Rs ${thisWeekTotal.toLocaleString("en-IN")}.`;
  }

  return { thisWeekTotal, lastWeekTotal, diffPct, topCategory, message };
};

export type DailyPoint = { day: string; total: number; label: string };

export const dailyTotalsLast7Days = (expenses: Expense[]): DailyPoint[] => {
  const todayStart = startOfDay(Date.now());
  const out: DailyPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = todayStart - i * DAY_MS;
    const total = sumIn(expenses, dayStart, dayStart + DAY_MS);
    const d = new Date(dayStart);
    out.push({
      day: dayKey(dayStart),
      total: Math.round(total),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }
  return out;
};

export type CategoryPoint = { name: string; total: number };

export const categoryTotalsLast7Days = (
  expenses: Expense[],
): CategoryPoint[] => {
  const todayStart = startOfDay(Date.now());
  const sevenAgoStart = todayStart - 6 * DAY_MS;
  const grouped = groupByCategory(expenses, sevenAgoStart, todayStart + DAY_MS);
  return Object.entries(grouped)
    .map(([name, total]) => ({ name, total: Math.round(total) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
};

export type StreakStats = {
  underBudgetStreak: number;
  savedThisWeek: number;
  noSpendDays7: number;
};

export const computeStreaks = (
  expenses: Expense[],
  budget: Budget,
): StreakStats => {
  const todayStart = startOfDay(Date.now());
  let underBudgetStreak = 0;
  if (budget.daily && budget.daily > 0) {
    for (let i = 0; i < 60; i++) {
      const dayStart = todayStart - i * DAY_MS;
      const total = sumIn(expenses, dayStart, dayStart + DAY_MS);
      if (i === 0 && total === 0) continue;
      if (total <= budget.daily) {
        underBudgetStreak++;
      } else {
        break;
      }
    }
  }

  let savedThisWeek = 0;
  if (budget.daily && budget.daily > 0) {
    for (let i = 0; i < 7; i++) {
      const dayStart = todayStart - i * DAY_MS;
      const total = sumIn(expenses, dayStart, dayStart + DAY_MS);
      if (total < budget.daily) {
        savedThisWeek += budget.daily - total;
      }
    }
  }

  let noSpendDays7 = 0;
  for (let i = 0; i < 7; i++) {
    const dayStart = todayStart - i * DAY_MS;
    const total = sumIn(expenses, dayStart, dayStart + DAY_MS);
    if (total === 0 && (i > 0 || dayStart !== todayStart)) noSpendDays7++;
  }

  return { underBudgetStreak, savedThisWeek: Math.round(savedThisWeek), noSpendDays7 };
};
