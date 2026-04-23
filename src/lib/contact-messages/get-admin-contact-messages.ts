import { createClient } from "@/lib/supabase/server";

export type AdminContactMessage = {
  id: string;
  name: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  message_type:
    | "general"
    | "commercial"
    | "sponsor"
    | "sumarme_al_proyecto"
    | "alianza_prensa";
  status: "new" | "read" | "archived";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const CONTACT_MESSAGES_SELECT = `
  id,
  name,
  business_name,
  email,
  phone,
  message,
  message_type,
  status,
  admin_notes,
  created_at,
  updated_at
`;

export async function getAdminContactMessages(): Promise<AdminContactMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select(CONTACT_MESSAGES_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `No se pudieron cargar los mensajes de contacto: ${error.message}`
    );
  }

  return (data as AdminContactMessage[] | null) ?? [];
}