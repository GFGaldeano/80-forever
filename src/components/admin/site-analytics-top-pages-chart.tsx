"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartShell } from "@/components/admin/chart-shell";

type TopPagePoint = {
  path: string;
  views: number;
};

type SiteAnalyticsTopPagesChartProps = {
  data: TopPagePoint[];
};

function shortenPath(path: string, maxLength = 26) {
  if (path.length <= maxLength) {
    return path;
  }

  return `${path.slice(0, maxLength - 1)}…`;
}

function normalizeTooltipValue(value: ValueType | undefined) {
  if (Array.isArray(value)) {
    return value.join(" - ");
  }

  return value ?? 0;
}

export function SiteAnalyticsTopPagesChart({
  data,
}: Readonly<SiteAnalyticsTopPagesChartProps>) {
  const chartData = data.map((item) => ({
    ...item,
    label: shortenPath(item.path),
  }));

  const hasData = chartData.some((item) => item.views > 0);

  return (
    <Card className="min-w-0 border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle>Páginas más vistas</CardTitle>
        <p className="text-sm text-zinc-400">
          Ranking de páginas con mayor volumen en los últimos 30 días.
        </p>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <ChartShell emptyMessage="Cargando gráfico de páginas...">
            {({ width, height }) => (
              <BarChart
                width={width}
                height={height}
                data={chartData}
                layout="vertical"
                margin={{ left: 12 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  type="number"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={120}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9, 9, 11, 0.96)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    normalizeTooltipValue(value),
                    "Visitas",
                  ]}
                  labelFormatter={(label) => String(label ?? "")}
                />

                <Bar
                  dataKey="views"
                  fill="#22d3ee"
                  radius={[0, 10, 10, 0]}
                />
              </BarChart>
            )}
          </ChartShell>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-16 text-center text-sm text-zinc-400">
            Todavía no hay datos suficientes para mostrar páginas destacadas.
          </div>
        )}
      </CardContent>
    </Card>
  );
}