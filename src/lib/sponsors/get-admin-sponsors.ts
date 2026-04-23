import { createClient } from "@/lib/supabase/server";

export type AdminSponsor = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  is_visible: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const SPONSOR_SELECT = `
  id,
  name,
  slug,
  website_url,
  contact_name,
  contact_phone,
  contact_email,
  notes,
  is_visible,
  is_active,
  created_at,
  updated_at
`;

export async function getAdminSponsors(): Promise<AdminSponsor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsors")
    .select(SPONSOR_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los sponsors: ${error.message}`);
  }

  return (data as AdminSponsor[] | null) ?? [];
}