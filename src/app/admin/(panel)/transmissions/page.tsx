import Link from "next/link";
import { Film, Plus, Radio } from "lucide-react";

import { TransmissionForm } from "@/components/admin/transmission-form";
import { TransmissionsFilters } from "@/components/admin/transmissions-filters";
import { TransmissionsTable } from "@/components/admin/transmissions-table";
import { getAdminTransmissions } from "@/lib/transmissions/get-admin-transmissions";
import { Card, CardContent } from "@/components/ui/card";

type AdminTransmissionsPageProps = {
  searchParams?: Promise<{
    edit?: string;
    q?: string;
    status?: string;
    visible?: string;
  }>;
};

function normalizeStatus(value?: string) {
  return ["all", "draft", "scheduled", "aired", "archived"].includes(value ?? "")
    ? (value as "all" | "draft" | "scheduled" | "aired" | "archived")
    : "all";
}

function normalizeVisible(value?: string) {
  return ["all", "visible", "hidden"].includes(value ?? "")
    ? (value as "all" | "visible" | "hidden")
    : "all";
}

function matchesQuery(
  transmission: Awaited<ReturnType<typeof getAdminTransmissions>>[number],
  query: string
) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return true;

  return [
    transmission.episode_code,
    transmission.title,
    transmission.slug,
    transmission.description ?? "",
    transmission.youtube_title ?? "",
    transmission.youtube_author_name ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export default async function AdminTransmissionsPage({
  searchParams,
}: Readonly<AdminTransmissionsPageProps>) {
  const allTransmissions = await getAdminTransmissions();
  const resolvedSearchParams = (await searchParams) ?? {};

  const editId = resolvedSearchParams.edit;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const status = normalizeStatus(resolvedSearchParams.status);
  const visible = normalizeVisible(resolvedSearchParams.visible);

  const filteredTransmissions = allTransmissions.filter((transmission) => {
    if (!matchesQuery(transmission, query)) {
      return false;
    }

    if (status !== "all" && transmission.status !== status) {
      return false;
    }

    if (visible === "visible" && !transmission.is_visible) {
      return false;
    }

    if (visible === "hidden" && transmission.is_visible) {
      return false;
    }

    return true;
  });

  const transmissionToEdit =
    typeof editId === "string"
      ? allTransmissions.find((transmission) => transmission.id === editId) ?? null
      : null;

  const summary = {
    total: allTransmissions.length,
    filtered: filteredTransmissions.length,
    visible: allTransmissions.filter((item) => item.is_visible).length,
    aired: allTransmissions.filter((item) => item.status === "aired").length,
    synced: allTransmissions.filter((item) => Boolean(item.youtube_last_synced_at)).length,
  };

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
            Gestión editorial y operativa de emisiones para YouTube, replay e
            historial público.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Total
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {summary.total}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Filtradas
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {summary.filtered}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Visibles
            </p>
            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {summary.visible}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Emitidas
            </p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {summary.aired}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Sync YouTube
            </p>
            <p className="mt-3 text-3xl font-semibold text-fuchsia-300">
              {summary.synced}
            </p>
          </CardContent>
        </Card>
      </section>

      <TransmissionsFilters
        initialQuery={query}
        initialStatus={status}
        initialVisible={visible}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TransmissionForm initialTransmission={transmissionToEdit} />
        <TransmissionsTable
          transmissions={filteredTransmissions}
          currentFilters={{
            q: query,
            status,
            visible,
          }}
        />
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
        <div className="flex items-start gap-3">
          <Radio className="mt-0.5 h-4 w-4" />
          <p>
            Este módulo ya permite operar transmisiones como contenido editorial,
            con historial público, filtros y enlaces directos a su versión pública
            y a YouTube.
          </p>
        </div>
      </div>
    </div>
  );
}