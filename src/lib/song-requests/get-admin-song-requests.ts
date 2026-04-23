import { createClient } from "@/lib/supabase/server";

export type AdminSongRequest = {
  id: string;
  name_alias: string;
  song_title: string;
  artist_name: string;
  message: string | null;
  social_handle: string | null;
  status: "new" | "read" | "highlighted" | "approved" | "archived";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

const SONG_REQUEST_SELECT = `
  id,
  name_alias,
  song_title,
  artist_name,
  message,
  social_handle,
  status,
  admin_notes,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
`;

export async function getAdminSongRequests(): Promise<AdminSongRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("song_requests")
    .select(SONG_REQUEST_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `No se pudieron cargar los pedidos musicales: ${error.message}`
    );
  }

  return (data as AdminSongRequest[] | null) ?? [];
}