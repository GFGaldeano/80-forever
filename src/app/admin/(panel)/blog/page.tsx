import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { BlogPostsTable } from "@/components/admin/blog-posts-table";
import { getAdminBlogPosts } from "@/lib/blog/get-admin-blog-posts";

type AdminBlogPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function AdminBlogPage({
  searchParams,
}: Readonly<AdminBlogPageProps>) {
  const posts = await getAdminBlogPosts();
  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const postToEdit =
    typeof editId === "string"
      ? posts.find((post) => post.id === editId) ?? null
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <FileText className="h-7 w-7 text-fuchsia-300" />
            Blog
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Gestioná publicaciones editoriales para efemérides, novedades,
            anuncios de transmisión y contenido institucional del canal.
          </p>
        </div>

        {postToEdit ? (
          <Link
            href="/admin/blog"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/15"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo post
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <BlogPostForm initialPost={postToEdit} />
        <BlogPostsTable posts={posts} />
      </div>
    </div>
  );
}