import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { notFound } from "next/navigation";

import { ContactMessageForm } from "@/components/forms/contact-message-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteConfig } from "@/lib/config/site";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";

export const dynamic = "force-dynamic";

type LocalizedContactPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function getLocalizedPublicHref(locale: Locale, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: Readonly<LocalizedContactPageProps>): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const seo = await getPublicSiteSeo();
  const dictionary = await getDictionary(locale);

  const title = `${dictionary.contactPage.title} | ${seo.siteName}`;
  const description = dictionary.contactPage.description;
  const canonical = buildAbsoluteSiteUrl(seo.siteUrl, `/${locale}/contacto`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: buildAbsoluteSiteUrl(seo.siteUrl, "/es/contacto"),
        en: buildAbsoluteSiteUrl(seo.siteUrl, "/en/contacto"),
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

export default async function LocalizedContactPage({
  params,
}: Readonly<LocalizedContactPageProps>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12 md:px-8">
        <div className="border-b border-white/10 pb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
            <Link
              href={getLocalizedPublicHref(locale, "/")}
              className="inline-flex rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300 transition hover:bg-fuchsia-500/15"
            >
              {dictionary.contactPage.backHome}
            </Link>

            <LanguageSwitcher />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {siteConfig.name}
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-fuchsia-300">
            <MessagesSquare className="h-4 w-4" />
            {dictionary.contactPage.badge}
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            {dictionary.contactPage.title}
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            {dictionary.contactPage.description}
          </p>
        </div>

        <div className="mt-10">
          <ContactMessageForm />
        </div>
      </div>
    </main>
  );
}