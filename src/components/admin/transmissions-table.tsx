import Link from "next/link";
import {
  Eye,
  PencilLine,
  PlayCircle,
  Radio,
} from "lucide-react";

import type { AdminTransmission } from "@/lib/transmissions/get-admin-transmissions";
import { DeleteTransmissionButton } from "@/components/admin/delete-transmission-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CurrentFilters = {
  q?: string;
  status?: string;
  visible?: string;
};

type TransmissionsTableProps = {
  transmissions: AdminTransmission[];
  currentFilters?: CurrentFilters;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadgeClass(status: AdminTransmission["status"]) {
  switch (status) {
    case "aired":
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "scheduled":
      return "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "archived":
      return "border border-violet-500/30 bg-violet-500/10 text-violet-300";
    case "draft":
    default:
      return "border border-white/10 bg-white/[0.03] text-zinc-400";
  }
}

function getStatusLabel(status: AdminTransmission["status"]) {
  switch (status) {
    case "aired":
      return "Emitida";
    case "scheduled":
      return "Programada";
    case "archived":
      return "Archivada";
    case "draft":
    default:
      return "Borrador";
  }
}

function truncateText(value?: string | null, max = 120) {
  if (!value) return "Sin descripción editorial.";
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function buildEditHref(id: string, filters?: CurrentFilters) {
  const params = new URLSearchParams();

  params.set("edit", id);

  if (filters?.q) params.set("q", filters.q);
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.visible && filters.visible !== "all") params.set("visible", filters.visible);

  return `/admin/transmissions?${params.toString()}`;
}

export function TransmissionsTable({
  transmissions,
  currentFilters,
}: Readonly<TransmissionsTableProps>) {
  if (!transmissions.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Transmisiones cargadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center">
            <p className="text-lg font-medium text-white">
              No hay resultados para el filtro actual
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Ajustá los filtros o cargá una nueva transmisión.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle>Transmisiones cargadas</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Transmisión</TableHead>
                <TableHead className="text-zinc-400">Estado</TableHead>
                <TableHead className="text-zinc-400">Fecha</TableHead>
                <TableHead className="text-zinc-400">Sync YouTube</TableHead>
                <TableHead className="text-zinc-400">Links</TableHead>
                <TableHead className="text-right text-zinc-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transmissions.map((transmission) => (
                <TableRow
                  key={transmission.id}
                  className="border-white/10 align-top hover:bg-white/[0.02]"
                >
                  <TableCell className="min-w-[360px]">
                    <div className="flex gap-4">
                      <div className="h-20 w-36 overflow-hidden rounded-xl border border-white/10 bg-black">
                        {transmission.youtube_thumbnail_url ? (
                          <img
                            src={transmission.youtube_thumbnail_url}
                            alt={transmission.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-600">
                            <Radio className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {transmission.episode_code}
                          </p>
                          <p className="mt-1 text-base font-medium text-white">
                            {transmission.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {transmission.slug}
                          </p>
                        </div>

                        <p className="text-sm leading-6 text-zinc-400">
                          {truncateText(transmission.description)}
                        </p>

                        {transmission.youtube_title ? (
                          <p className="text-xs text-cyan-300">
                            YouTube: {transmission.youtube_title}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getStatusBadgeClass(transmission.status)}>
                        {getStatusLabel(transmission.status)}
                      </Badge>

                      <div>
                        <Badge
                          className={
                            transmission.is_visible
                              ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                              : "border border-white/10 bg-white/[0.03] text-zinc-400"
                          }
                        >
                          {transmission.is_visible ? "Visible" : "Oculta"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-300">
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-zinc-500">Emitida:</span>{" "}
                        {formatDateTime(transmission.aired_at)}
                      </p>
                      <p>
                        <span className="text-zinc-500">Programada:</span>{" "}
                        {formatDateTime(transmission.scheduled_at)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <Badge
                        className={
                          transmission.youtube_last_synced_at
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-white/10 bg-white/[0.03] text-zinc-400"
                        }
                      >
                        {transmission.youtube_last_synced_at
                          ? "Sincronizada"
                          : "Pendiente"}
                      </Badge>

                      <p className="max-w-[220px] text-xs leading-5 text-zinc-500">
                        {transmission.youtube_last_synced_at
                          ? `Última sync: ${formatDateTime(
                              transmission.youtube_last_synced_at
                            )}`
                          : "Sin metadata sincronizada todavía."}
                      </p>

                      {transmission.youtube_author_name ? (
                        <p className="text-xs text-zinc-400">
                          Canal: {transmission.youtube_author_name}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-start gap-2">
                      {transmission.is_visible ? (
                        <Link
                          href={`/transmisiones/${transmission.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 text-sm text-fuchsia-300 hover:text-fuchsia-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver público
                        </Link>
                      ) : null}

                      <a
                        href={transmission.youtube_watch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        Ver YouTube
                      </a>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                      >
                        <Link href={buildEditHref(transmission.id, currentFilters)}>
                          <PencilLine className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>

                      <DeleteTransmissionButton
                        transmissionId={transmission.id}
                        transmissionTitle={transmission.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <p>Total filtrado: {transmissions.length}</p>
          <p>Gestión editorial y operativa de emisiones archivadas.</p>
        </div>
      </CardContent>
    </Card>
  );
}