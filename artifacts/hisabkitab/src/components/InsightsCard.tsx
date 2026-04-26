import type { Insight } from "@/lib/insights";

type Props = { insights: Insight[] };

const toneClass = (tone: Insight["tone"]) => {
  switch (tone) {
    case "good":
      return "bg-emerald-50 border-emerald-100 text-emerald-800";
    case "warn":
      return "bg-amber-50 border-amber-100 text-amber-800";
    default:
      return "bg-sky-50 border-sky-100 text-sky-800";
  }
};

export function InsightsCard({ insights }: Props) {
  return (
    <section
      className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 mb-4"
      data-testid="card-insights"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wide">
          Smart insights
        </p>
        <span className="text-xs text-gray-400">auto-updated</span>
      </div>
      <ul className="space-y-2">
        {insights.map((i) => (
          <li
            key={i.id}
            className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${toneClass(i.tone)}`}
            data-testid={`insight-${i.id}`}
          >
            <span className="text-base leading-tight" aria-hidden>
              {i.icon}
            </span>
            <span className="leading-snug">{i.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
