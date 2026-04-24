import { createClient } from "@/lib/supabase/server";

export type AdminTransmission = {
  id: string;
  episode_code: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  youtube_watch_url: string;
  youtube_embed_url: string;
  youtube_thumbnail_url: string;
  status: "draft" | "scheduled" | "aired" | "archived";
  is_visible: boolean;
  scheduled_at: string | null;
  aired_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const TRANSMISSIONS_SELECT = `
  id,
  episode_code,
  title,
  slug,
  description,
  youtube_url,
  youtube_video_id,
  youtube_watch_url,
  youtube_embed_url,
  youtube_thumbnail_url,
  status,
  is_visible,
  scheduled_at,
  aired_at,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

export async function getAdminTransmissions(): Promise<AdminTransmission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transmissions")
    .select(TRANSMISSIONS_SELECT)
    .order("aired_at", { ascending: false, nullsFirst: false })
    .order("scheduled_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar las transmisiones: ${error.message}`);
  }

  return (data as AdminTransmission[] | null) ?? [];
}