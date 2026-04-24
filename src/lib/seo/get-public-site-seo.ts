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

export function buildAbsoluteSiteUrl(siteUrl: string, pathname = "/") {
  const normalizedBase = normalizeUrl(siteUrl) || "http://localhost:3000";
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function getPublicSiteSeo(): Promise<PublicSiteSeo> {
  const settings = await getSiteSettings();

  const fallbackSiteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const siteUrl = normalizeUrl(settings.site_url) || fallbackSiteUrl || "http://localhost:3000";

  return {
    siteName: settings.channel_name || siteConfig.name,
    slogan: settings.slogan || siteConfig.slogan,
    description:
      settings.short_description ||
      settings.default_seo_description ||
      "Canal temático de streaming musical con identidad retro-premium, comunidad activa y archivo editorial del universo 80's.",
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
      settings.default_seo_title || settings.channel_name || siteConfig.name,
    defaultSeoDescription:
      settings.default_seo_description ||
      settings.short_description ||
      "Canal temático de streaming musical con identidad retro-premium, comunidad activa y archivo editorial del universo 80's.",
  };
}