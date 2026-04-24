"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Link2, Save, Wand2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { AdminTransmission } from "@/lib/transmissions/get-admin-transmissions";
import { parseYouTubeVideo } from "@/lib/youtube/parse-youtube";
import {
  slugifyTransmissionTitle,
  transmissionSchema,
  type TransmissionInput,
} from "@/lib/validators/transmissions";

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

type TransmissionFormProps = {
  initialTransmission?: AdminTransmission | null;
};

type FormState = TransmissionInput;

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

function getInitialState(initialTransmission?: AdminTransmission | null): FormState {
  return {
    episodeCode: initialTransmission?.episode_code ?? "",
    title: initialTransmission?.title ?? "",
    slug: initialTransmission?.slug ?? "",
    description: initialTransmission?.description ?? "",
    youtubeUrl: initialTransmission?.youtube_url ?? "",
    status: initialTransmission?.status ?? "draft",
    scheduledAt: toDateTimeLocal(initialTransmission?.scheduled_at),
    airedAt: toDateTimeLocal(initialTransmission?.aired_at),
    isVisible: initialTransmission?.is_visible ?? false,
  };
}

function getStatusLabel(status: TransmissionInput["status"]) {
  switch (status) {
    case "aired":
      return "Emitida";
    case "scheduled":
      return "Programada";
    case "archived":
      return "Archivada";
    case "draft":
    default:
      return "Borrador";
  }
}

export function TransmissionForm({
  initialTransmission = null,
}: Readonly<TransmissionFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(getInitialState(initialTransmission));
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = Boolean(initialTransmission?.id);

  const formTitle = useMemo(
    () => (isEditing ? "Editar transmisión" : "Nueva transmisión"),
    [isEditing]
  );

  const youtubePreview = useMemo(
    () => parseYouTubeVideo(form.youtubeUrl),
    [form.youtubeUrl]
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
      slug: slugifyTransmissionTitle(prev.title),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = transmissionSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Revisá los datos ingresados."
      );
      return;
    }

    const youtubeData = parseYouTubeVideo(parsed.data.youtubeUrl);

    if (!youtubeData) {
      setErrorMessage("No se pudo procesar la URL de YouTube.");
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
        episode_code: parsed.data.episodeCode,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: toNullable(parsed.data.description),
        youtube_url: parsed.data.youtubeUrl,
        youtube_video_id: youtubeData.videoId,
        youtube_watch_url: youtubeData.watchUrl,
        youtube_embed_url: youtubeData.embedUrl,
        youtube_thumbnail_url: youtubeData.thumbnailUrl,
        status: parsed.data.status,
        scheduled_at: parsed.data.scheduledAt
          ? new Date(parsed.data.scheduledAt).toISOString()
          : null,
        aired_at: parsed.data.airedAt
          ? new Date(parsed.data.airedAt).toISOString()
          : null,
        is_visible: parsed.data.isVisible,
        updated_by: adminProfile.id,
        updated_at: new Date().toISOString(),
      };

      let error: { message: string } | null = null;

      if (initialTransmission?.id) {
        const result = await supabase
          .from("transmissions")
          .update(payload)
          .eq("id", initialTransmission.id);

        error = result.error;
      } else {
        const result = await supabase.from("transmissions").insert({
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
          ? "Transmisión actualizada correctamente."
          : "Transmisión creada correctamente."
      );

      if (isEditing) {
        router.push("/admin/transmissions");
        router.refresh();
        return;
      }

      setForm(getInitialState(null));
      router.refresh();
    });
  };

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-xl">{formTitle}</CardTitle>
        <CardDescription className="text-zinc-400">
          Cargá la base editorial de cada emisión y dejá lista la información para
          el futuro historial público de transmisiones.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="episodeCode">Código de episodio</Label>
              <Input
                id="episodeCode"
                placeholder="Ej. E01"
                value={form.episodeCode}
                onChange={(e) => setField("episodeCode")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setField("status")(e.target.value as TransmissionInput["status"])
                }
                className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
              >
                {(["draft", "scheduled", "aired", "archived"] as const).map((status) => (
                  <option key={status} value={status} className="bg-zinc-950">
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej. 80's Forever - E01 - 24/06/2026"
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
                placeholder="80s-forever-e01-24-06-2026"
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
            <Label htmlFor="description">Descripción breve</Label>
            <Textarea
              id="description"
              placeholder="Resumen editorial de lo que pasó en la transmisión..."
              value={form.description}
              onChange={(e) => setField("description")(e.target.value)}
              className="min-h-[120px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">URL de YouTube</Label>
            <Input
              id="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={(e) => setField("youtubeUrl")(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
            />
          </div>

          {youtubePreview ? (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">
                  <Link2 className="h-4 w-4" />
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-cyan-200">
                    Video ID detectado:{" "}
                    <span className="font-medium">{youtubePreview.videoId}</span>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={youtubePreview.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
                    >
                      Ver watch URL
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <a
                      href={youtubePreview.thumbnailUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
                    >
                      Ver miniatura
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-zinc-400 break-all">
                    Embed: {youtubePreview.embedUrl}
                  </p>
                </div>
              </div>
            </div>
          ) : form.youtubeUrl.trim() ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              La URL ingresada no parece una URL válida de YouTube.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Fecha programada</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setField("scheduledAt")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="airedAt">Fecha emitida</Label>
              <Input
                id="airedAt"
                type="datetime-local"
                value={form.airedAt}
                onChange={(e) => setField("airedAt")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setField("isVisible")(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            <div>
              <p className="text-sm font-medium text-white">
                Hacer visible la transmisión
              </p>
              <p className="text-xs text-zinc-400">
                Cuando armemos el historial público, esta transmisión podrá mostrarse.
              </p>
            </div>
          </label>

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
              disabled={isPending}
              className="h-12 rounded-xl bg-white text-black hover:bg-zinc-200"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending
                ? "Guardando..."
                : isEditing
                ? "Guardar cambios"
                : "Crear transmisión"}
            </Button>

            {isEditing ? (
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
              >
                <Link href="/admin/transmissions">Cancelar edición</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}