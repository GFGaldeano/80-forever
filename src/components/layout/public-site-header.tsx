"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Radio } from "lucide-react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { siteConfig } from "@/lib/config/site";
import { isValidLocale } from "@/i18n/config";
import { useDictionary, useLocale } from "@/i18n/locale-context";

const navItems = [
  {
    key: "home",
    href: "/",
    action: "nav_home",
  },
  {
    key: "blog",
    href: "/blog",
    action: "nav_blog",
  },
  {
    key: "transmissions",
    href: "/transmisiones",
    action: "nav_transmissions",
  },
  {
    key: "requestSong",
    href: "/pedi-tu-tema",
    action: "nav_song_requests",
  },
  {
    key: "contact",
    href: "/contacto",
    action: "nav_contact",
  },
] as const;

function localizeHref(locale: string, href: string) {
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

function stripLocaleFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isValidLocale(segments[0])) {
    const rest = segments.slice(1);
    return rest.length ? `/${rest.join("/")}` : "/";
  }

  return pathname;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getNavLinkClass(key: string, active: boolean) {
  if (key === "home") {
    return active
      ? "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]"
      : "border border-white/10 bg-black/40 text-white hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-fuchsia-300 hover:shadow-[0_0_16px_rgba(217,70,239,0.28)]";
  }

  if (key === "blog") {
    return active
      ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
      : "border border-white/10 bg-black/40 text-white hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.28)]";
  }

  if (key === "transmissions") {
    return active
      ? "border border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.16)]"
      : "border border-white/10 bg-black/40 text-white hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-[0_0_16px_rgba(244,63,94,0.28)]";
  }

  if (key === "requestSong") {
    return active
      ? "border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.16)]"
      : "border border-white/10 bg-black/40 text-white hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.28)]";
  }

  if (key === "contact") {
    return active
      ? "border border-orange-500/30 bg-orange-500/10 text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.16)]"
      : "border border-white/10 bg-black/40 text-white hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300 hover:shadow-[0_0_16px_rgba(249,115,22,0.28)]";
  }

  return active
    ? "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]"
    : "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]";
}

export function PublicSiteHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const dictionary = useDictionary();

  const currentPublicPath = stripLocaleFromPath(pathname);
  const communityLabel = locale === "en" ? "Community" : "Comunidad";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href={localizeHref(locale, "/")}
            className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]">
              <Radio className="h-5 w-5" />
            </div>

            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 [font-family:var(--font-orbitron)]">
                80&apos;s Forever
              </p>
              <p className="text-sm font-medium text-white">{siteConfig.slogan}</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />

            <TrackedLink
              href={siteConfig.whatsappCommunityUrl}
              target="_blank"
              rel="noreferrer"
              eventAction="whatsapp_community"
              eventLabel={communityLabel}
              className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:bg-green-500/15"
            >
              <MessageCircle className="h-4 w-4" />
              {communityLabel}
            </TrackedLink>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {navItems.map((item) => {
            const active = isActivePath(currentPublicPath, item.href);

            return (
              <TrackedLink
                key={item.href}
                href={localizeHref(locale, item.href)}
                eventAction={item.action}
                eventLabel={dictionary.common[item.key]}
                className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${getNavLinkClass(
                  item.key,
                  active
                )}`}
              >
                {dictionary.common[item.key]}
              </TrackedLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}