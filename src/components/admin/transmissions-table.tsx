import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";

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

type TransmissionsTableProps = {
  transmissions: AdminTransmission[];
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

export function TransmissionsTable({
  transmissions,
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
              Todavía no hay transmisiones
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Empezá cargando la primera emisión desde el formulario.
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
                <TableHead className="text-zinc-400">Episodio</TableHead>
                <TableHead className="text-zinc-400">Título</TableHead>
                <TableHead className="text-zinc-400">Estado</TableHead>
                <TableHead className="text-zinc-400">Visible</TableHead>
                <TableHead className="text-zinc-400">Emisión</TableHead>
                <TableHead className="text-zinc-400">YouTube</TableHead>
                <TableHead className="text-right text-zinc-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transmissions.map((transmission) => (
                <TableRow
                  key={transmission.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell className="text-zinc-200">
                    {transmission.episode_code}
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{transmission.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {transmission.slug}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusBadgeClass(transmission.status)}>
                      {getStatusLabel(transmission.status)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        transmission.is_visible
                          ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                          : "border border-white/10 bg-white/[0.03] text-zinc-400"
                      }
                    >
                      {transmission.is_visible ? "Sí" : "No"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-zinc-300">
                    {formatDateTime(transmission.aired_at || transmission.scheduled_at)}
                  </TableCell>

                  <TableCell>
                    <a
                      href={transmission.youtube_watch_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      Ver
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                      >
                        <Link href={`/admin/transmissions?edit=${transmission.id}`}>
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
      </CardContent>
    </Card>
  );
}