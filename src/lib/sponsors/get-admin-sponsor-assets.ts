import { createClient } from "@/lib/supabase/server";

export type AdminSponsorAsset = {
  id: string;
  sponsor_id: string;
  sponsor_name: string;
  asset_type: "image" | "gif";
  placement: "top" | "bottom" | "both";
  asset_url: string;
  cloudinary_public_id: string | null;
  duration_seconds: number;
  priority: number;
  link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_visible: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getAdminSponsorAssets(): Promise<AdminSponsorAsset[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsor_assets")
    .select(
      `
      id,
      sponsor_id,
      asset_type,
      placement,
      asset_url,
      cloudinary_public_id,
      duration_seconds,
      priority,
      link_url,
      starts_at,
      ends_at,
      is_visible,
      is_active,
      created_at,
      updated_at,
      sponsors (
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los assets: ${error.message}`);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      sponsor_id: item.sponsor_id,
      sponsor_name:
        Array.isArray(item.sponsors) && item.sponsors.length > 0
          ? item.sponsors[0]?.name ?? "Sponsor"
          : (item.sponsors as { name?: string } | null)?.name ?? "Sponsor",
      asset_type: item.asset_type,
      placement: item.placement,
      asset_url: item.asset_url,
      cloudinary_public_id: item.cloudinary_public_id,
      duration_seconds: item.duration_seconds,
      priority: item.priority,
      link_url: item.link_url,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      is_visible: item.is_visible,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) ?? []
  ) as AdminSponsorAsset[];
}