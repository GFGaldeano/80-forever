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

export async function getPublicStreamConfig(): Promise<PublicStreamConfig | null> {
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

  return (data as PublicStreamConfig | null) ?? null;
}