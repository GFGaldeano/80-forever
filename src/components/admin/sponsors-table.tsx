import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";

import type { AdminSponsor } from "@/lib/sponsors/get-admin-sponsors";
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

type SponsorsTableProps = {
  sponsors: AdminSponsor[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SponsorsTable({
  sponsors,
}: Readonly<SponsorsTableProps>) {
  if (!sponsors.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Listado de sponsors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center">
            <p className="text-lg font-medium text-white">Todavía no hay sponsors cargados</p>
            <p className="mt-2 text-sm text-zinc-400">
              Creá el primero desde el formulario para empezar a poblar el módulo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle>Listado de sponsors</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Sponsor</TableHead>
                <TableHead className="text-zinc-400">Slug</TableHead>
                <TableHead className="text-zinc-400">Visible</TableHead>
                <TableHead className="text-zinc-400">Activo</TableHead>
                <TableHead className="text-zinc-400">Sitio</TableHead>
                <TableHead className="text-zinc-400">Actualizado</TableHead>
                <TableHead className="text-right text-zinc-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sponsors.map((sponsor) => (
                <TableRow
                  key={sponsor.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{sponsor.name}</p>
                      {sponsor.contact_name ? (
                        <p className="mt-1 text-xs text-zinc-500">
                          Contacto: {sponsor.contact_name}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-300">{sponsor.slug}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        sponsor.is_visible
                          ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                          : "border border-white/10 bg-white/[0.03] text-zinc-400"
                      }
                    >
                      {sponsor.is_visible ? "Sí" : "No"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        sponsor.is_active
                          ? "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"
                          : "border border-white/10 bg-white/[0.03] text-zinc-400"
                      }
                    >
                      {sponsor.is_active ? "Sí" : "No"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {sponsor.website_url ? (
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        Abrir
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-sm text-zinc-500">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-zinc-400">
                    {formatDate(sponsor.updated_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    >
                      <Link href={`/admin/sponsors?edit=${sponsor.id}`}>
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