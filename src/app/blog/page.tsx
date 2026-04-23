import Link from "next/link";

import { getPublicBlogPosts } from "@/lib/blog/get-public-blog-posts";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function BlogPage() {
  const posts = await getPublicBlogPosts();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:px-8">
        <header className="border-b border-white/10 pb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {siteConfig.name}
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Blog
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Efemérides musicales, novedades del canal, especiales temáticos y contenido editorial de 80&apos;s Forever.
          </p>
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
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                    {formatDate(post.published_at || post.created_at)}
                  </p>

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
              Todavía no hay publicaciones visibles en el blog.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}