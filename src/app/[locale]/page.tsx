import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { StreamInteractionTracker } from "@/components/analytics/stream-interaction-tracker";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicSponsorCarousel } from "@/components/sponsors/public-sponsor-carousel";
import { PublicStreamPlayer } from "@/components/streaming/public-stream-player";
import { StreamStatusBadge } from "@/components/streaming/stream-status-badge";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteConfig } from "@/lib/config/site";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  toJsonLd,
} from "@/lib/seo/json-ld";
import { getPublicSponsorAssets } from "@/lib/sponsors/get-public-sponsor-assets";
import { getPublicStreamConfig } from "@/lib/stream/get-public-stream-config";

export const dynamic = "force-dynamic";

type LocalizedHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function getLocalizedPublicHref(locale: Locale, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

function getHeroCopy(
  status: "live" | "offline" | "upcoming" | "replay",
  dictionary: Awaited<ReturnType<typeof getDictionary>>
) {
  switch (status) {
    case "live":
      return dictionary.homePage.heroFallbackLive;
    case "upcoming":
      return dictionary.homePage.heroFallbackUpcoming;
    case "replay":
      return dictionary.homePage.heroFallbackReplay;
    case "offline":
    default:
      return dictionary.homePage.heroFallbackOffline;
  }
}

export async function generateMetadata({
  params,
}: Readonly<LocalizedHomePageProps>): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const seo = await getPublicSiteSeo(locale);
  const title = seo.defaultSeoTitle || seo.siteName;
  const description = seo.defaultSeoDescription || seo.description;
  const canonical = buildAbsoluteSiteUrl(seo.siteUrl, `/${locale}`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: buildAbsoluteSiteUrl(seo.siteUrl, "/es"),
        en: buildAbsoluteSiteUrl(seo.siteUrl, "/en"),
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

export default async function LocalizedHomePage({
  params,
}: Readonly<LocalizedHomePageProps>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [stream, sponsors, seo, dictionary] = await Promise.all([
    getPublicStreamConfig(locale),
    getPublicSponsorAssets(),
    getPublicSiteSeo(),
    getDictionary(locale),
  ]);

  const { topAssets, bottomAssets } = sponsors;
  const status = stream?.status ?? "offline";

  const organizationJsonLd = buildOrganizationJsonLd({
    siteName: seo.siteName,
    siteUrl: seo.siteUrl,
    logoUrl: seo.logoUrl,
    contactEmail: seo.contactEmail,
    sameAs: [seo.youtubeChannelUrl, seo.whatsappCommunityUrl].filter(Boolean),
  });

  const websiteJsonLd = buildWebSiteJsonLd({
    siteName: seo.siteName,
    siteUrl: seo.siteUrl,
    description: seo.description,
  });

  return (
    <PublicShell locale={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(websiteJsonLd) }}
      />

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
            {stream?.subtitle || getHeroCopy(status, dictionary)}
          </p>

          <div className="mt-6">
            <StreamStatusBadge status={status} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <TrackedLink
              href={getLocalizedPublicHref(locale, "/blog")}
              eventAction="home_blog"
              eventLabel={dictionary.homePage.goToBlog}
              className="inline-flex rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300 transition hover:bg-fuchsia-500/15"
            >
              {dictionary.homePage.goToBlog}
            </TrackedLink>

            <TrackedLink
              href={getLocalizedPublicHref(locale, "/transmisiones")}
              eventAction="home_transmissions"
              eventLabel={dictionary.homePage.pastTransmissions}
              className="inline-flex rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/15"
            >
              {dictionary.homePage.pastTransmissions}
            </TrackedLink>

            <TrackedLink
              href={getLocalizedPublicHref(locale, "/contacto")}
              eventAction="home_contact"
              eventLabel={dictionary.homePage.contact}
              className="inline-flex rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.18)] transition hover:border-orange-300/70 hover:bg-orange-500/15 hover:text-orange-200 hover:shadow-[0_0_24px_rgba(249,115,22,0.28)]"
            >
              {dictionary.homePage.contact}
            </TrackedLink>
          </div>
        </header>

        {topAssets.length ? (
          <div className="mt-10">
            <PublicSponsorCarousel
              assets={topAssets}
              title={dictionary.homePage.featuredSponsors}
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
              title={dictionary.homePage.rotatingSponsors}
            />
          </div>
        ) : null}

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {dictionary.homePage.conceptLabel}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {dictionary.homePage.conceptTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {dictionary.homePage.conceptText}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {dictionary.homePage.sloganLabel}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {siteConfig.slogan}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {dictionary.homePage.sloganText}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {dictionary.homePage.archiveLabel}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {dictionary.homePage.archiveTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {dictionary.homePage.archiveText}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <TrackedLink
                href={getLocalizedPublicHref(locale, "/transmisiones")}
                eventAction="home_transmissions"
                eventLabel={dictionary.homePage.viewArchive}
                className="inline-flex rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/15"
              >
                {dictionary.homePage.viewArchive}
              </TrackedLink>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {dictionary.homePage.interactionLabel}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {dictionary.homePage.interactionTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {dictionary.homePage.interactionText}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <TrackedLink
                href={getLocalizedPublicHref(locale, "/pedi-tu-tema")}
                eventAction="home_song_requests"
                eventLabel={dictionary.homePage.goToForm}
                className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
              >
                {dictionary.homePage.goToForm}
              </TrackedLink>
            </div>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-zinc-950/70 p-6 shadow-[0_0_0_1px_rgba(34,197,94,0.06),0_0_40px_rgba(34,197,94,0.10)]">
            <div className="inline-flex rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-green-400 shadow-[0_0_24px_rgba(34,197,94,0.18)]">
              <MessageCircle className="h-6 w-6" />
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {dictionary.homePage.communityLabel}
            </p>

            <h2 className="mt-3 text-xl font-semibold text-white">
              {dictionary.homePage.communityTitle}
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {dictionary.homePage.communityText}
            </p>

            <TrackedLink
              href={siteConfig.whatsappCommunityUrl}
              target="_blank"
              rel="noreferrer"
              eventAction="whatsapp_community"
              eventLabel={dictionary.homePage.joinWhatsapp}
              className="mt-5 inline-flex rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:bg-green-500/15"
            >
              {dictionary.homePage.joinWhatsapp}
            </TrackedLink>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}