import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getPublicTransmissionBySlug } from "@/lib/transmissions/get-public-transmission-by-slug";
import { siteConfig } from "@/lib/config/site";
import { absoluteUrl, buildMetaDescription } from "@/lib/seo";

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
  const { slug } = await params;
  const transmission = await getPublicTransmissionBySlug(slug);

  if (!transmission) {
    return {
      title: `Transmisión no encontrada | ${siteConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    transmission.description ||
    buildMetaDescription(
      `Reviví ${transmission.title} en el historial de transmisiones de ${siteConfig.name}.`,
      160
    );

  const title = `${transmission.title} | Transmisiones | ${siteConfig.name}`;
  const canonical = absoluteUrl(`/transmisiones/${transmission.slug}`);
  const imageUrl = transmission.youtube_thumbnail_url || siteConfig.logoBannerUrl;

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

  return (
    <PublicShell>
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