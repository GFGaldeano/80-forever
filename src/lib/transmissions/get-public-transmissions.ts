import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

export type PublicTransmission = {
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

const PUBLIC_TRANSMISSIONS_SELECT = `
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

export async function getPublicTransmissions(
  locale: Locale = "es"
): Promise<PublicTransmission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transmissions")
    .select(PUBLIC_TRANSMISSIONS_SELECT)
    .eq("is_visible", true)
    .order("aired_at", { ascending: false, nullsFirst: false })
    .order("scheduled_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando transmisiones públicas:", error.message);
    return [];
  }

  const rows = (data as PublicTransmissionRow[] | null) ?? [];

  if (!rows.length) {
    return [];
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
    .in(
      "transmission_id",
      rows.map((row) => row.id)
    )
    .in("locale", [locale, "es"]);

  if (translationsError) {
    console.error(
      "Error cargando traducciones de transmisiones públicas:",
      translationsError.message
    );
  }

  const translations =
    (translationsData as TransmissionTranslationRow[] | null) ?? [];

  return rows.map((row) => {
    const translation = getPreferredTransmissionTranslation(
      translations,
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
  });
}