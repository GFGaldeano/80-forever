import Link from "next/link";
import { Image as ImageIcon, Plus } from "lucide-react";

import { SponsorAssetForm } from "@/components/admin/sponsor-asset-form";
import { SponsorAssetsCommercialOverview } from "@/components/admin/sponsor-assets-commercial-overview";
import { SponsorAssetsTable } from "@/components/admin/sponsor-assets-table";
import { getAdminSponsorAssets } from "@/lib/sponsors/get-admin-sponsor-assets";
import { getAdminSponsors } from "@/lib/sponsors/get-admin-sponsors";

type AdminAssetsPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function AdminAssetsPage({
  searchParams,
}: Readonly<AdminAssetsPageProps>) {
  const [assets, sponsors] = await Promise.all([
    getAdminSponsorAssets(),
    getAdminSponsors(),
  ]);

  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const assetToEdit =
    typeof editId === "string"
      ? assets.find((item) => item.id === editId) ?? null
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <ImageIcon className="h-7 w-7 text-cyan-300" />
            Assets comerciales
          </h2>

          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
            Biblioteca operativa de piezas visuales, con control de activación,
            vigencia, placement y duración publicitaria.
          </p>
        </div>

        {assetToEdit ? (
          <Link
            href="/admin/assets"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/15"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo asset
          </Link>
        ) : null}
      </div>

      <SponsorAssetsCommercialOverview assets={assets} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SponsorAssetForm sponsors={sponsors} initialAsset={assetToEdit} />
        <SponsorAssetsTable assets={assets} />
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
        Esta vista ya permite leer el inventario comercial como biblioteca real:
        activos, visibles, vigentes y placement dominante del carrusel.
      </div>
    </div>
  );
}