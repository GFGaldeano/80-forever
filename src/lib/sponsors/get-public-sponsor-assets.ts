import { createClient } from "@/lib/supabase/server";

export type PublicSponsorAsset = {
  id: string;
  sponsor_id: string;
  sponsor_name: string;
  sponsor_slug: string;
  asset_type: "image" | "gif";
  placement: "top" | "bottom" | "both";
  asset_url: string;
  cloudinary_public_id: string | null;
  file_name: string | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number;
  priority: number;
  resolved_link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_visible: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type PublicSponsorAssetGroups = {
  topAssets: PublicSponsorAsset[];
  bottomAssets: PublicSponsorAsset[];
};

const ASSET_SELECT = `
  id,
  sponsor_id,
  sponsor_name,
  sponsor_slug,
  asset_type,
  placement,
  asset_url,
  cloudinary_public_id,
  file_name,
  mime_type,
  width,
  height,
  duration_seconds,
  priority,
  resolved_link_url,
  starts_at,
  ends_at,
  is_visible,
  is_active,
  created_at,
  updated_at
`;

export async function getPublicSponsorAssets(): Promise<PublicSponsorAssetGroups> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_active_sponsor_assets")
    .select(ASSET_SELECT)
    .order("priority", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error cargando sponsor assets públicos:", error.message);

    return {
      topAssets: [],
      bottomAssets: [],
    };
  }

  const assets = ((data as PublicSponsorAsset[] | null) ?? []).filter(
    (asset) => asset.asset_url
  );

  return {
    topAssets: assets.filter(
      (asset) => asset.placement === "top" || asset.placement === "both"
    ),
    bottomAssets: assets.filter(
      (asset) => asset.placement === "bottom" || asset.placement === "both"
    ),
  };
}