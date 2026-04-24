"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartShell } from "@/components/admin/chart-shell";
import type {
  AnalyticsTrafficPoint,
  SiteAnalyticsTrafficSeries,
} from "@/lib/admin/get-site-analytics-traffic-series";

type SiteAnalyticsTrafficChartProps = {
  series: SiteAnalyticsTrafficSeries;
};

type ViewMode = "daily" | "weekly" | "monthly" | "yearly";

const viewMeta: Record<
  ViewMode,
  {
    label: string;
    description: string;
  }
> = {
  daily: {
    label: "Diario",
    description: "Últimos 14 días de visitas y visitantes únicos.",
  },
  weekly: {
    label: "Semanal",
    description: "Últimas 12 semanas para detectar tendencias.",
  },
  monthly: {
    label: "Mensual",
    description: "Últimos 12 meses de evolución del sitio.",
  },
  yearly: {
    label: "Anual",
    description: "Comparativa anual para lectura ejecutiva.",
  },
};

function hasTraffic(data: AnalyticsTrafficPoint[]) {
  return data.some((item) => item.views > 0 || item.uniqueVisitors > 0);
}

function normalizeTooltipValue(value: ValueType | undefined) {
  if (Array.isArray(value)) {
    return value.join(" - ");
  }

  return value ?? 0;
}

export function SiteAnalyticsTrafficChart({
  series,
}: Readonly<SiteAnalyticsTrafficChartProps>) {
  const [view, setView] = useState<ViewMode>("daily");

  const data = useMemo(() => series[view] ?? [], [series, view]);
  const meta = viewMeta[view];

  return (
    <Card className="min-w-0 border-white/10 bg-zinc-950/80 text-white">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>Evolución de audiencia</CardTitle>
          <p className="mt-2 text-sm text-zinc-400">{meta.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(viewMeta) as ViewMode[]).map((mode) => {
            const isActive = mode === view;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${
                  isActive
                    ? "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]"
                    : "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]"
                }`}
              >
                {viewMeta[mode].label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {data.length && hasTraffic(data) ? (
          <ChartShell emptyMessage="Cargando gráfico de audiencia...">
            {({ width, height }) => (
              <ComposedChart width={width} height={height} data={data}>
                <defs>
                  <linearGradient
                    id="analyticsViewsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <YAxis
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9, 9, 11, 0.96)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                  formatter={(value, name) => [
                    normalizeTooltipValue(value),
                    name === "views" ? "Visitas" : "Visitantes únicos",
                  ]}
                />

                <Legend
                  wrapperStyle={{
                    color: "#a1a1aa",
                    fontSize: "12px",
                  }}
                  formatter={(value) =>
                    value === "views" ? "Visitas" : "Visitantes únicos"
                  }
                />

                <Area
                  type="monotone"
                  dataKey="views"
                  name="views"
                  stroke="#22d3ee"
                  fill="url(#analyticsViewsGradient)"
                  strokeWidth={2}
                />

                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  name="uniqueVisitors"
                  stroke="#f472b6"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            )}
          </ChartShell>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-16 text-center text-sm text-zinc-400">
            Todavía no hay datos suficientes para graficar esta vista.
          </div>
        )}
      </CardContent>
    </Card>
  );
}