import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type DashboardMetricCardProps = {
  title: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  accentClassName?: string;
};

export function DashboardMetricCard({
  title,
  value,
  hint,
  icon: Icon,
  accentClassName = "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.12)]",
}: Readonly<DashboardMetricCardProps>) {
  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {title}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {value}
            </p>
            <p className="mt-3 text-sm text-zinc-400">{hint}</p>
          </div>

          <div
            className={`inline-flex rounded-2xl border p-3 ${accentClassName}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}