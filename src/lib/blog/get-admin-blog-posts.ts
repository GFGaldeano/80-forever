import { createClient } from "@/lib/supabase/server";

type BlogCategoryRelation = {
  id: string;
  name: string;
  slug: string;
};

type AdminBlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cloudinary_public_id: string | null;
  category_id: string;
  category: BlogCategoryRelation | BlogCategoryRelation[] | null;
  is_visible: boolean;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cloudinary_public_id: string | null;
  category_id: string;
  category: BlogCategoryRelation | null;
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
  category_id,
  category:blog_categories!blog_posts_category_id_fkey(
    id,
    name,
    slug
  ),
  is_visible,
  published_at,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

function normalizeCategory(
  category: BlogCategoryRelation | BlogCategoryRelation[] | null
): BlogCategoryRelation | null {
  if (!category) return null;
  return Array.isArray(category) ? category[0] ?? null : category;
}

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_POST_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los posts del blog: ${error.message}`);
  }

  const rows = (data ?? []) as AdminBlogPostRow[];

  return rows.map((row) => ({
    ...row,
    category: normalizeCategory(row.category),
  }));
}