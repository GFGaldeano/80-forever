import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import type { PublicTransmission } from "@/lib/transmissions/get-public-transmissions";

type PublicTransmissionRow = {
  id: string;
  episode_code: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_watch_url: string;
  youtube_embed_url: string;
  youtube_thumbnail_url: string;
  status: "draft" | "scheduled" | "aired" | "archived";
  aired_at: string | null;
  scheduled_at: string | null;
  created_at: string;
};

type TransmissionTranslationRow = {
  transmission_id: string;
  locale: Locale;
  title: string | null;
  slug: string | null;
  description: string | null;
};

const PUBLIC_TRANSMISSION_BY_SLUG_SELECT = `
  id,
  episode_code,
  title,
  slug,
  description,
  youtube_watch_url,
  youtube_embed_url,
  youtube_thumbnail_url,
  status,
  aired_at,
  scheduled_at,
  created_at
`;

function getPreferredTransmissionTranslation(
  translations: TransmissionTranslationRow[],
  transmissionId: string,
  locale: Locale
) {
  const matches = translations.filter(
    (item) => item.transmission_id === transmissionId
  );

  return (
    matches.find((item) => item.locale === locale) ??
    matches.find((item) => item.locale === "es") ??
    null
  );
}

export async function getPublicTransmissionBySlug(
  slug: string,
  locale: Locale = "es"
): Promise<PublicTransmission | null> {
  const supabase = await createClient();

  let row: PublicTransmissionRow | null = null;

  const { data: baseData, error: baseError } = await supabase
    .from("transmissions")
    .select(PUBLIC_TRANSMISSION_BY_SLUG_SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();

  if (baseError) {
    console.error(
      "Error cargando transmisión pública por slug base:",
      baseError.message
    );
  }

  if (baseData) {
    row = baseData as PublicTransmissionRow;
  }

  if (!row) {
    const { data: translationMatches, error: translationMatchError } =
      await supabase
        .from("transmission_translations")
        .select(
          `
          transmission_id,
          locale
        `
        )
        .eq("slug", slug)
        .in("locale", [locale, "es"]);

    if (translationMatchError) {
      console.error(
        "Error buscando transmisión pública por slug traducido:",
        translationMatchError.message
      );
      return null;
    }

    const matches =
      (translationMatches as Array<{
        transmission_id: string;
        locale: Locale;
      }> | null) ?? [];

    const preferredMatch =
      matches.find((item) => item.locale === locale) ??
      matches.find((item) => item.locale === "es") ??
      null;

    if (!preferredMatch) {
      return null;
    }

    const { data: translatedBaseData, error: translatedBaseError } =
      await supabase
        .from("transmissions")
        .select(PUBLIC_TRANSMISSION_BY_SLUG_SELECT)
        .eq("id", preferredMatch.transmission_id)
        .eq("is_visible", true)
        .maybeSingle();

    if (translatedBaseError) {
      console.error(
        "Error cargando transmisión pública por id traducido:",
        translatedBaseError.message
      );
      return null;
    }

    if (!translatedBaseData) {
      return null;
    }

    row = translatedBaseData as PublicTransmissionRow;
  }

  const { data: translationsData, error: translationsError } = await supabase
    .from("transmission_translations")
    .select(
      `
      transmission_id,
      locale,
      title,
      slug,
      description
    `
    )
    .eq("transmission_id", row.id)
    .in("locale", [locale, "es"]);

  if (translationsError) {
    console.error(
      "Error cargando traducciones de transmisión pública:",
      translationsError.message
    );
  }

  const translation = getPreferredTransmissionTranslation(
    (translationsData as TransmissionTranslationRow[] | null) ?? [],
    row.id,
    locale
  );

  return {
    id: row.id,
    episode_code: row.episode_code,
    title: translation?.title ?? row.title,
    slug: translation?.slug ?? row.slug,
    description: translation?.description ?? row.description,
    youtube_watch_url: row.youtube_watch_url,
    youtube_embed_url: row.youtube_embed_url,
    youtube_thumbnail_url: row.youtube_thumbnail_url,
    status: row.status,
    aired_at: row.aired_at,
    scheduled_at: row.scheduled_at,
    created_at: row.created_at,
  };
}