import { createClient } from "@/lib/supabase/server";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cloudinary_public_id: string | null;
  is_visible: boolean;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const BLOG_POST_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  cloudinary_public_id,
  is_visible,
  published_at,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_POST_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los posts del blog: ${error.message}`);
  }

  return (data as AdminBlogPost[] | null) ?? [];
}