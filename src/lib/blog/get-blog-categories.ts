import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type BlogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type BlogCategoryTranslationRow = {
  blog_category_id: string;
  locale: Locale;
  name: string | null;
  slug: string | null;
  description: string | null;
};

const BLOG_CATEGORIES_SELECT = `
  id,
  name,
  slug,
  description,
  sort_order,
  is_active
`;

function getPreferredCategoryTranslation(
  translations: BlogCategoryTranslationRow[],
  categoryId: string,
  locale: Locale
) {
  const matches = translations.filter(
    (item) => item.blog_category_id === categoryId
  );

  return (
    matches.find((item) => item.locale === locale) ??
    matches.find((item) => item.locale === "es") ??
    null
  );
}

export async function getBlogCategories(
  locale: Locale = "es"
): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_categories")
    .select(BLOG_CATEGORIES_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `No se pudieron cargar las categorías del blog: ${error.message}`
    );
  }

  const rows = (data as BlogCategoryRow[] | null) ?? [];

  if (!rows.length) {
    return [];
  }

  const { data: translationsData, error: translationsError } = await supabase
    .from("blog_category_translations")
    .select(
      `
      blog_category_id,
      locale,
      name,
      slug,
      description
    `
    )
    .in(
      "blog_category_id",
      rows.map((row) => row.id)
    )
    .in("locale", [locale, "es"]);

  if (translationsError) {
    console.error(
      "Error cargando traducciones de categorías del blog:",
      translationsError.message
    );
  }

  const translations =
    (translationsData as BlogCategoryTranslationRow[] | null) ?? [];

  return rows.map((row) => {
    const translation = getPreferredCategoryTranslation(
      translations,
      row.id,
      locale
    );

    return {
      id: row.id,
      name: translation?.name ?? row.name,
      slug: translation?.slug ?? row.slug,
      description: translation?.description ?? row.description,
      sort_order: row.sort_order,
      is_active: row.is_active,
    };
  });
}