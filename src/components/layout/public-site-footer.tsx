import { MessageCircle } from "lucide-react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { siteConfig } from "@/lib/config/site";

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {siteConfig.name}
            </p>

            <h2 className="mt-3 text-xl font-semibold text-white">
              {siteConfig.slogan}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              Canal temático de streaming musical con identidad retro-premium,
              contenido editorial, participación de la audiencia y comunidad
              activa alrededor del universo 80&apos;s.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Explorar
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedLink
                href="/"
                eventAction="nav_home"
                eventLabel="Inicio footer"
                className="inline-flex items-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-300 transition hover:bg-fuchsia-500/20 hover:text-fuchsia-200 hover:shadow-[0_0_16px_rgba(217,70,239,0.35)]"
              >
                Inicio
              </TrackedLink>

              <TrackedLink
                href="/blog"
                eventAction="nav_blog"
                eventLabel="Blog footer"
                className="inline-flex items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)]"
              >
                Blog
              </TrackedLink>

              <TrackedLink
                href="/pedi-tu-tema"
                eventAction="nav_song_requests"
                eventLabel="Pedí tu tema footer"
                className="inline-flex items-center rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 hover:text-violet-200 hover:shadow-[0_0_16px_rgba(139,92,246,0.35)]"
              >
                Pedí tu tema
              </TrackedLink>

              <TrackedLink
                href="/contacto"
                eventAction="nav_contact"
                eventLabel="Contacto footer"
                className="inline-flex items-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/20 hover:text-orange-200 hover:shadow-[0_0_16px_rgba(249,115,22,0.35)]"
              >
                Contacto
              </TrackedLink>

              <TrackedLink
                href={siteConfig.whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                eventAction="whatsapp_community"
                eventLabel="Comunidad footer"
                className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/20 hover:text-green-200 hover:shadow-[0_0_16px_rgba(34,197,94,0.35)]"
              >
                <MessageCircle className="h-4 w-4" />
                Comunidad
              </TrackedLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos
            reservados.
          </p>
          <p>Diseñado para música, comunidad y experiencia editorial.</p>
        </div>
      </div>
    </footer>
  );
}