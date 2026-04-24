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
  scheduled_at
`;

export async function getPublicTransmissions(): Promise<PublicTransmission[]> {
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

  return (data as PublicTransmission[] | null) ?? [];
}