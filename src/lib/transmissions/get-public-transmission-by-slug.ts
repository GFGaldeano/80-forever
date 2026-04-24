import { createClient } from "@/lib/supabase/server";
import type { PublicTransmission } from "@/lib/transmissions/get-public-transmissions";

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

export async function getPublicTransmissionBySlug(
  slug: string
): Promise<PublicTransmission | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transmissions")
    .select(PUBLIC_TRANSMISSION_BY_SLUG_SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();

  if (error) {
    console.error("Error cargando transmisión pública por slug:", error.message);
    return null;
  }

  return (data as PublicTransmission | null) ?? null;
}