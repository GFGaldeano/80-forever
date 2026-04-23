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
  is_visible,
  published_at,
  created_at,
  updated_at
`;

export async function getPublicBlogPosts({
  page = 1,
  pageSize = 6,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<PublicBlogPostsResult> {
  const supabase = await createClient();

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 6;

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .from("blog_posts")
    .select(PUBLIC_BLOG_SELECT, { count: "exact" })
    .eq("is_visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

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

  return {
    posts: (data as PublicBlogPost[] | null) ?? [],
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: safePageSize,
  };
}