import { createClient } from "@/lib/supabase/server";

export type PublicBlogSitemapEntry = {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
  created_at: string | null;
};

export async function getPublicBlogSlugs(): Promise<PublicBlogSitemapEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, published_at, updated_at, created_at")
    .eq("is_visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando slugs públicos del blog:", error.message);
    return [];
  }

  return (data as PublicBlogSitemapEntry[] | null) ?? [];
}