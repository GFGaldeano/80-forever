import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicBlogPostBySlug } from "@/lib/blog/get-public-blog-post-by-slug";

export const dynamic = "force-dynamic";

type BlogPostDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("es-AR", {
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

export default async function BlogPostDetailPage({
  params,
}: Readonly<BlogPostDetailPageProps>) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = buildParagraphs(post.content);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12 md:px-8">
        <Link
          href="/blog"
          className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
        >
          Volver al blog
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {formatDate(post.published_at || post.created_at)}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 text-base leading-8 text-zinc-400">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        {post.cover_image_url ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black">
            <div className="aspect-[21/9]">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-full w-full object-cover"
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
    </main>
  );
}