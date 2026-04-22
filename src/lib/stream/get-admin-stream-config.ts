import { createClient } from "@/lib/supabase/server";

export type AdminStreamConfig = {
  id: string;
  provider: "youtube" | "facebook" | "external";
  source_url: string | null;
  embed_url: string | null;
  status: "live" | "offline" | "upcoming" | "replay";
  title: string;
  subtitle: string | null;
  offline_message: string | null;
  next_live_at: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const STREAM_SELECT = `
  id,
  provider,
  source_url,
  embed_url,
  status,
  title,
  subtitle,
  offline_message,
  next_live_at,
  is_active,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

export async function getAdminStreamConfig(): Promise<AdminStreamConfig | null> {
  const supabase = await createClient();

  const { data: activeData, error: activeError } = await supabase
    .from("stream_config")
    .select(STREAM_SELECT)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (activeError) {
    throw new Error(`No se pudo cargar la configuración activa del stream: ${activeError.message}`);
  }

  if (activeData?.length) {
    return activeData[0] as AdminStreamConfig;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("stream_config")
    .select(STREAM_SELECT)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (fallbackError) {
    throw new Error(`No se pudo cargar la configuración del stream: ${fallbackError.message}`);
  }

  return (fallbackData?.[0] as AdminStreamConfig | undefined) ?? null;
}