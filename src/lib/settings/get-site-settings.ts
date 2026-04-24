import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";

export type SiteSettings = {
  site_key: "primary";
  channel_name: string;
  slogan: string;
  short_description: string;
  contact_email: string;
  whatsapp_community_url: string;
  primary_logo_url: string;
  banner_logo_url: string;
  default_social_image_url: string;
  site_url: string;
  default_seo_title: string;
  default_seo_description: string;
  youtube_channel_url: string;
  global_notice: string;
  institutional_text: string;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type SiteSettingsRow = {
  site_key: "primary";
  channel_name: string | null;
  slogan: string | null;
  short_description: string | null;
  contact_email: string | null;
  whatsapp_community_url: string | null;
  primary_logo_url: string | null;
  banner_logo_url: string | null;
  default_social_image_url: string | null;
  site_url: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  youtube_channel_url: string | null;
  global_notice: string | null;
  institutional_text: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function getDefaultSiteSettings(): SiteSettings {
  return {
    site_key: "primary",
    channel_name: siteConfig.name,
    slogan: siteConfig.slogan,
    short_description: "",
    contact_email: "",
    whatsapp_community_url: siteConfig.whatsappCommunityUrl,
    primary_logo_url: siteConfig.logoBannerUrl,
    banner_logo_url: siteConfig.logoBannerUrl,
    default_social_image_url: siteConfig.logoBannerUrl,
    site_url: "",
    default_seo_title: siteConfig.name,
    default_seo_description: "",
    youtube_channel_url: "",
    global_notice: "",
    institutional_text: "",
    updated_by: null,
    created_at: null,
    updated_at: null,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      `
      site_key,
      channel_name,
      slogan,
      short_description,
      contact_email,
      whatsapp_community_url,
      primary_logo_url,
      banner_logo_url,
      default_social_image_url,
      site_url,
      default_seo_title,
      default_seo_description,
      youtube_channel_url,
      global_notice,
      institutional_text,
      updated_by,
      created_at,
      updated_at
    `
    )
    .eq("site_key", "primary")
    .maybeSingle();

  const defaults = getDefaultSiteSettings();

  if (error || !data) {
    if (error) {
      console.error("Error cargando site settings:", error.message);
    }

    return defaults;
  }

  const row = data as SiteSettingsRow;

  return {
    site_key: "primary",
    channel_name: row.channel_name || defaults.channel_name,
    slogan: row.slogan || defaults.slogan,
    short_description: row.short_description || defaults.short_description,
    contact_email: row.contact_email || defaults.contact_email,
    whatsapp_community_url:
      row.whatsapp_community_url || defaults.whatsapp_community_url,
    primary_logo_url: row.primary_logo_url || defaults.primary_logo_url,
    banner_logo_url: row.banner_logo_url || defaults.banner_logo_url,
    default_social_image_url:
      row.default_social_image_url || defaults.default_social_image_url,
    site_url: row.site_url || defaults.site_url,
    default_seo_title: row.default_seo_title || defaults.default_seo_title,
    default_seo_description:
      row.default_seo_description || defaults.default_seo_description,
    youtube_channel_url:
      row.youtube_channel_url || defaults.youtube_channel_url,
    global_notice: row.global_notice || defaults.global_notice,
    institutional_text: row.institutional_text || defaults.institutional_text,
    updated_by: row.updated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}