import type { Expense, Budget } from "@/firebase/expenses";
import {
  computeInsights,
  computeWeeklySummary,
  categoryTotalsLast7Days,
} from "./insights";
import { formatRupees } from "./format";

export type ChatRole = "user" | "assistant";
export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
};

const intentMatchers: Array<{
  intent: string;
  patterns: RegExp[];
}> = [
  {
    intent: "save",
    patterns: [/save\b/i, /reduce\b/i, /cut down/i, /spend less/i],
  },
  { intent: "waste", patterns: [/wast/i, /leak/i, /unnecessary/i, /useless/i] },
  {
    intent: "analyze",
    patterns: [/analy[sz]e/i, /report/i, /summary/i, /overview/i, /how am i/i],
  },
  { intent: "category", patterns: [/categor/i, /top/i, /highest/i, /most/i] },
  { intent: "today", patterns: [/today/i, /now\b/i] },
  { intent: "week", patterns: [/week/i, /7 days/i] },
  { intent: "budget", patterns: [/budget/i, /limit/i, /target/i] },
  {
    intent: "greet",
    patterns: [/^(hi|hey|hello|salam|assalam|kaise|how are)/i],
  },
];

const detectIntent = (text: string): string => {
  for (const m of intentMatchers) {
    if (m.patterns.some((p) => p.test(text))) return m.intent;
  }
  return "default";
};

const tipsForCategory = (name: string): string => {
  const map: Record<string, string> = {
    Food: "Try cooking 1–2 more meals at home this week. Even one fewer takeout can save hundreds.",
    Travel: "Plan trips together and share rides. For short distances, walking saves fuel and money.",
    Bills: "Check if any subscription or recharge can move to a smaller plan.",
    Shopping: "Use a 24-hour rule before non-essential buys. Often the urge passes.",
    Entertainment: "Look for free options this week — a walk, a friend's place, or a library visit.",
    Health: "Health spending is usually worth it, but compare pharmacy prices.",
    Fuel: "Combine errands into one trip and check tire pressure to stretch your fuel.",
    Rent: "Rent is hard to cut, but review utilities and shared expenses with housemates.",
    "Mobile/Internet": "Recheck your package — a smaller monthly plan might cover your real usage.",
    "Mobile Load": "Set a small monthly load budget. Wi-Fi at home covers most needs.",
    EasyPaisa: "Track each transfer's purpose so impulse sends don't sneak in.",
    JazzCash: "Track each transfer's purpose so impulse sends don't sneak in.",
  };
  return (
    map[name] ??
    `Try setting a small weekly limit on ${name} and watch how it changes.`
  );
};

export const generateAiReply = (
  userText: string,
  expenses: Expense[],
  budget: Budget,
): string => {
  const intent = detectIntent(userText);
  const insights = computeInsights(expenses, budget);
  const week = computeWeeklySummary(expenses);
  const cats = categoryTotalsLast7Days(expenses);
  const top = cats[0];
  const totalWeek = cats.reduce((a, c) => a + c.total, 0);

  const lines: string[] = [];

  switch (intent) {
    case "greet":
      lines.push("Salam! I'm your HisabKitab AI assistant.");
      lines.push(
        week.thisWeekTotal > 0
          ? `This week you've spent ${formatRupees(week.thisWeekTotal)}.`
          : "You haven't logged any spending this week yet.",
      );
      lines.push(
        "Ask me things like 'where am I wasting money' or 'how can I save?'",
      );
      break;

    case "save":
      lines.push("Here's how you can save this week:");
      if (top && totalWeek > 0) {
        const share = Math.round((top.total / totalWeek) * 100);
        lines.push(
          `• ${top.name} is ${share}% of your spending. ${tipsForCategory(top.name)}`,
        );
      }
      if (budget.daily) {
        lines.push(`• Stick to your daily budget of ${formatRupees(budget.daily)}.`);
      } else {
        lines.push("• Set a daily budget to give yourself a clear target.");
      }
      lines.push(
        "• Log every expense — even small ones add up across the month.",
      );
      break;

    case "waste":
      if (!top) {
        lines.push("Log a few more expenses and I can spot leaks for you.");
      } else {
        lines.push(
          `Your biggest spending is on ${top.name} (${formatRupees(top.total)} this week).`,
        );
        lines.push(tipsForCategory(top.name));
        const second = cats[1];
        if (second) {
          lines.push(
            `Next biggest is ${second.name} (${formatRupees(second.total)}).`,
          );
        }
      }
      break;

    case "analyze":
      if (week.thisWeekTotal === 0) {
        lines.push("Not enough data yet — log a few expenses and ask again.");
      } else {
        lines.push(week.message);
        if (week.diffPct !== null) {
          if (week.diffPct > 0) {
            lines.push(`That's ${week.diffPct}% more than last week.`);
          } else if (week.diffPct < 0) {
            lines.push(
              `That's ${Math.abs(week.diffPct)}% less than last week. Well done!`,
            );
          } else {
            lines.push("That's about the same as last week.");
          }
        }
        for (const ins of insights.slice(0, 2)) {
          lines.push(`${ins.icon} ${ins.text}`);
        }
      }
      break;

    case "category":
      if (cats.length === 0) {
        lines.push("No category data this week yet.");
      } else {
        lines.push("Top categories this week:");
        cats.slice(0, 3).forEach((c, i) => {
          lines.push(`${i + 1}. ${c.name} — ${formatRupees(c.total)}`);
        });
      }
      break;

    case "today": {
      const todayStart = (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })();
      const todayTotal = expenses
        .filter((e) => e.createdAt >= todayStart)
        .reduce((a, e) => a + e.amount, 0);
      if (todayTotal === 0) {
        lines.push("Nothing spent today. Good job!");
      } else {
        lines.push(`Today you've spent ${formatRupees(todayTotal)}.`);
        if (budget.daily) {
          const left = budget.daily - todayTotal;
          if (left > 0) {
            lines.push(`You have ${formatRupees(left)} left for today.`);
          } else {
            lines.push(`You're ${formatRupees(-left)} over today's budget.`);
          }
        }
      }
      break;
    }

    case "week":
      lines.push(week.message);
      if (week.diffPct !== null && week.thisWeekTotal > 0) {
        lines.push(
          week.diffPct >= 0
            ? `Up ${week.diffPct}% vs last week.`
            : `Down ${Math.abs(week.diffPct)}% vs last week — keep it up!`,
        );
      }
      break;

    case "budget":
      if (!budget.daily) {
        lines.push(
          "You haven't set a daily budget yet. Open the Budget page to add one.",
        );
      } else {
        lines.push(`Your daily budget is ${formatRupees(budget.daily)}.`);
      }
      break;

    default:
      lines.push("Here's a quick look at your money:");
      if (week.thisWeekTotal > 0) lines.push(week.message);
      if (top)
        lines.push(`Biggest category: ${top.name} (${formatRupees(top.total)}).`);
      lines.push(
        "Try asking: 'where am I wasting money?', 'analyze my spending', or 'how can I save?'",
      );
  }

  return lines.join("\n");
};

export const SUGGESTED_PROMPTS = [
  "Where am I wasting money?",
  "How can I save money?",
  "Analyze my spending",
  "What's my top category?",
];
