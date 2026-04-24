import { createClient } from "@/lib/supabase/server";

export type BlogCategory = {
  id: string;
  name: string;
  slug: "efemerides" | "noticias" | "transmisiones" | "especiales" | "comunidad";
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

const BLOG_CATEGORIES_SELECT = `
  id,
  name,
  slug,
  description,
  sort_order,
  is_active
`;

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_categories")
    .select(BLOG_CATEGORIES_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las categorías del blog: ${error.message}`);
  }

  return (data as BlogCategory[] | null) ?? [];
}