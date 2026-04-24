"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  RefreshCw,
  Save,
  Wand2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { AdminTransmission } from "@/lib/transmissions/get-admin-transmissions";
import { parseYouTubeVideo } from "@/lib/youtube/parse-youtube";
import {
  slugifyTransmissionTitle,
  transmissionSchema,
  type TransmissionInput,
} from "@/lib/validators/transmissions";

import { Badge } from "@/components/ui/badge";
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

type SyncedYouTubeMetadata = {
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  title: string | null;
  authorName: string | null;
  authorUrl: string | null;
  source: "youtube_oembed" | "parsed_url" | "saved";
  syncedAt: string;
  syncError: string | null;
};

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

function getInitialSyncedMetadata(
  initialTransmission?: AdminTransmission | null
): SyncedYouTubeMetadata | null {
  if (!initialTransmission?.youtube_video_id) {
    return null;
  }

  return {
    videoId: initialTransmission.youtube_video_id,
    watchUrl: initialTransmission.youtube_watch_url,
    embedUrl: initialTransmission.youtube_embed_url,
    thumbnailUrl: initialTransmission.youtube_thumbnail_url,
    title: initialTransmission.youtube_title,
    authorName: initialTransmission.youtube_author_name,
    authorUrl: initialTransmission.youtube_author_url,
    source:
      initialTransmission.youtube_sync_source === "youtube_oembed" ||
      initialTransmission.youtube_sync_source === "parsed_url"
        ? initialTransmission.youtube_sync_source
        : "saved",
    syncedAt:
      initialTransmission.youtube_last_synced_at ?? new Date().toISOString(),
    syncError: initialTransmission.youtube_sync_error ?? null,
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

function getSyncSourceLabel(source: SyncedYouTubeMetadata["source"]) {
  switch (source) {
    case "youtube_oembed":
      return "YouTube";
    case "parsed_url":
      return "Fallback URL";
    case "saved":
    default:
      return "Guardada";
  }
}

function getSyncSourceBadgeClass(source: SyncedYouTubeMetadata["source"]) {
  switch (source) {
    case "youtube_oembed":
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "parsed_url":
      return "border border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "saved":
    default:
      return "border border-white/10 bg-white/[0.03] text-zinc-300";
  }
}

export function TransmissionForm({
  initialTransmission = null,
}: Readonly<TransmissionFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);

  const [form, setForm] = useState<FormState>(getInitialState(initialTransmission));
  const [syncedMetadata, setSyncedMetadata] = useState<SyncedYouTubeMetadata | null>(
    getInitialSyncedMetadata(initialTransmission)
  );
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

  const setYoutubeUrl = (value: string) => {
    setForm((prev) => ({
      ...prev,
      youtubeUrl: value,
    }));

    setSuccessMessage("");

    const parsed = parseYouTubeVideo(value);

    if (!parsed) {
      setSyncedMetadata(null);
      return;
    }

    setSyncedMetadata((current) => {
      if (!current) return null;
      return current.videoId === parsed.videoId ? current : null;
    });
  };

  const generateSlug = () => {
    setForm((prev) => ({
      ...prev,
      slug: slugifyTransmissionTitle(prev.title),
    }));
  };

  const handleSyncYouTubeMetadata = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.youtubeUrl.trim()) {
      setErrorMessage("Ingresá primero una URL de YouTube.");
      return;
    }

    setIsSyncing(true);

    try {
      const response = await fetch("/api/youtube/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl: form.youtubeUrl,
        }),
      });

      const rawText = await response.text();
      const json = rawText
        ? (JSON.parse(rawText) as {
            error?: string;
            data?: Omit<SyncedYouTubeMetadata, "source"> & {
              source: "youtube_oembed" | "parsed_url";
            };
          })
        : {};

      if (!response.ok || !json.data) {
        setErrorMessage(
          json.error ?? "No se pudo sincronizar la metadata de YouTube."
        );
        return;
      }

      const metadata: SyncedYouTubeMetadata = {
        ...json.data,
      };

      setSyncedMetadata(metadata);

      setForm((prev) => {
        const nextTitle =
          prev.title.trim().length === 0 && metadata.title
            ? metadata.title
            : prev.title;

        const nextSlug =
          prev.slug.trim().length === 0 && nextTitle.trim().length > 0
            ? slugifyTransmissionTitle(nextTitle)
            : prev.slug;

        return {
          ...prev,
          youtubeUrl: metadata.watchUrl,
          title: nextTitle,
          slug: nextSlug,
        };
      });

      setSuccessMessage(
        metadata.source === "youtube_oembed"
          ? "Metadata sincronizada desde YouTube."
          : "URL normalizada. YouTube no devolvió metadata completa, pero la base quedó lista."
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo sincronizar la metadata de YouTube.");
    } finally {
      setIsSyncing(false);
    }
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

    const metadataMatchesCurrentVideo =
      syncedMetadata?.videoId === youtubeData.videoId;

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

      const persistedSyncSource =
        metadataMatchesCurrentVideo && syncedMetadata
          ? syncedMetadata.source === "saved"
            ? initialTransmission?.youtube_sync_source ?? null
            : syncedMetadata.source
          : null;

      const persistedSyncError =
        metadataMatchesCurrentVideo && syncedMetadata
          ? syncedMetadata.source === "saved"
            ? initialTransmission?.youtube_sync_error ?? null
            : syncedMetadata.syncError
          : null;

      const persistedSyncedAt =
        metadataMatchesCurrentVideo && syncedMetadata
          ? syncedMetadata.syncedAt
          : null;

      const payload = {
        episode_code: parsed.data.episodeCode,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: toNullable(parsed.data.description),
        youtube_url: youtubeData.watchUrl,
        youtube_video_id: youtubeData.videoId,
        youtube_watch_url: youtubeData.watchUrl,
        youtube_embed_url: youtubeData.embedUrl,
        youtube_thumbnail_url:
          syncedMetadata?.thumbnailUrl && metadataMatchesCurrentVideo
            ? syncedMetadata.thumbnailUrl
            : youtubeData.thumbnailUrl,
        youtube_title:
          metadataMatchesCurrentVideo && syncedMetadata?.title
            ? syncedMetadata.title
            : null,
        youtube_author_name:
          metadataMatchesCurrentVideo && syncedMetadata?.authorName
            ? syncedMetadata.authorName
            : null,
        youtube_author_url:
          metadataMatchesCurrentVideo && syncedMetadata?.authorUrl
            ? syncedMetadata.authorUrl
            : null,
        youtube_last_synced_at: persistedSyncedAt,
        youtube_sync_source: persistedSyncSource,
        youtube_sync_error: persistedSyncError,
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
      setSyncedMetadata(null);
      router.refresh();
    });
  };

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-xl">{formTitle}</CardTitle>
        <CardDescription className="text-zinc-400">
          Cargá la base editorial de cada emisión y sincronizá metadata básica
          desde YouTube para reducir trabajo manual.
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
            <Label htmlFor="title">Título editorial</Label>
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

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">URL de YouTube</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSyncing}
                onClick={handleSyncYouTubeMetadata}
                className="h-12 rounded-xl border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
            </div>
          </div>

          {youtubePreview ? (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <div className="relative aspect-video">
                    <Image
                      src={(syncedMetadata?.videoId === youtubePreview.videoId
                        ? syncedMetadata.thumbnailUrl
                        : youtubePreview.thumbnailUrl)}
                      alt={form.title || "Preview YouTube"}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getSyncSourceBadgeClass(
                      syncedMetadata?.videoId === youtubePreview.videoId
                        ? syncedMetadata.source
                        : "saved"
                    )}>
                      {getSyncSourceLabel(
                        syncedMetadata?.videoId === youtubePreview.videoId
                          ? syncedMetadata.source
                          : "saved"
                      )}
                    </Badge>

                    <Badge className="border border-white/10 bg-white/[0.03] text-zinc-300">
                      Video ID: {youtubePreview.videoId}
                    </Badge>
                  </div>

                  {syncedMetadata?.videoId === youtubePreview.videoId && syncedMetadata.title ? (
                    <p className="text-white">
                      Título YouTube:{" "}
                      <span className="font-medium">{syncedMetadata.title}</span>
                    </p>
                  ) : (
                    <p className="text-zinc-300">
                      Título YouTube: no sincronizado todavía.
                    </p>
                  )}

                  {syncedMetadata?.videoId === youtubePreview.videoId && syncedMetadata.authorName ? (
                    syncedMetadata.authorUrl ? (
                      <a
                        href={syncedMetadata.authorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-zinc-300 hover:text-white"
                      >
                        Canal: {syncedMetadata.authorName}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="text-zinc-300">
                        Canal: {syncedMetadata.authorName}
                      </p>
                    )
                  ) : null}

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

                  {syncedMetadata?.videoId === youtubePreview.videoId &&
                  syncedMetadata.syncedAt ? (
                    <p className="text-xs text-zinc-500" suppressHydrationWarning>
                      Última sincronización:{" "}
                      {new Intl.DateTimeFormat("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(syncedMetadata.syncedAt))}
                    </p>
                  ) : null}

                  {syncedMetadata?.videoId === youtubePreview.videoId &&
                  syncedMetadata.syncError ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-xs text-amber-300">
                      {syncedMetadata.syncError}
                    </div>
                  ) : null}
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
                Esta transmisión podrá mostrarse en el historial público.
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