import Image from "next/image";
import Link from "next/link";

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
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 md:px-8 lg:px-10">
        <header className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-[#000000] px-2 py-2">
            <Image
              src={siteConfig.logoBannerUrl}
              alt={siteConfig.name}
              width={1200}
              height={514}
              priority
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
          <PublicStreamPlayer stream={stream} />
        </div>

        {bottomAssets.length ? (
          <div className="mt-10">
            <PublicSponsorCarousel
              assets={bottomAssets}
              title="Sponsors en rotación"
            />
          </div>
        ) : null}

        <section className="mt-10 grid gap-6 md:grid-cols-3">
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
              <Link
                href="/pedi-tu-tema"
                className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
              >
                Ir al formulario
              </Link>

              <Link
                href="/contacto"
                className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
              >
                Contacto
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}