import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
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

type LocalizedTransmissionsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
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

function getLocalizedPublicHref(locale: Locale, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: Readonly<LocalizedTransmissionsPageProps>): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const seo = await getPublicSiteSeo();
  const dictionary = await getDictionary(locale);

  const title = `${dictionary.transmissionsPage.title} | ${seo.siteName}`;
  const description = dictionary.transmissionsPage.description;
  const canonical = buildAbsoluteSiteUrl(
    seo.siteUrl,
    getLocalizedPublicHref(locale, "/transmisiones")
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: buildAbsoluteSiteUrl(seo.siteUrl, "/es/transmisiones"),
        en: buildAbsoluteSiteUrl(seo.siteUrl, "/en/transmisiones"),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
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

export default async function LocalizedTransmissionsPage({
  params,
}: Readonly<LocalizedTransmissionsPageProps>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [transmissions, seo, dictionary] = await Promise.all([
    getPublicTransmissions(),
    getPublicSiteSeo(),
    getDictionary(locale),
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `${dictionary.transmissionsPage.title} | ${seo.siteName}`,
    description: dictionary.transmissionsPage.description,
    url: buildAbsoluteSiteUrl(
      seo.siteUrl,
      getLocalizedPublicHref(locale, "/transmisiones")
    ),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: dictionary.common.home,
      url: buildAbsoluteSiteUrl(seo.siteUrl, getLocalizedPublicHref(locale, "/")),
    },
    {
      name: dictionary.common.transmissions,
      url: buildAbsoluteSiteUrl(
        seo.siteUrl,
        getLocalizedPublicHref(locale, "/transmisiones")
      ),
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
            {dictionary.transmissionsPage.title}
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            {dictionary.transmissionsPage.description}
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
                    <div className="relative aspect-[16/9] bg-black">
                      <Image
                        src={transmission.youtube_thumbnail_url}
                        alt={transmission.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      {formatDate(dateValue, locale)}
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {transmission.title}
                    </h2>

                    <p className="mt-3 text-sm font-medium text-fuchsia-300">
                      {transmission.episode_code}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-zinc-400">
                      {transmission.description ||
                        dictionary.transmissionsPage.noDescription}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <TrackedLink
                        href={getLocalizedPublicHref(
                          locale,
                          `/transmisiones/${transmission.slug}`
                        )}
                        eventAction="transmission_history_open"
                        eventLabel={transmission.title}
                        eventMetadata={{
                          slug: transmission.slug,
                          episode_code: transmission.episode_code,
                        }}
                        className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
                      >
                        {dictionary.common.viewTransmission}
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
                        {dictionary.common.watchOnYouTube}
                      </TrackedLink>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 px-6 py-12 text-center text-zinc-400 lg:col-span-2">
              {dictionary.transmissionsPage.empty}
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}