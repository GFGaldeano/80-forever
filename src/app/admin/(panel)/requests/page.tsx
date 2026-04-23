import { Music2 } from "lucide-react";

import { SongRequestsTable } from "@/components/admin/song-requests-table";
import { getAdminSongRequests } from "@/lib/song-requests/get-admin-song-requests";

export const dynamic = "force-dynamic";

export default async function AdminSongRequestsPage() {
  const requests = await getAdminSongRequests();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <Music2 className="h-7 w-7 text-cyan-300" />
            Pedidos musicales
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Revisá, clasificá y gestioná los pedidos de canciones enviados por
            la audiencia.
          </p>
        </div>
      </div>

      <SongRequestsTable requests={requests} />
    </div>
  );
}