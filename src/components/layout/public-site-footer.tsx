"use client";

import { MapPin, MessageCircle } from "lucide-react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { siteConfig } from "@/lib/config/site";
import { useDictionary, useLocale } from "@/i18n/locale-context";

function localizeHref(locale: string, href: string) {
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Monteros%2C+Tucum%C3%A1n%2C+Argentina";

export function PublicSiteFooter() {
  const locale = useLocale();
  const dictionary = useDictionary();

  const exploreLabel = locale === "en" ? "Explore" : "Explorar";
  const communityLabel = locale === "en" ? "Community" : "Comunidad";
  const footerDescription =
    locale === "en"
      ? "Thematic music streaming channel with a retro-premium identity, editorial content, audience participation and an active community around the 80's universe."
      : "Canal temático de streaming musical con identidad retro-premium, contenido editorial, participación de la audiencia y comunidad activa alrededor del universo 80's.";

  const rightsText =
    locale === "en"
      ? `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`
      : `© ${new Date().getFullYear()} ${siteConfig.name}. Todos los derechos reservados.`;

  const editorialText =
    locale === "en"
      ? "Designed for music, community and editorial experience."
      : "Diseñado para música, comunidad y experiencia editorial.";

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
              {footerDescription}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {exploreLabel}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedLink
                href={localizeHref(locale, "/")}
                eventAction="nav_home"
                eventLabel={`${dictionary.common.home} footer`}
                className="inline-flex items-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-300 transition hover:bg-fuchsia-500/20 hover:text-fuchsia-200 hover:shadow-[0_0_16px_rgba(217,70,239,0.35)]"
              >
                {dictionary.common.home}
              </TrackedLink>

              <TrackedLink
                href={localizeHref(locale, "/blog")}
                eventAction="nav_blog"
                eventLabel={`${dictionary.common.blog} footer`}
                className="inline-flex items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)]"
              >
                {dictionary.common.blog}
              </TrackedLink>

              <TrackedLink
                href={localizeHref(locale, "/transmisiones")}
                eventAction="nav_transmissions"
                eventLabel={`${dictionary.common.transmissions} footer`}
                className="inline-flex items-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200 hover:shadow-[0_0_16px_rgba(244,63,94,0.35)]"
              >
                {dictionary.common.transmissions}
              </TrackedLink>

              <TrackedLink
                href={localizeHref(locale, "/pedi-tu-tema")}
                eventAction="nav_song_requests"
                eventLabel={`${dictionary.common.requestSong} footer`}
                className="inline-flex items-center rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 hover:text-violet-200 hover:shadow-[0_0_16px_rgba(139,92,246,0.35)]"
              >
                {dictionary.common.requestSong}
              </TrackedLink>

              <TrackedLink
                href={localizeHref(locale, "/contacto")}
                eventAction="nav_contact"
                eventLabel={`${dictionary.common.contact} footer`}
                className="inline-flex items-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/20 hover:text-orange-200 hover:shadow-[0_0_16px_rgba(249,115,22,0.35)]"
              >
                {dictionary.common.contact}
              </TrackedLink>

              <TrackedLink
                href={siteConfig.whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                eventAction="whatsapp_community"
                eventLabel={`${communityLabel} footer`}
                className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/20 hover:text-green-200 hover:shadow-[0_0_16px_rgba(34,197,94,0.35)]"
              >
                <MessageCircle className="h-4 w-4" />
                {communityLabel}
              </TrackedLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-500 md:grid md:grid-cols-3 md:items-center">
          <p className="text-center md:text-left">{rightsText}</p>

          <div className="flex justify-center">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15 hover:text-cyan-200"
            >
              <MapPin className="h-4 w-4" />
              {dictionary.common.location}
            </a>
          </div>

          <p className="text-center md:text-right">{editorialText}</p>
        </div>
      </div>
    </footer>
  );
}