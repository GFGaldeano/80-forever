import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getPublicTransmissions } from "@/lib/transmissions/get-public-transmissions";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  toJsonLd,
} from "@/lib/seo/json-ld";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTransmissionDateLabel(
  airedAt?: string | null,
  scheduledAt?: string | null,
  createdAt?: string | null
) {
  return airedAt || scheduledAt || createdAt || null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublicSiteSeo();

  const title = `Transmisiones pasadas | ${seo.siteName}`;
  const description =
    "Explorá el historial de transmisiones de 80's Forever, reviví emisiones anteriores y accedé a cada programa desde YouTube.";

  return {
    title,
    description,
    alternates: {
      canonical: buildAbsoluteSiteUrl(seo.siteUrl, "/transmisiones"),
    },
    openGraph: {
      title,
      description,
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/transmisiones"),
      type: "website",
      images: [
        {
          url: seo.socialImageUrl,
          alt: seo.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.socialImageUrl],
    },
  };
}

export default async function TransmissionsPage() {
  const [transmissions, seo] = await Promise.all([
    getPublicTransmissions(),
    getPublicSiteSeo(),
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `Transmisiones pasadas | ${seo.siteName}`,
    description:
      "Historial de transmisiones emitidas y archivadas para revivir desde YouTube.",
    url: buildAbsoluteSiteUrl(seo.siteUrl, "/transmisiones"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: "Inicio",
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/"),
    },
    {
      name: "Transmisiones",
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/transmisiones"),
    },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <header className="border-b border-white/10 pb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {seo.siteName}
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Transmisiones pasadas
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Reviví emisiones anteriores, explorá episodios destacados y accedé al
            historial audiovisual de 80&apos;s Forever.
          </p>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          {transmissions.length ? (
            transmissions.map((transmission) => {
              const dateValue = getTransmissionDateLabel(
                transmission.aired_at,
                transmission.scheduled_at,
                transmission.created_at
              );

              return (
                <article
                  key={transmission.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70"
                >
                  {transmission.youtube_thumbnail_url ? (
                    <div className="aspect-[16/9] bg-black">
                      <img
                        src={transmission.youtube_thumbnail_url}
                        alt={transmission.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      {formatDate(dateValue)}
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {transmission.title}
                    </h2>

                    <p className="mt-3 text-sm font-medium text-fuchsia-300">
                      {transmission.episode_code}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-zinc-400">
                      {transmission.description ||
                        "Sin descripción editorial disponible."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <TrackedLink
                        href={`/transmisiones/${transmission.slug}`}
                        eventAction="transmission_history_open"
                        eventLabel={transmission.title}
                        eventMetadata={{
                          slug: transmission.slug,
                          episode_code: transmission.episode_code,
                        }}
                        className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
                      >
                        Ver transmisión
                      </TrackedLink>

                      <TrackedLink
                        href={transmission.youtube_watch_url}
                        target="_blank"
                        rel="noreferrer"
                        eventAction="transmission_history_youtube"
                        eventLabel={transmission.title}
                        eventMetadata={{
                          slug: transmission.slug,
                          episode_code: transmission.episode_code,
                        }}
                        className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
                      >
                        Ver en YouTube
                      </TrackedLink>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 px-6 py-12 text-center text-zinc-400 lg:col-span-2">
              Todavía no hay transmisiones visibles en el historial.
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}