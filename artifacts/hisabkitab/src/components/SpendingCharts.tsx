import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryPoint, DailyPoint } from "@/lib/insights";

type Props = {
  daily: DailyPoint[];
  categories: CategoryPoint[];
};

const fmtRs = (v: number) => `Rs ${v.toLocaleString("en-IN")}`;

export function SpendingCharts({ daily, categories }: Props) {
  const hasDaily = daily.some((d) => d.total > 0);
  const hasCats = categories.length > 0 && categories.some((c) => c.total > 0);

  if (!hasDaily && !hasCats) {
    return null;
  }

  return (
    <section
      className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 mb-4"
      data-testid="card-charts"
    >
      <p className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wide mb-3">
        Spending overview
      </p>

      {hasDaily && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2">Daily trend (last 7 days)</p>
          <div className="h-48 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={daily}
                margin={{ top: 5, right: 12, bottom: 0, left: 0 }}
              >
                <CartesianGrid stroke="#ecfdf5" vertical={false} />
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
                  formatter={(v: number) => fmtRs(v)}
                  labelClassName="text-xs"
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
                  dot={{ fill: "#059669", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasCats && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Top categories (last 7 days)</p>
          <div className="h-56 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories}
                margin={{ top: 5, right: 12, bottom: 0, left: 0 }}
                layout="vertical"
              >
                <CartesianGrid stroke="#ecfdf5" horizontal={false} />
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
                  width={90}
                />
                <Tooltip
                  formatter={(v: number) => fmtRs(v)}
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
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
