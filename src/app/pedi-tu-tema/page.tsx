import { Music2 } from "lucide-react";

import { SongRequestForm } from "@/components/forms/song-request-form";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export default function SongRequestsPublicPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12 md:px-8">
        <div className="border-b border-white/10 pb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {siteConfig.name}
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-fuchsia-300">
            <Music2 className="h-4 w-4" />
            Participación de la audiencia
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Pedí tu tema
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Esta es la puerta de entrada para que la audiencia sugiera
            canciones, artistas y dedicatorias. El pedido queda registrado en el
            panel administrativo para su revisión.
          </p>
        </div>

        <div className="mt-10">
          <SongRequestForm />
        </div>
      </div>
    </main>
  );
}