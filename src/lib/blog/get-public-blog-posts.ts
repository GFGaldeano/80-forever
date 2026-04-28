import type { Locale } from "@/i18n/config";
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

type BlogCategoryTranslationRow = {
  blog_category_id: string;
  locale: Locale;
  name: string | null;
  slug: string | null;
};

type BlogPostTranslationRow = {
  blog_post_id: string;
  locale: Locale;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
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

function getPreferredPostTranslation(
  translations: BlogPostTranslationRow[],
  blogPostId: string,
  locale: Locale
) {
  const matches = translations.filter((item) => item.blog_post_id === blogPostId);

  return (
    matches.find((item) => item.locale === locale) ??
    matches.find((item) => item.locale === "es") ??
    null
  );
}

function getPreferredCategoryTranslation(
  translations: BlogCategoryTranslationRow[],
  blogCategoryId: string,
  locale: Locale
) {
  const matches = translations.filter(
    (item) => item.blog_category_id === blogCategoryId
  );

  return (
    matches.find((item) => item.locale === locale) ??
    matches.find((item) => item.locale === "es") ??
    null
  );
}

export async function getPublicBlogPosts({
  locale = "es",
  page = 1,
  pageSize = 6,
  categoryId,
}: {
  locale?: Locale;
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

  if (!rows.length) {
    return {
      posts: [],
      totalCount,
      totalPages,
      currentPage: safePage,
      pageSize: safePageSize,
    };
  }

  const blogPostIds = rows.map((row) => row.id);
  const blogCategoryIds = Array.from(
    new Set(
      rows
        .map((row) => normalizeCategory(row.category)?.id ?? row.category_id)
        .filter(Boolean)
    )
  );

  const [{ data: postTranslationsData, error: postTranslationsError }, { data: categoryTranslationsData, error: categoryTranslationsError }] =
    await Promise.all([
      supabase
        .from("blog_post_translations")
        .select(
          `
          blog_post_id,
          locale,
          title,
          slug,
          excerpt,
          content
        `
        )
        .in("blog_post_id", blogPostIds)
        .in("locale", [locale, "es"]),
      supabase
        .from("blog_category_translations")
        .select(
          `
          blog_category_id,
          locale,
          name,
          slug
        `
        )
        .in("blog_category_id", blogCategoryIds)
        .in("locale", [locale, "es"]),
    ]);

  if (postTranslationsError) {
    console.error(
      "Error cargando traducciones de posts públicos:",
      postTranslationsError.message
    );
  }

  if (categoryTranslationsError) {
    console.error(
      "Error cargando traducciones de categorías públicas:",
      categoryTranslationsError.message
    );
  }

  const postTranslations =
    (postTranslationsData as BlogPostTranslationRow[] | null) ?? [];
  const categoryTranslations =
    (categoryTranslationsData as BlogCategoryTranslationRow[] | null) ?? [];

  return {
    posts: rows.map((row) => {
      const normalizedCategory = normalizeCategory(row.category);
      const postTranslation = getPreferredPostTranslation(
        postTranslations,
        row.id,
        locale
      );

      const categoryTranslation = normalizedCategory
        ? getPreferredCategoryTranslation(
            categoryTranslations,
            normalizedCategory.id,
            locale
          )
        : null;

      return {
        id: row.id,
        title: postTranslation?.title ?? row.title,
        slug: postTranslation?.slug ?? row.slug,
        excerpt: postTranslation?.excerpt ?? row.excerpt,
        content: postTranslation?.content ?? row.content,
        cover_image_url: row.cover_image_url,
        category_id: row.category_id,
        category: normalizedCategory
          ? {
              id: normalizedCategory.id,
              name: categoryTranslation?.name ?? normalizedCategory.name,
              slug: categoryTranslation?.slug ?? normalizedCategory.slug,
            }
          : null,
        is_visible: row.is_visible,
        published_at: row.published_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }),
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: safePageSize,
  };
}