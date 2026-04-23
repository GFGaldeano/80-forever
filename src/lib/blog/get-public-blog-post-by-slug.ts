import { createClient } from "@/lib/supabase/server";
import type { PublicBlogPost } from "@/lib/blog/get-public-blog-posts";

const PUBLIC_BLOG_BY_SLUG_SELECT = `
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

export async function getPublicBlogPostBySlug(
  slug: string
): Promise<PublicBlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(PUBLIC_BLOG_BY_SLUG_SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();

  if (error) {
    console.error("Error cargando post público por slug:", error.message);
    return null;
  }

  return (data as PublicBlogPost | null) ?? null;
}