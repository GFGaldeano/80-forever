import { CalendarClock, Eye, Image as ImageIcon, Timer, Zap } from "lucide-react";

import type { AdminSponsorAsset } from "@/lib/sponsors/get-admin-sponsor-assets";
import { Card, CardContent } from "@/components/ui/card";

type SponsorAssetsCommercialOverviewProps = {
  assets: AdminSponsorAsset[];
};

function StatCard({
  label,
  value,
  accentClass,
  icon: Icon,
  helper,
}: {
  label: string;
  value: number | string;
  accentClass: string;
  icon: React.ComponentType<{ className?: string }>;
  helper: string;
}) {
  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-3 text-sm text-zinc-400">{helper}</p>
          </div>

          <div className={`inline-flex rounded-2xl border p-3 ${accentClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function isLiveWindow(startsAt?: string | null, endsAt?: string | null) {
  const now = Date.now();

  const startOk = !startsAt || new Date(startsAt).getTime() <= now;
  const endOk = !endsAt || new Date(endsAt).getTime() >= now;

  return startOk && endOk;
}

export function SponsorAssetsCommercialOverview({
  assets,
}: Readonly<SponsorAssetsCommercialOverviewProps>) {
  const activeAssets = assets.filter((item) => item.is_active).length;
  const visibleAssets = assets.filter((item) => item.is_visible).length;

  const liveAssets = assets.filter(
    (item) => item.is_active && item.is_visible && isLiveWindow(item.starts_at, item.ends_at)
  ).length;

  const avgDuration =
    assets.length > 0
      ? Math.round(
          assets.reduce((sum, item) => sum + (item.duration_seconds ?? 0), 0) /
            assets.length
        )
      : 0;

  const placementCount = assets.reduce<Record<string, number>>((acc, item) => {
    acc[item.placement] = (acc[item.placement] ?? 0) + 1;
    return acc;
  }, {});

  const topPlacement =
    Object.entries(placementCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Assets"
        value={assets.length}
        helper="Inventario total de piezas comerciales."
        accentClass="border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
        icon={ImageIcon}
      />

      <StatCard
        label="Activos"
        value={activeAssets}
        helper="Piezas habilitadas dentro del sistema."
        accentClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        icon={Zap}
      />

      <StatCard
        label="Visibles"
        value={visibleAssets}
        helper="Assets aptos para mostrarse al público."
        accentClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
        icon={Eye}
      />

      <StatCard
        label="En vigencia"
        value={liveAssets}
        helper="Activos + visibles + dentro de ventana temporal."
        accentClass="border-violet-500/20 bg-violet-500/10 text-violet-300"
        icon={CalendarClock}
      />

      <StatCard
        label="Duración / top"
        value={`${avgDuration}s`}
        helper={`Promedio de duración. Placement dominante: ${topPlacement.toUpperCase?.() ?? topPlacement}.`}
        accentClass="border-amber-500/20 bg-amber-500/10 text-amber-300"
        icon={Timer}
      />
    </section>
  );
}