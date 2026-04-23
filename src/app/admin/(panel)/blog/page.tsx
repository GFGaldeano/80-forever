import { FileText } from "lucide-react";

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
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <BlogPostForm initialPost={postToEdit} />
        <BlogPostsTable posts={posts} />
      </div>
    </div>
  );
}