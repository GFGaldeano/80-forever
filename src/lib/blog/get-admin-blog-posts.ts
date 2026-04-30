import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

type BlogCategoryRelation = {
  id: string;
  name: string;
  slug: string;
};

type BlogPostTranslationRelation = {
  locale: Locale;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
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
  translations: BlogPostTranslationRelation[] | null;
  is_visible: boolean;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminBlogPostTranslation = {
  locale: Locale;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
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
  translations: {
    es: AdminBlogPostTranslation | null;
    en: AdminBlogPostTranslation | null;
  };
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
  translations:blog_post_translations(
    locale,
    title,
    slug,
    excerpt,
    content
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

function normalizeTranslations(
  translations: BlogPostTranslationRelation[] | null,
  row: AdminBlogPostRow
): AdminBlogPost["translations"] {
  const list = translations ?? [];

  const es = list.find((item) => item.locale === "es");
  const en = list.find((item) => item.locale === "en");

  return {
    es: es
      ? {
          locale: "es",
          title: es.title ?? row.title,
          slug: es.slug ?? row.slug,
          excerpt: es.excerpt ?? row.excerpt,
          content: es.content ?? row.content,
        }
      : {
          locale: "es",
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          content: row.content,
        },
    en: en
      ? {
          locale: "en",
          title: en.title ?? "",
          slug: en.slug ?? "",
          excerpt: en.excerpt ?? null,
          content: en.content ?? "",
        }
      : null,
  };
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
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    cover_image_url: row.cover_image_url,
    cloudinary_public_id: row.cloudinary_public_id,
    category_id: row.category_id,
    category: normalizeCategory(row.category),
    translations: normalizeTranslations(row.translations, row),
    is_visible: row.is_visible,
    published_at: row.published_at,
    created_by: row.created_by,
    updated_by: row.updated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}