import { createClient } from "@/lib/supabase/server";

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  is_visible: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const PUBLIC_BLOG_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  is_visible,
  published_at,
  created_at,
  updated_at
`;

export async function getPublicBlogPosts(): Promise<PublicBlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(PUBLIC_BLOG_SELECT)
    .eq("is_visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando posts públicos del blog:", error.message);
    return [];
  }

  return (data as PublicBlogPost[] | null) ?? [];
}