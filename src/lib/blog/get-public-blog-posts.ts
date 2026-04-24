import { createClient } from "@/lib/supabase/server";

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

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string;
  category: BlogCategoryRelation | null;
  is_visible: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicBlogPostsResult = {
  posts: PublicBlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

const PUBLIC_BLOG_SELECT = `
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

export async function getPublicBlogPosts({
  page = 1,
  pageSize = 6,
  categoryId,
}: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
} = {}): Promise<PublicBlogPostsResult> {
  const supabase = await createClient();

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 6;

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from("blog_posts")
    .select(PUBLIC_BLOG_SELECT, { count: "exact" })
    .eq("is_visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error cargando posts públicos del blog:", error.message);

    return {
      posts: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: safePage,
      pageSize: safePageSize,
    };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const rows = (data ?? []) as PublicBlogPostRow[];

  return {
    posts: rows.map((row) => ({
      ...row,
      category: normalizeCategory(row.category),
    })),
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: safePageSize,
  };
}