import { formatRupees } from "@/lib/format";
import type { StreakStats } from "@/lib/insights";

type Props = { stats: StreakStats; hasBudget: boolean };

export function StreakBadges({ stats, hasBudget }: Props) {
  const { underBudgetStreak, savedThisWeek, noSpendDays7 } = stats;
  const items: Array<{ icon: string; title: string; subtitle: string }> = [];

  if (hasBudget && underBudgetStreak > 0) {
    items.push({
      icon: "🔥",
      title: `${underBudgetStreak}-day streak`,
      subtitle: "Under daily budget",
    });
  }
  if (hasBudget && savedThisWeek > 0) {
    items.push({
      icon: "💰",
      title: `Saved ${formatRupees(savedThisWeek)}`,
      subtitle: "This week vs target",
    });
  }
  if (noSpendDays7 > 0) {
    items.push({
      icon: "🌿",
      title: `${noSpendDays7} no-spend ${noSpendDays7 === 1 ? "day" : "days"}`,
      subtitle: "In the last week",
    });
  }

  if (items.length === 0) return null;

  return (
    <section
      className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4"
      data-testid="card-streaks"
    >
      {items.map((b, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-3 flex items-center gap-3"
          data-testid={`badge-${i}`}
        >
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">
            {b.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {b.title}
            </p>
            <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
