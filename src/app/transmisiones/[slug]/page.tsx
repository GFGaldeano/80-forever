import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getPublicTransmissionBySlug } from "@/lib/transmissions/get-public-transmission-by-slug";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";
import {
  buildBreadcrumbJsonLd,
  buildVideoObjectJsonLd,
  toJsonLd,
} from "@/lib/seo/json-ld";

export const dynamic = "force-dynamic";

type TransmissionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

export async function generateMetadata({
  params,
}: Readonly<TransmissionDetailPageProps>): Promise<Metadata> {
  const seo = await getPublicSiteSeo();
  const { slug } = await params;
  const transmission = await getPublicTransmissionBySlug(slug);

  if (!transmission) {
    return {
      title: `Transmisión no encontrada | ${seo.siteName}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    transmission.description ||
    `Reviví ${transmission.title} en el historial de transmisiones de ${seo.siteName}.`;

  const title = `${transmission.title} | Transmisiones | ${seo.siteName}`;
  const canonical = buildAbsoluteSiteUrl(
    seo.siteUrl,
    `/transmisiones/${transmission.slug}`
  );
  const imageUrl = transmission.youtube_thumbnail_url || seo.socialImageUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "video.other",
      images: [
        {
          url: imageUrl,
          alt: transmission.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function TransmissionDetailPage({
  params,
}: Readonly<TransmissionDetailPageProps>) {
  const seo = await getPublicSiteSeo();
  const { slug } = await params;
  const transmission = await getPublicTransmissionBySlug(slug);

  if (!transmission) {
    notFound();
  }

  const dateValue = getTransmissionDateLabel(
    transmission.aired_at,
    transmission.scheduled_at,
    transmission.created_at
  );

  const pageUrl = buildAbsoluteSiteUrl(
    seo.siteUrl,
    `/transmisiones/${transmission.slug}`
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: "Inicio",
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/"),
    },
    {
      name: "Transmisiones",
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/transmisiones"),
    },
    {
      name: transmission.title,
      url: pageUrl,
    },
  ]);

  const videoJsonLd = buildVideoObjectJsonLd({
    name: transmission.title,
    description: transmission.description || undefined,
    thumbnailUrl: transmission.youtube_thumbnail_url || undefined,
    embedUrl: transmission.youtube_embed_url || undefined,
    contentUrl: transmission.youtube_watch_url || undefined,
    uploadDate:
      transmission.aired_at || transmission.scheduled_at || transmission.created_at,
    publisherName: seo.siteName,
    publisherLogo: seo.logoUrl,
  });

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(videoJsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-8">
        <TrackedLink
          href="/transmisiones"
          eventAction="transmission_detail_back_to_history"
          eventLabel="Volver al historial"
          className="inline-flex rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.18)] backdrop-blur-sm transition hover:border-fuchsia-300/70 hover:bg-fuchsia-500/15 hover:text-fuchsia-200 hover:shadow-[0_0_24px_rgba(217,70,239,0.28)]"
        >
          Volver a transmisiones
        </TrackedLink>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {formatDate(dateValue)}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {transmission.title}
          </h1>

          <p className="mt-4 text-sm font-medium text-fuchsia-300">
            {transmission.episode_code}
          </p>

          {transmission.description ? (
            <p className="mt-5 text-base leading-8 text-zinc-400">
              {transmission.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href={transmission.youtube_watch_url}
              target="_blank"
              rel="noreferrer"
              eventAction="transmission_detail_youtube"
              eventLabel={transmission.title}
              eventMetadata={{
                slug: transmission.slug,
                episode_code: transmission.episode_code,
              }}
              className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
            >
              Ver en YouTube
            </TrackedLink>
          </div>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black">
          <div className="aspect-video w-full">
            <iframe
              src={transmission.youtube_embed_url}
              title={transmission.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}