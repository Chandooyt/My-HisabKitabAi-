import { formatRupees } from "@/lib/format";
import type { WeeklySummary } from "@/lib/insights";
import { iconFor } from "@/lib/categories";

type Props = { summary: WeeklySummary };

export function WeeklySummaryCard({ summary }: Props) {
  const { thisWeekTotal, diffPct, topCategory, message } = summary;
  const trendUp = diffPct !== null && diffPct > 0;
  const trendDown = diffPct !== null && diffPct < 0;

  return (
    <section
      className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-sm p-5 mb-4"
      data-testid="card-weekly-summary"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
        This week
      </p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <span
          className="text-3xl sm:text-4xl font-bold"
          data-testid="text-week-total"
        >
          {formatRupees(thisWeekTotal)}
        </span>
        {diffPct !== null && (
          <span
            className={`text-xs font-semibold rounded-full px-2 py-1 ${
              trendUp
                ? "bg-red-100/20 text-red-100"
                : trendDown
                  ? "bg-emerald-100/20 text-emerald-50"
                  : "bg-white/15 text-emerald-50"
            }`}
            data-testid="text-week-diff"
          >
            {trendUp ? "↑" : trendDown ? "↓" : "•"} {Math.abs(diffPct)}% vs last
            week
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-emerald-50/95 leading-snug">{message}</p>
      {topCategory && (
        <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">
          <span aria-hidden>{iconFor(topCategory.name)}</span>
          <span>
            Top: {topCategory.name} · {formatRupees(topCategory.amount)}
          </span>
        </div>
      )}
    </section>
  );
}
