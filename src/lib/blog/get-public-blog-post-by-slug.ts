import { createClient } from "@/lib/supabase/server";
import type { PublicBlogPost } from "@/lib/blog/get-public-blog-posts";

type BlogCategoryRelation = {
  id: string;
  name: string;
  slug: string;
};

type PublicBlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string;
  category: BlogCategoryRelation | BlogCategoryRelation[] | null;
  is_visible: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const PUBLIC_BLOG_BY_SLUG_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  category_id,
  category:blog_categories!blog_posts_category_id_fkey(
    id,
    name,
    slug
  ),
  is_visible,
  published_at,
  created_at,
  updated_at
`;

function normalizeCategory(
  category: BlogCategoryRelation | BlogCategoryRelation[] | null
): BlogCategoryRelation | null {
  if (!category) return null;
  return Array.isArray(category) ? category[0] ?? null : category;
}

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

  if (!data) {
    return null;
  }

  const row = data as PublicBlogPostRow;

  return {
    ...row,
    category: normalizeCategory(row.category),
  };
}