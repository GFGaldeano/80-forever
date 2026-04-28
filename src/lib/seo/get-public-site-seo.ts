import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/config/site";
import { getSiteSettings } from "@/lib/settings/get-site-settings";

export type PublicSiteSeo = {
  siteName: string;
  slogan: string;
  description: string;
  siteUrl: string;
  socialImageUrl: string;
  logoUrl: string;
  contactEmail: string;
  youtubeChannelUrl: string;
  whatsappCommunityUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
};

function normalizeUrl(value?: string | null) {
  if (!value) return "";

  return value.trim().replace(/\/+$/, "");
}

function getDefaultDescription(locale: Locale) {
  return locale === "en"
    ? "Themed music streaming channel with retro-premium identity, active community and editorial archive from the 80's universe."
    : "Canal temático de streaming musical con identidad retro-premium, comunidad activa y archivo editorial del universo 80's.";
}

export function buildAbsoluteSiteUrl(siteUrl: string, pathname = "/") {
  const normalizedBase = normalizeUrl(siteUrl) || "http://localhost:3000";
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function getPublicSiteSeo(
  locale: Locale = "es"
): Promise<PublicSiteSeo> {
  const settings = await getSiteSettings(locale);

  const fallbackSiteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const siteUrl =
    normalizeUrl(settings.site_url) || fallbackSiteUrl || "http://localhost:3000";

  const siteName =
    settings.channel_name || settings.site_name || siteConfig.name;

  const slogan = settings.slogan || settings.tagline || siteConfig.slogan;

  const description =
    settings.short_description ||
    settings.default_seo_description ||
    getDefaultDescription(locale);

  return {
    siteName,
    slogan,
    description,
    siteUrl,
    socialImageUrl:
      settings.default_social_image_url ||
      settings.banner_logo_url ||
      settings.primary_logo_url ||
      siteConfig.logoBannerUrl,
    logoUrl:
      settings.primary_logo_url ||
      settings.banner_logo_url ||
      siteConfig.logoBannerUrl,
    contactEmail: settings.contact_email || "",
    youtubeChannelUrl: settings.youtube_channel_url || "",
    whatsappCommunityUrl:
      settings.whatsapp_community_url || siteConfig.whatsappCommunityUrl,
    defaultSeoTitle:
      settings.default_seo_title || siteName || siteConfig.name,
    defaultSeoDescription:
      settings.default_seo_description ||
      settings.short_description ||
      getDefaultDescription(locale),
  };
}