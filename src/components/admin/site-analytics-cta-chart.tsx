"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartShell } from "@/components/admin/chart-shell";

type CTABarPoint = {
  label: string;
  clicks: number;
  color: string;
};

type SiteAnalyticsCTAChartProps = {
  data: CTABarPoint[];
};

function normalizeTooltipValue(value: ValueType | undefined) {
  if (Array.isArray(value)) {
    return value.join(" - ");
  }

  return value ?? 0;
}

export function SiteAnalyticsCTAChart({
  data,
}: Readonly<SiteAnalyticsCTAChartProps>) {
  const hasData = data.some((item) => item.clicks > 0);

  return (
    <Card className="min-w-0 border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle>Interacciones CTA</CardTitle>
        <p className="text-sm text-zinc-400">
          Clicks acumulados de accesos principales en los últimos 30 días.
        </p>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <ChartShell emptyMessage="Cargando gráfico de interacciones...">
            {({ width, height }) => (
              <BarChart width={width} height={height} data={data}>
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
                  formatter={(value) => [
                    normalizeTooltipValue(value),
                    "Clicks",
                  ]}
                />

                <Bar dataKey="clicks" radius={[10, 10, 0, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ChartShell>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-16 text-center text-sm text-zinc-400">
            Todavía no hay suficientes interacciones para graficar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}