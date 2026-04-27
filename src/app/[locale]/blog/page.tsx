import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PublicShell } from "@/components/layout/public-shell";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getBlogCategoryBadgeClass,
  getBlogCategoryFilterClass,
} from "@/lib/blog/blog-category-theme";
import { getBlogCategories } from "@/lib/blog/get-blog-categories";
import { getPublicBlogPosts } from "@/lib/blog/get-public-blog-posts";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  toJsonLd,
} from "@/lib/seo/json-ld";

export const dynamic = "force-dynamic";

const BLOG_POSTS_PER_PAGE = 6;

type LocalizedBlogPageProps = {
  params: Promise<{
    locale: string;
  }>;
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

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function getLocalizedPublicHref(locale: Locale, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

function buildBlogPath(
  locale: Locale,
  options?: {
    category?: string;
    page?: number;
  }
) {
  const params = new URLSearchParams();

  if (options?.category) {
    params.set("category", options.category);
  }

  if (options?.page && options.page > 1) {
    params.set("page", String(options.page));
  }

  const query = params.toString();
  return `${getLocalizedPublicHref(locale, "/blog")}${query ? `?${query}` : ""}`;
}

function buildCategoryDescription(
  locale: Locale,
  siteName: string,
  categoryName: string
) {
  if (locale === "en") {
    return `Explore ${categoryName} posts in the ${siteName} blog.`;
  }

  return `Explorá las publicaciones de ${categoryName.toLowerCase()} en el blog de ${siteName}.`;
}

export async function generateMetadata({
  params,
  searchParams,
}: Readonly<LocalizedBlogPageProps>): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);
  const seo = await getPublicSiteSeo();
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = getSafePage(resolvedSearchParams.page);
  const categorySlug = resolvedSearchParams.category?.trim();

  const categories = await getBlogCategories();
  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : null;

  const titleBase = selectedCategory
    ? `${selectedCategory.name} | ${dictionary.blogPage.title} | ${seo.siteName}`
    : `${dictionary.blogPage.title} | ${seo.siteName}`;

  const title =
    currentPage > 1
      ? `${titleBase} - ${dictionary.blogPage.pageLabel} ${currentPage}`
      : titleBase;

  const description = selectedCategory
    ? buildCategoryDescription(locale, seo.siteName, selectedCategory.name)
    : dictionary.blogPage.description;

  const canonical = buildAbsoluteSiteUrl(
    seo.siteUrl,
    buildBlogPath(locale, {
      category: selectedCategory?.slug,
      page: currentPage,
    })
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: buildAbsoluteSiteUrl(
          seo.siteUrl,
          buildBlogPath("es", {
            category: selectedCategory?.slug,
            page: currentPage,
          })
        ),
        en: buildAbsoluteSiteUrl(
          seo.siteUrl,
          buildBlogPath("en", {
            category: selectedCategory?.slug,
            page: currentPage,
          })
        ),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: seo.socialImageUrl,
          alt: seo.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.socialImageUrl],
    },
  };
}

export default async function LocalizedBlogPage({
  params,
  searchParams,
}: Readonly<LocalizedBlogPageProps>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const seo = await getPublicSiteSeo();
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

  const pageUrl = buildAbsoluteSiteUrl(
    seo.siteUrl,
    buildBlogPath(locale, {
      category: selectedCategory?.slug,
      page: currentPage,
    })
  );

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: selectedCategory
      ? `${dictionary.blogPage.title} - ${selectedCategory.name}`
      : `${dictionary.blogPage.title} - ${seo.siteName}`,
    description: selectedCategory
      ? buildCategoryDescription(locale, seo.siteName, selectedCategory.name)
      : dictionary.blogPage.description,
    url: pageUrl,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: dictionary.common.home,
      url: buildAbsoluteSiteUrl(seo.siteUrl, getLocalizedPublicHref(locale, "/")),
    },
    {
      name: dictionary.common.blog,
      url: buildAbsoluteSiteUrl(
        seo.siteUrl,
        getLocalizedPublicHref(locale, "/blog")
      ),
    },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <header className="border-b border-white/10 pb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {seo.siteName}
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            {dictionary.blogPage.title}
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            {dictionary.blogPage.description}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedLink
              href={buildBlogPath(locale)}
              eventAction="blog_filter_all"
              eventLabel={dictionary.common.all}
              className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${getBlogCategoryFilterClass(
                {
                  active: !selectedCategory,
                }
              )}`}
            >
              {dictionary.common.all}
            </TrackedLink>

            {categories.map((category) => (
              <TrackedLink
                key={category.id}
                href={buildBlogPath(locale, { category: category.slug })}
                eventAction={`blog_filter_${category.slug}`}
                eventLabel={category.name}
                className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${getBlogCategoryFilterClass(
                  {
                    slug: category.slug,
                    active: selectedCategory?.slug === category.slug,
                  }
                )}`}
              >
                {category.name}
              </TrackedLink>
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
                  <div className="relative aspect-[21/9] bg-black">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
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
                      {formatDate(post.published_at || post.created_at, locale)}
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {post.title}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {post.excerpt || dictionary.blogPage.noExcerpt}
                  </p>

                  <TrackedLink
                    href={getLocalizedPublicHref(locale, `/blog/${post.slug}`)}
                    eventAction="blog_post_read"
                    eventLabel={post.title}
                    eventMetadata={{
                      slug: post.slug,
                      category: post.category?.slug ?? null,
                    }}
                    className="mt-5 inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/15"
                  >
                    {dictionary.common.readPost}
                  </TrackedLink>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 px-6 py-12 text-center text-zinc-400 lg:col-span-2">
              {selectedCategory
                ? dictionary.blogPage.emptyCategory
                : dictionary.blogPage.emptyAll}
            </div>
          )}
        </section>

        {posts.length && totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={buildBlogPath(locale, {
                  category: selectedCategory?.slug,
                  page: currentPage - 1,
                })}
                className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
              >
                {dictionary.common.previous}
              </Link>
            ) : null}

            <span className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
              {dictionary.blogPage.pageLabel} {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={buildBlogPath(locale, {
                  category: selectedCategory?.slug,
                  page: currentPage + 1,
                })}
                className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
              >
                {dictionary.common.next}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </PublicShell>
  );
}