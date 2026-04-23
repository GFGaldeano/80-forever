import { Image as ImageIcon } from "lucide-react";

import { SponsorAssetForm } from "@/components/admin/sponsor-asset-form";
import { SponsorAssetsTable } from "@/components/admin/sponsor-assets-table";
import { getAdminSponsors } from "@/lib/sponsors/get-admin-sponsors";
import { getAdminSponsorAssets } from "@/lib/sponsors/get-admin-sponsor-assets";

type AssetsPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function AdminAssetsPage({
  searchParams,
}: Readonly<AssetsPageProps>) {
  const sponsors = await getAdminSponsors();
  const assets = await getAdminSponsorAssets();

  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const assetToEdit =
    typeof editId === "string"
      ? assets.find((asset) => asset.id === editId) ?? null
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
            Assets
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Administrá las piezas visuales de sponsors. En esta fase cargamos assets
            por URL y dejamos el módulo listo para sumar uploader real.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <SponsorAssetForm sponsors={sponsors} initialAsset={assetToEdit} />
        <SponsorAssetsTable assets={assets} />
      </div>
    </div>
  );
}