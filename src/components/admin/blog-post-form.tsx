"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Upload, Wand2, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  blogPostSchema,
  slugifyBlogTitle,
  type BlogPostInput,
} from "@/lib/validators/blog-posts";
import type { AdminBlogPost } from "@/lib/blog/get-admin-blog-posts";
import type { BlogCategory } from "@/lib/blog/get-blog-categories";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BlogPostFormProps = {
  initialPost?: AdminBlogPost | null;
  categories: BlogCategory[];
};

type FormState = BlogPostInput;

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function toNullable(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

function getInitialState(
  initialPost: AdminBlogPost | null | undefined,
  categories: BlogCategory[]
): FormState {
  return {
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    categoryId:
      initialPost?.category_id ?? categories[0]?.id ?? "",
    excerpt: initialPost?.excerpt ?? "",
    content: initialPost?.content ?? "",
    coverImageUrl: initialPost?.cover_image_url ?? "",
    cloudinaryPublicId: initialPost?.cloudinary_public_id ?? "",
    publishedAt: toDateTimeLocal(initialPost?.published_at),
    isVisible: initialPost?.is_visible ?? true,
  };
}

export function BlogPostForm({
  initialPost = null,
  categories,
}: Readonly<BlogPostFormProps>) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [form, setForm] = useState<FormState>(getInitialState(initialPost, categories));
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");

  const isEditing = Boolean(initialPost?.id);

  const formTitle = useMemo(
    () => (isEditing ? "Editar post" : "Nuevo post"),
    [isEditing]
  );

  const setField =
    <K extends keyof FormState>(field: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const generateSlug = () => {
    setForm((prev) => ({
      ...prev,
      slug: slugifyBlogTitle(prev.title),
    }));
  };

  const clearCover = () => {
    setForm((prev) => ({
      ...prev,
      coverImageUrl: "",
      cloudinaryPublicId: "",
    }));

    setSelectedFileName("");
    setUploadErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadCover = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadErrorMessage("");
    setSuccessMessage("");
    setSelectedFileName(file.name);

    if (!file.type.startsWith("image/")) {
      setUploadErrorMessage("Seleccioná un archivo de imagen válido.");
      return;
    }

    setIsUploadingCover(true);

    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/blog/upload", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as {
        secureUrl?: string;
        publicId?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "No se pudo subir la portada.");
      }

      setForm((prev) => ({
        ...prev,
        coverImageUrl: data.secureUrl ?? "",
        cloudinaryPublicId: data.publicId ?? "",
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error subiendo la portada del blog.";

      setUploadErrorMessage(message);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = blogPostSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("No se pudo validar la sesión del administrador.");
        return;
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError || !adminProfile) {
        setErrorMessage(
          "No se encontró un perfil administrativo activo para esta sesión."
        );
        return;
      }

      const payload = {
        title: parsed.data.title,
        slug: parsed.data.slug,
        category_id: parsed.data.categoryId,
        excerpt: toNullable(parsed.data.excerpt),
        content: parsed.data.content,
        cover_image_url: toNullable(parsed.data.coverImageUrl),
        cloudinary_public_id: toNullable(parsed.data.cloudinaryPublicId),
        published_at: parsed.data.publishedAt
          ? new Date(parsed.data.publishedAt).toISOString()
          : null,
        is_visible: parsed.data.isVisible,
        updated_by: adminProfile.id,
      };

      let error: { message: string } | null = null;

      if (initialPost?.id) {
        const result = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", initialPost.id);

        error = result.error;
      } else {
        const result = await supabase.from("blog_posts").insert({
          ...payload,
          created_by: adminProfile.id,
        });

        error = result.error;
      }

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        isEditing
          ? "Post actualizado correctamente."
          : "Post creado correctamente."
      );

      if (isEditing) {
        router.push("/admin/blog");
        router.refresh();
        return;
      }

      setForm(getInitialState(null, categories));
      setSelectedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    });
  };

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-xl">{formTitle}</CardTitle>
        <CardDescription className="text-zinc-400">
          Publicá efemérides, novedades del canal, avisos de transmisión y contenido editorial.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej. Especial synth-pop del viernes"
              value={form.title}
              onChange={(e) => setField("title")(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="especial-synth-pop-del-viernes"
                value={form.slug}
                onChange={(e) => setField("slug")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={generateSlug}
                className="h-12 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => setField("categoryId")(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="bg-zinc-950"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Extracto</Label>
            <Textarea
              id="excerpt"
              placeholder="Resumen corto que aparecerá en el listado del blog..."
              value={form.excerpt}
              onChange={(e) => setField("excerpt")(e.target.value)}
              className="min-h-[100px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="space-y-3">
            <Label>Portada del post</Label>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900 hover:text-white">
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Seleccionar imagen
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleUploadCover}
                      className="hidden"
                    />
                  </label>

                  {isUploadingCover ? (
                    <div className="inline-flex items-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Subiendo portada...
                    </div>
                  ) : null}

                  {form.coverImageUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearCover}
                      className="h-10 rounded-xl border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Quitar portada
                    </Button>
                  ) : null}
                </div>

                <p className="text-xs text-zinc-500">
                  Formatos permitidos: JPG, PNG, WEBP o GIF. Tamaño máximo: 5 MB.
                  Recomendado: imagen horizontal 21:9.
                </p>

                {selectedFileName ? (
                  <p className="text-sm text-zinc-300">
                    Archivo seleccionado:{" "}
                    <span className="text-white">{selectedFileName}</span>
                  </p>
                ) : null}

                {uploadErrorMessage ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {uploadErrorMessage}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedAt">Fecha de publicación</Label>
            <Input
              id="publishedAt"
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setField("publishedAt")(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              placeholder="Escribí el contenido del post. Usá líneas en blanco para separar párrafos."
              value={form.content}
              onChange={(e) => setField("content")(e.target.value)}
              className="min-h-[280px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setField("isVisible")(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            <div>
              <p className="text-sm font-medium text-white">Publicar como visible</p>
              <p className="text-xs text-zinc-400">
                Si está activo, el post se mostrará en el blog público.
              </p>
            </div>
          </label>

          {form.coverImageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="aspect-[21/9]">
                <img
                  src={form.coverImageUrl}
                  alt="Preview portada"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="min-h-11">
            {errorMessage ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            {!errorMessage && successMessage ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {successMessage}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={isPending || isUploadingCover}
              className="h-12 rounded-xl bg-white text-black hover:bg-zinc-200"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending
                ? "Guardando..."
                : isEditing
                ? "Guardar cambios"
                : "Crear post"}
            </Button>

            {isEditing ? (
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
              >
                <Link href="/admin/blog">Cancelar edición</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}