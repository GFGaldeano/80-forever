import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";

import type { AdminBlogPost } from "@/lib/blog/get-admin-blog-posts";
import { DeleteBlogPostButton } from "@/components/admin/delete-blog-post-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BlogPostsTableProps = {
  posts: AdminBlogPost[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function BlogPostsTable({
  posts,
}: Readonly<BlogPostsTableProps>) {
  if (!posts.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Posts cargados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center">
            <p className="text-lg font-medium text-white">Todavía no hay posts</p>
            <p className="mt-2 text-sm text-zinc-400">
              Creá el primero desde el formulario para empezar a poblar el blog.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle>Posts cargados</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Post</TableHead>
                <TableHead className="text-zinc-400">Slug</TableHead>
                <TableHead className="text-zinc-400">Visible</TableHead>
                <TableHead className="text-zinc-400">Publicado</TableHead>
                <TableHead className="text-zinc-400">Público</TableHead>
                <TableHead className="text-right text-zinc-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {posts.map((post) => (
                <TableRow
                  key={post.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{post.title}</p>
                      {post.excerpt ? (
                        <p className="mt-1 line-clamp-2 max-w-[420px] text-xs text-zinc-500">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-300">{post.slug}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        post.is_visible
                          ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                          : "border border-white/10 bg-white/[0.03] text-zinc-400"
                      }
                    >
                      {post.is_visible ? "Sí" : "No"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-zinc-300">
                    {formatDateTime(post.published_at)}
                  </TableCell>

                  <TableCell>
                    {post.is_visible ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        Ver
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-sm text-zinc-500">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                      >
                        <Link href={`/admin/blog?edit=${post.id}`}>
                          <PencilLine className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>

                      <DeleteBlogPostButton
                        postId={post.id}
                        postTitle={post.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}