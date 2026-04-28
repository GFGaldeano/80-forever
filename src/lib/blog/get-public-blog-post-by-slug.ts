import type { Locale } from "@/i18n/config";
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

export async function getPublicBlogPostBySlug(
  slug: string,
  locale: Locale = "es"
): Promise<PublicBlogPost | null> {
  const supabase = await createClient();

  let row: PublicBlogPostRow | null = null;

  const { data: baseData, error: baseError } = await supabase
    .from("blog_posts")
    .select(PUBLIC_BLOG_BY_SLUG_SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();

  if (baseError) {
    console.error("Error cargando post público por slug base:", baseError.message);
  }

  if (baseData) {
    row = baseData as PublicBlogPostRow;
  }

  if (!row) {
    const { data: translationMatches, error: translationMatchError } = await supabase
      .from("blog_post_translations")
      .select(
        `
        blog_post_id,
        locale
      `
      )
      .eq("slug", slug)
      .in("locale", [locale, "es"]);

    if (translationMatchError) {
      console.error(
        "Error buscando post público por slug traducido:",
        translationMatchError.message
      );
      return null;
    }

    const preferredMatch =
      ((translationMatches as Array<{ blog_post_id: string; locale: Locale }> | null) ??
        []
      ).find((item) => item.locale === locale) ??
      ((translationMatches as Array<{ blog_post_id: string; locale: Locale }> | null) ??
        []
      ).find((item) => item.locale === "es") ??
      null;

    if (!preferredMatch) {
      return null;
    }

    const { data: translatedBaseData, error: translatedBaseError } = await supabase
      .from("blog_posts")
      .select(PUBLIC_BLOG_BY_SLUG_SELECT)
      .eq("id", preferredMatch.blog_post_id)
      .eq("is_visible", true)
      .maybeSingle();

    if (translatedBaseError) {
      console.error(
        "Error cargando post público por id traducido:",
        translatedBaseError.message
      );
      return null;
    }

    if (!translatedBaseData) {
      return null;
    }

    row = translatedBaseData as PublicBlogPostRow;
  }

  const normalizedCategory = normalizeCategory(row.category);

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
        .eq("blog_post_id", row.id)
        .in("locale", [locale, "es"]),
      normalizedCategory
        ? supabase
            .from("blog_category_translations")
            .select(
              `
              blog_category_id,
              locale,
              name,
              slug
            `
            )
            .eq("blog_category_id", normalizedCategory.id)
            .in("locale", [locale, "es"])
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (postTranslationsError) {
    console.error(
      "Error cargando traducciones del post público:",
      postTranslationsError.message
    );
  }

  if (categoryTranslationsError) {
    console.error(
      "Error cargando traducciones de la categoría pública:",
      categoryTranslationsError.message
    );
  }

  const postTranslation = getPreferredPostTranslation(
    (postTranslationsData as BlogPostTranslationRow[] | null) ?? [],
    row.id,
    locale
  );

  const categoryTranslation = normalizedCategory
    ? getPreferredCategoryTranslation(
        (categoryTranslationsData as BlogCategoryTranslationRow[] | null) ?? [],
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
}