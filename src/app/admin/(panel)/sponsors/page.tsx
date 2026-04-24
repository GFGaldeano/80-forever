import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { SponsorForm } from "@/components/admin/sponsor-form";
import { SponsorsCommercialOverview } from "@/components/admin/sponsors-commercial-overview";
import { SponsorsTable } from "@/components/admin/sponsors-table";
import { getAdminSponsorAssets } from "@/lib/sponsors/get-admin-sponsor-assets";
import { getAdminSponsors } from "@/lib/sponsors/get-admin-sponsors";

type AdminSponsorsPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function AdminSponsorsPage({
  searchParams,
}: Readonly<AdminSponsorsPageProps>) {
  const [sponsors, assets] = await Promise.all([
    getAdminSponsors(),
    getAdminSponsorAssets(),
  ]);

  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const sponsorToEdit =
    typeof editId === "string"
      ? sponsors.find((item) => item.id === editId) ?? null
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <Megaphone className="h-7 w-7 text-fuchsia-300" />
            Sponsors
          </h2>

          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
            Base comercial de anunciantes, visibilidad operativa y cobertura de assets
            para monetización del canal.
          </p>
        </div>

        {sponsorToEdit ? (
          <Link
            href="/admin/sponsors"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/15"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo sponsor
          </Link>
        ) : null}
      </div>

      <SponsorsCommercialOverview sponsors={sponsors} assets={assets} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SponsorForm initialSponsor={sponsorToEdit} />
        <SponsorsTable sponsors={sponsors} />
      </div>

      <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4 text-sm text-fuchsia-200">
        Esta pantalla ahora se lee desde negocio: quién está activo, quién está visible
        y qué sponsors todavía no tienen inventario publicitario cargado.
      </div>
    </div>
  );
}