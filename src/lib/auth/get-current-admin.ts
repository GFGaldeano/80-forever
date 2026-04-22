import { createClient } from "@/lib/supabase/server";

type AdminProfile = {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
};

export async function getCurrentAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      admin: null,
    };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, auth_user_id, full_name, email, role, is_active")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle<AdminProfile>();

  if (adminError || !admin) {
    return {
      user,
      admin: null,
    };
  }

  return {
    user,
    admin,
  };
}