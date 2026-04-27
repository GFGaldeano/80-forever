import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PublicShell } from "@/components/layout/public-shell";
import { getBlogCategoryBadgeClass } from "@/lib/blog/blog-category-theme";
import { getPublicBlogPostBySlug } from "@/lib/blog/get-public-blog-post-by-slug";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetaDescription } from "@/lib/seo";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";
import {
  buildBreadcrumbJsonLd,
  toJsonLd,
} from "@/lib/seo/json-ld";

export const dynamic = "force-dynamic";

type LocalizedBlogPostDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getLocalizedPublicHref(locale: Locale, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: Readonly<LocalizedBlogPostDetailPageProps>): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const [seo, dictionary, post] = await Promise.all([
    getPublicSiteSeo(),
    getDictionary(locale),
    getPublicBlogPostBySlug(slug),
  ]);

  if (!post) {
    return {
      title: `${dictionary.blogDetailPage.notFoundTitle} | ${seo.siteName}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = post.excerpt || buildMetaDescription(post.content, 160);
  const title = `${post.title} | ${dictionary.common.blog} | ${seo.siteName}`;
  const canonical = buildAbsoluteSiteUrl(
    seo.siteUrl,
    getLocalizedPublicHref(locale, `/blog/${post.slug}`)
  );
  const imageUrl = post.cover_image_url || seo.socialImageUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: buildAbsoluteSiteUrl(seo.siteUrl, `/es/blog/${post.slug}`),
        en: buildAbsoluteSiteUrl(seo.siteUrl, `/en/blog/${post.slug}`),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      images: [
        {
          url: imageUrl,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function LocalizedBlogPostDetailPage({
  params,
}: Readonly<LocalizedBlogPostDetailPageProps>) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [seo, dictionary, post] = await Promise.all([
    getPublicSiteSeo(),
    getDictionary(locale),
    getPublicBlogPostBySlug(slug),
  ]);

  if (!post) {
    notFound();
  }

  const paragraphs = buildParagraphs(post.content);

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
    {
      name: post.title,
      url: buildAbsoluteSiteUrl(
        seo.siteUrl,
        getLocalizedPublicHref(locale, `/blog/${post.slug}`)
      ),
    },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8">
        <Link
          href={getLocalizedPublicHref(locale, "/blog")}
          className="inline-flex rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.18)] backdrop-blur-sm transition hover:border-fuchsia-300/70 hover:bg-fuchsia-500/15 hover:text-fuchsia-200 hover:shadow-[0_0_24px_rgba(217,70,239,0.28)]"
        >
          {dictionary.blogDetailPage.backToBlog}
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            {post.category ? (
              <Badge className={getBlogCategoryBadgeClass(post.category.slug)}>
                {post.category.name}
              </Badge>
            ) : null}

            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {formatDate(post.published_at || post.created_at, locale)}
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 text-base leading-8 text-zinc-400">
              {post.excerpt}
            </p>
          ) : null}

          {post.category ? (
            <div className="mt-5">
              <Link
                href={`${getLocalizedPublicHref(
                  locale,
                  "/blog"
                )}?category=${post.category.slug}`}
                className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
              >
                {dictionary.blogDetailPage.moreFromCategoryPrefix} {post.category.name}
              </Link>
            </div>
          ) : null}
        </header>

        {post.cover_image_url ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black">
            <div className="relative aspect-[21/9]">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <article className="mt-10 space-y-6 text-zinc-300">
          {paragraphs.map((paragraph, index) => (
            <p key={`${post.id}-paragraph-${index}`} className="text-base leading-8">
              {paragraph}
            </p>
          ))}
        </article>
      </div>
    </PublicShell>
  );
}