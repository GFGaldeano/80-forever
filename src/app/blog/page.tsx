import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPagination } from "@/components/blog/blog-pagination";
import { getBlogCategoryBadgeClass, getBlogCategoryFilterClass } from "@/lib/blog/blog-category-theme";
import { getBlogCategories } from "@/lib/blog/get-blog-categories";
import { getPublicBlogPosts } from "@/lib/blog/get-public-blog-posts";
import { siteConfig } from "@/lib/config/site";
import { absoluteUrl } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const BLOG_POSTS_PER_PAGE = 6;

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string;
    category?: string;
  }>;
};

function getSafePage(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function formatDate(value?: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function generateMetadata({
  searchParams,
}: Readonly<BlogPageProps>): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = getSafePage(resolvedSearchParams.page);
  const categorySlug = resolvedSearchParams.category?.trim();

  const categories = await getBlogCategories();
  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : null;

  const titleBase = selectedCategory
    ? `${selectedCategory.name} | Blog | ${siteConfig.name}`
    : `Blog | ${siteConfig.name}`;

  const title =
    currentPage > 1 ? `${titleBase} - Página ${currentPage}` : titleBase;

  const description = selectedCategory
    ? `Explorá las publicaciones de ${selectedCategory.name.toLowerCase()} en el blog de ${siteConfig.name}.`
    : `Explorá el blog de ${siteConfig.name}: efemérides musicales, novedades del canal, especiales temáticos y contenido editorial del universo 80's.`;

  const params = new URLSearchParams();
  if (selectedCategory) {
    params.set("category", selectedCategory.slug);
  }
  if (currentPage > 1) {
    params.set("page", String(currentPage));
  }

  const canonical = absoluteUrl(`/blog${params.toString() ? `?${params.toString()}` : ""}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: siteConfig.logoBannerUrl,
          width: 1200,
          height: 514,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.logoBannerUrl],
    },
  };
}

export default async function BlogPage({
  searchParams,
}: Readonly<BlogPageProps>) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = getSafePage(resolvedSearchParams.page);
  const categorySlug = resolvedSearchParams.category?.trim();

  const categories = await getBlogCategories();
  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : null;

  if (categorySlug && !selectedCategory) {
    notFound();
  }

  const { posts, totalCount, totalPages } = await getPublicBlogPosts({
    page: currentPage,
    pageSize: BLOG_POSTS_PER_PAGE,
    categoryId: selectedCategory?.id,
  });

  if (currentPage > 1 && (totalCount === 0 || currentPage > totalPages)) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:px-8">
        <header className="border-b border-white/10 pb-8 text-center">
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300 transition hover:bg-fuchsia-500/15"
            >
              Volver al inicio
            </Link>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {siteConfig.name}
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Blog
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Efemérides musicales, novedades del canal, especiales temáticos y
            contenido editorial de 80&apos;s Forever.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/blog"
              className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${getBlogCategoryFilterClass({
                active: !selectedCategory,
              })}`}
            >
              Todas
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${getBlogCategoryFilterClass({
                  slug: category.slug,
                  active: selectedCategory?.slug === category.slug,
                })}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          {posts.length ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70"
              >
                {post.cover_image_url ? (
                  <div className="aspect-[21/9] bg-black">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {post.category ? (
                      <Badge className={getBlogCategoryBadgeClass(post.category.slug)}>
                        {post.category.name}
                      </Badge>
                    ) : null}

                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      {formatDate(post.published_at || post.created_at)}
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {post.title}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {post.excerpt || "Sin extracto disponible."}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
                  >
                    Leer post
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 px-6 py-12 text-center text-zinc-400 lg:col-span-2">
              {selectedCategory
                ? `Todavía no hay publicaciones visibles en ${selectedCategory.name.toLowerCase()}.`
                : "Todavía no hay publicaciones visibles en el blog."}
            </div>
          )}
        </section>

        {posts.length ? (
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            query={{
              category: selectedCategory?.slug,
            }}
          />
        ) : null}
      </div>
    </main>
  );
}