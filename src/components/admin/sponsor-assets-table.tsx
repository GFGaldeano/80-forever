import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";

import type { AdminSponsorAsset } from "@/lib/sponsors/get-admin-sponsor-assets";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SponsorAssetsTableProps = {
  assets: AdminSponsorAsset[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SponsorAssetsTable({
  assets,
}: Readonly<SponsorAssetsTableProps>) {
  if (!assets.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Listado de assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center">
            <p className="text-lg font-medium text-white">Todavía no hay assets cargados</p>
            <p className="mt-2 text-sm text-zinc-400">
              Creá el primero para empezar a preparar el carrusel público.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle>Listado de assets</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Sponsor</TableHead>
                <TableHead className="text-zinc-400">Tipo</TableHead>
                <TableHead className="text-zinc-400">Placement</TableHead>
                <TableHead className="text-zinc-400">Duración</TableHead>
                <TableHead className="text-zinc-400">Prioridad</TableHead>
                <TableHead className="text-zinc-400">Visible</TableHead>
                <TableHead className="text-zinc-400">Activo</TableHead>
                <TableHead className="text-zinc-400">Vigencia</TableHead>
                <TableHead className="text-right text-zinc-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{asset.sponsor_name}</p>
                      {asset.link_url ? (
                        <a
                          href={asset.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
                        >
                          Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-300">{asset.asset_type.toUpperCase()}</TableCell>
                  <TableCell className="text-zinc-300">{asset.placement.toUpperCase()}</TableCell>
                  <TableCell className="text-zinc-300">{asset.duration_seconds}s</TableCell>
                  <TableCell className="text-zinc-300">{asset.priority}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        asset.is_visible
                          ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                          : "border border-white/10 bg-white/[0.03] text-zinc-400"
                      }
                    >
                      {asset.is_visible ? "Sí" : "No"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        asset.is_active
                          ? "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"
                          : "border border-white/10 bg-white/[0.03] text-zinc-400"
                      }
                    >
                      {asset.is_active ? "Sí" : "No"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-zinc-400">
                    <div>
                      <p>Inicio: {formatDateTime(asset.starts_at)}</p>
                      <p className="mt-1">Fin: {formatDateTime(asset.ends_at)}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    >
                      <Link href={`/admin/assets?edit=${asset.id}`}>
                        <PencilLine className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
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