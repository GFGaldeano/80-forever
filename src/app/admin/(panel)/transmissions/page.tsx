import Link from "next/link";
import { Film, Plus } from "lucide-react";

import { TransmissionForm } from "@/components/admin/transmission-form";
import { TransmissionsTable } from "@/components/admin/transmissions-table";
import { getAdminTransmissions } from "@/lib/transmissions/get-admin-transmissions";

type AdminTransmissionsPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function AdminTransmissionsPage({
  searchParams,
}: Readonly<AdminTransmissionsPageProps>) {
  const transmissions = await getAdminTransmissions();
  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const transmissionToEdit =
    typeof editId === "string"
      ? transmissions.find((transmission) => transmission.id === editId) ?? null
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <Film className="h-7 w-7 text-fuchsia-300" />
            Transmisiones
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Base editorial y técnica de emisiones para YouTube, replays e historial
            público de transmisiones futuras.
          </p>
        </div>

        {transmissionToEdit ? (
          <Link
            href="/admin/transmissions"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/15"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva transmisión
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TransmissionForm initialTransmission={transmissionToEdit} />
        <TransmissionsTable transmissions={transmissions} />
      </div>
    </div>
  );
}