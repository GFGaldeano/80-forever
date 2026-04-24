import { Globe, Megaphone, Package2, ShieldCheck } from "lucide-react";

import type { AdminSponsor } from "@/lib/sponsors/get-admin-sponsors";
import type { AdminSponsorAsset } from "@/lib/sponsors/get-admin-sponsor-assets";
import { Card, CardContent } from "@/components/ui/card";

type SponsorsCommercialOverviewProps = {
  sponsors: AdminSponsor[];
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
  value: number;
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

export function SponsorsCommercialOverview({
  sponsors,
  assets,
}: Readonly<SponsorsCommercialOverviewProps>) {
  const activeSponsors = sponsors.filter((item) => item.is_active).length;
  const visibleSponsors = sponsors.filter((item) => item.is_visible).length;

  const sponsorIdsWithAssets = new Set(
    assets.map((asset) => asset.sponsor_id).filter(Boolean)
  );

  const sponsorsWithAssets = sponsors.filter((item) =>
    sponsorIdsWithAssets.has(item.id)
  ).length;

  const sponsorsWithoutAssets = Math.max(sponsors.length - sponsorsWithAssets, 0);

  const websiteConfigured = sponsors.filter((item) =>
    Boolean(item.website_url?.trim())
  ).length;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Sponsors"
        value={sponsors.length}
        helper="Base comercial total cargada en el sistema."
        accentClass="border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
        icon={Megaphone}
      />

      <StatCard
        label="Activos"
        value={activeSponsors}
        helper="Sponsors habilitados operativamente."
        accentClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        icon={ShieldCheck}
      />

      <StatCard
        label="Visibles"
        value={visibleSponsors}
        helper="Sponsors que pueden exponerse públicamente."
        accentClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
        icon={Globe}
      />

      <StatCard
        label="Con assets"
        value={sponsorsWithAssets}
        helper="Sponsors con al menos una pieza asociada."
        accentClass="border-violet-500/20 bg-violet-500/10 text-violet-300"
        icon={Package2}
      />

      <StatCard
        label="Sin assets"
        value={sponsorsWithoutAssets}
        helper={`Sponsors listos para completar. Sitios web cargados: ${websiteConfigured}.`}
        accentClass="border-amber-500/20 bg-amber-500/10 text-amber-300"
        icon={Package2}
      />
    </section>
  );
}