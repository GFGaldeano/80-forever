import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminSongRequest } from "@/lib/song-requests/get-admin-song-requests";
import { songRequestStatusMeta } from "@/lib/validators/song-requests";
import { SongRequestStatusForm } from "@/components/admin/song-request-status-form";

type SongRequestsTableProps = {
  requests: AdminSongRequest[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SongRequestsTable({
  requests,
}: Readonly<SongRequestsTableProps>) {
  if (!requests.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Pedidos musicales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center">
            <p className="text-lg font-medium text-white">
              Todavía no hay pedidos
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Los pedidos enviados por la audiencia aparecerán acá para revisión.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => {
        const statusMeta = songRequestStatusMeta[request.status];

        return (
          <Card
            key={request.id}
            className="border-white/10 bg-zinc-950/80 text-white"
          >
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {request.song_title} — {request.artist_name}
                  </CardTitle>
                  <p className="mt-2 text-sm text-zinc-400">
                    Pedido por{" "}
                    <span className="text-white">{request.name_alias}</span>
                    {request.social_handle ? ` · ${request.social_handle}` : ""}{" "}
                    · {formatDateTime(request.created_at)}
                  </p>
                </div>

                <Badge className={statusMeta.className}>
                  {statusMeta.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 pt-6 xl:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                    Mensaje
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {request.message || "Sin mensaje adicional."}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      Estado actual
                    </p>
                    <p className="mt-3 text-sm text-zinc-300">
                      {statusMeta.label}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      Última revisión
                    </p>
                    <p className="mt-3 text-sm text-zinc-300">
                      {request.reviewed_at
                        ? formatDateTime(request.reviewed_at)
                        : "Aún no revisado"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <SongRequestStatusForm
                  requestId={request.id}
                  initialStatus={request.status}
                  initialNotes={request.admin_notes}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}