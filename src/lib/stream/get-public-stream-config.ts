import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

export type PublicStreamConfig = {
  id: string;
  provider: "youtube" | "facebook" | "external";
  embed_url: string | null;
  status: "live" | "offline" | "upcoming" | "replay";
  title: string;
  subtitle: string | null;
  offline_message: string | null;
  next_live_at: string | null;
  is_active: boolean;
  updated_at: string;
};

type PublicStreamConfigRow = {
  id: string;
  provider: "youtube" | "facebook" | "external";
  embed_url: string | null;
  status: "live" | "offline" | "upcoming" | "replay";
  title: string | null;
  subtitle: string | null;
  offline_message: string | null;
  next_live_at: string | null;
  is_active: boolean;
  updated_at: string;
};

type StreamConfigTranslationRow = {
  locale: Locale;
  title: string | null;
  subtitle: string | null;
  offline_message: string | null;
};

const STREAM_SELECT = `
  id,
  provider,
  embed_url,
  status,
  title,
  subtitle,
  offline_message,
  next_live_at,
  is_active,
  updated_at
`;

function getPreferredTranslation(
  translations: StreamConfigTranslationRow[],
  locale: Locale
) {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "es") ??
    null
  );
}

export async function getPublicStreamConfig(
  locale: Locale = "es"
): Promise<PublicStreamConfig | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stream_config")
    .select(STREAM_SELECT)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error cargando stream público:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const row = data as PublicStreamConfigRow;

  const { data: translationsData, error: translationsError } = await supabase
    .from("stream_config_translations")
    .select(
      `
      locale,
      title,
      subtitle,
      offline_message
    `
    )
    .eq("stream_config_id", row.id)
    .in("locale", [locale, "es"]);

  if (translationsError) {
    console.error(
      "Error cargando traducciones de stream público:",
      translationsError.message
    );
  }

  const translation = getPreferredTranslation(
    (translationsData as StreamConfigTranslationRow[] | null) ?? [],
    locale
  );

  return {
    id: row.id,
    provider: row.provider,
    embed_url: row.embed_url,
    status: row.status,
    title: translation?.title || row.title || "",
    subtitle: translation?.subtitle || row.subtitle,
    offline_message:
      translation?.offline_message || row.offline_message,
    next_live_at: row.next_live_at,
    is_active: row.is_active,
    updated_at: row.updated_at,
  };
}