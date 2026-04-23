import { Megaphone } from "lucide-react";

import { SponsorForm } from "@/components/admin/sponsor-form";
import { SponsorsTable } from "@/components/admin/sponsors-table";
import { getAdminSponsors } from "@/lib/sponsors/get-admin-sponsors";

type SponsorsPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function AdminSponsorsPage({
  searchParams,
}: Readonly<SponsorsPageProps>) {
  const sponsors = await getAdminSponsors();
  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const sponsorToEdit =
    typeof editId === "string"
      ? sponsors.find((sponsor) => sponsor.id === editId) ?? null
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

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Gestioná los anunciantes del canal. En esta fase construimos la base
            del módulo: identidad comercial, estado y visibilidad.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SponsorForm initialSponsor={sponsorToEdit} />
        <SponsorsTable sponsors={sponsors} />
      </div>
    </div>
  );
}