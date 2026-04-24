import Image from "next/image";
import { MessageCircle } from "lucide-react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { StreamInteractionTracker } from "@/components/analytics/stream-interaction-tracker";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicSponsorCarousel } from "@/components/sponsors/public-sponsor-carousel";
import { PublicStreamPlayer } from "@/components/streaming/public-stream-player";
import { StreamStatusBadge } from "@/components/streaming/stream-status-badge";
import { siteConfig } from "@/lib/config/site";
import { getPublicSponsorAssets } from "@/lib/sponsors/get-public-sponsor-assets";
import { getPublicStreamConfig } from "@/lib/stream/get-public-stream-config";

export const dynamic = "force-dynamic";

function getHeroCopy(
  status: "live" | "offline" | "upcoming" | "replay"
) {
  switch (status) {
    case "live":
      return "La señal está activa y lista para acompañarte con clásicos inolvidables.";
    case "upcoming":
      return "La próxima emisión ya está programada. Muy pronto vuelve la música que no tiene tiempo.";
    case "replay":
      return "Mientras no estamos en vivo, podés revivir una selección especial de himnos ochentosos.";
    case "offline":
    default:
      return "Canal temático de streaming musical ochentoso con identidad neón y espíritu retro-premium.";
  }
}

export default async function HomePage() {
  const stream = await getPublicStreamConfig();
  const { topAssets, bottomAssets } = await getPublicSponsorAssets();
  const status = stream?.status ?? "offline";

  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-10 md:px-8 lg:px-10">
        <header className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-[#000000] px-2 py-2">
            <Image
              src={siteConfig.logoBannerUrl}
              alt={siteConfig.name}
              width={1200}
              height={514}
              priority
              unoptimized
              className="h-auto w-full max-w-[520px] select-none md:max-w-[620px]"
            />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.32em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {siteConfig.name}
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {stream?.title || siteConfig.name}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            {stream?.subtitle || getHeroCopy(status)}
          </p>

          <div className="mt-6">
            <StreamStatusBadge status={status} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <TrackedLink
              href="/blog"
              eventAction="home_blog"
              eventLabel="Ir al blog"
              className="inline-flex rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300 transition hover:bg-fuchsia-500/15"
            >
              Ir al blog
            </TrackedLink>

            <TrackedLink
              href="/transmisiones"
              eventAction="home_transmissions"
              eventLabel="Transmisiones pasadas"
              className="inline-flex rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/15"
            >
              Transmisiones pasadas
            </TrackedLink>

            <TrackedLink
              href="/contacto"
              eventAction="home_contact"
              eventLabel="Contacto"
              className="inline-flex rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.18)] transition hover:border-orange-300/70 hover:bg-orange-500/15 hover:text-orange-200 hover:shadow-[0_0_24px_rgba(249,115,22,0.28)]"
            >
              Contacto
            </TrackedLink>
          </div>
        </header>

        {topAssets.length ? (
          <div className="mt-10">
            <PublicSponsorCarousel
              assets={topAssets}
              title="Sponsors destacados"
            />
          </div>
        ) : null}

        <div className="mt-10">
          <StreamInteractionTracker
            streamStatus={status}
            streamTitle={stream?.title ?? null}
          >
            <PublicStreamPlayer stream={stream} />
          </StreamInteractionTracker>
        </div>

        {bottomAssets.length ? (
          <div className="mt-10">
            <PublicSponsorCarousel
              assets={bottomAssets}
              title="Sponsors en rotación"
            />
          </div>
        ) : null}

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Concepto
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Señal digital temática
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              80&apos;s Forever no es solo una web con un video embebido: busca
              sentirse como un canal musical con identidad propia.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Eslogan
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {siteConfig.slogan}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Nostalgia, energía y una curaduría musical pensada como
              experiencia audiovisual.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Historial
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Transmisiones pasadas
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Explorá emisiones anteriores, reviví programas ya emitidos y accedé
              al archivo audiovisual de 80&apos;s Forever.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <TrackedLink
                href="/transmisiones"
                eventAction="home_transmissions"
                eventLabel="Ver historial"
                className="inline-flex rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/15"
              >
                Ver historial
              </TrackedLink>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Interacción
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Pedí tu tema
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Ya podés dejar tu canción, artista o dedicatoria para futuras
              emisiones de 80&apos;s Forever.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <TrackedLink
                href="/pedi-tu-tema"
                eventAction="home_song_requests"
                eventLabel="Ir al formulario"
                className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
              >
                Ir al formulario
              </TrackedLink>
            </div>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-zinc-950/70 p-6 shadow-[0_0_0_1px_rgba(34,197,94,0.06),0_0_40px_rgba(34,197,94,0.10)]">
            <div className="inline-flex rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-green-400 shadow-[0_0_24px_rgba(34,197,94,0.18)]">
              <MessageCircle className="h-6 w-6" />
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Comunidad
            </p>

            <h2 className="mt-3 text-xl font-semibold text-white">
              Sumate a nuestra comunidad
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Recibí avisos de transmisión, efemérides musicales, novedades del
              canal y actualizaciones especiales de 80&apos;s Forever.
            </p>

            <TrackedLink
              href={siteConfig.whatsappCommunityUrl}
              target="_blank"
              rel="noreferrer"
              eventAction="whatsapp_community"
              eventLabel="Unirme por WhatsApp"
              className="mt-5 inline-flex rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:bg-green-500/15"
            >
              Unirme por WhatsApp
            </TrackedLink>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}