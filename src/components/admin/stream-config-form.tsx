"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Radio, Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  streamConfigSchema,
  streamProviderMeta,
  streamStatusMeta,
  type StreamConfigInput,
} from "@/lib/validators/stream";
import type { AdminStreamConfig } from "@/lib/stream/get-admin-stream-config";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type StreamConfigFormProps = {
  initialConfig: AdminStreamConfig | null;
  adminId: string;
};

type FormState = {
  provider: StreamConfigInput["provider"];
  status: StreamConfigInput["status"];
  title: string;
  sourceUrl: string;
  embedUrl: string;
  subtitle: string;
  offlineMessage: string;
  nextLiveAt: string;
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function getInitialFormState(initialConfig: AdminStreamConfig | null): FormState {
  return {
    provider: initialConfig?.provider ?? "youtube",
    status: initialConfig?.status ?? "offline",
    title: initialConfig?.title ?? "",
    sourceUrl: initialConfig?.source_url ?? "",
    embedUrl: initialConfig?.embed_url ?? "",
    subtitle: initialConfig?.subtitle ?? "",
    offlineMessage: initialConfig?.offline_message ?? "",
    nextLiveAt: toDateTimeLocal(initialConfig?.next_live_at),
  };
}

export function StreamConfigForm({
  initialConfig,
  adminId,
}: Readonly<StreamConfigFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(getInitialFormState(initialConfig));
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const setField =
    <K extends keyof FormState>(field: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = streamConfigSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const payload = {
        provider: parsed.data.provider,
        status: parsed.data.status,
        title: parsed.data.title,
        source_url: toNullableString(parsed.data.sourceUrl),
        embed_url: toNullableString(parsed.data.embedUrl),
        subtitle: toNullableString(parsed.data.subtitle),
        offline_message: toNullableString(parsed.data.offlineMessage),
        next_live_at: parsed.data.nextLiveAt
          ? new Date(parsed.data.nextLiveAt).toISOString()
          : null,
        is_active: true,
        updated_by: adminId,
      };

      let error: { message: string } | null = null;

      if (initialConfig?.id) {
        const result = await supabase
          .from("stream_config")
          .update(payload)
          .eq("id", initialConfig.id);

        error = result.error;
      } else {
        const result = await supabase.from("stream_config").insert({
          ...payload,
          created_by: adminId,
        });

        error = result.error;
      }

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Configuración guardada correctamente.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Configuración del stream</CardTitle>
          <CardDescription className="text-zinc-400">
            Definí el proveedor, estado y metadata que va a consumir la home pública.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-zinc-200">Estado del canal</Label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(streamStatusMeta).map(([key, meta]) => {
                  const isSelected = form.status === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setField("status")(key as FormState["status"])}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-left transition",
                        isSelected
                          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                          : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/20 hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{meta.label}</span>
                        {isSelected ? (
                          <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                            activo
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-zinc-400">{meta.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor</Label>
                <select
                  id="provider"
                  value={form.provider}
                  onChange={(e) =>
                    setField("provider")(e.target.value as FormState["provider"])
                  }
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-fuchsia-500/50"
                >
                  {Object.entries(streamProviderMeta).map(([key, meta]) => (
                    <option key={key} value={key} className="bg-zinc-950">
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextLiveAt">Próximo vivo</Label>
                <Input
                  id="nextLiveAt"
                  type="datetime-local"
                  value={form.nextLiveAt}
                  onChange={(e) => setField("nextLiveAt")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título visible</Label>
              <Input
                id="title"
                placeholder="Ej. Noche synth-pop especial"
                value={form.title}
                onChange={(e) => setField("title")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                placeholder="Ej. Bloque especial dedicado a Depeche Mode"
                value={form.subtitle}
                onChange={(e) => setField("subtitle")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">URL de origen</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://..."
                  value={form.sourceUrl}
                  onChange={(e) => setField("sourceUrl")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedUrl">URL de embed</Label>
                <Input
                  id="embedUrl"
                  placeholder="https://www.youtube.com/embed/..."
                  value={form.embedUrl}
                  onChange={(e) => setField("embedUrl")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offlineMessage">Mensaje offline</Label>
              <Textarea
                id="offlineMessage"
                placeholder="Ahora no estamos al aire. Pronto vuelve una nueva emisión."
                value={form.offlineMessage}
                onChange={(e) => setField("offlineMessage")(e.target.value)}
                className="min-h-[120px] rounded-2xl border-white/10 bg-black/60 text-white"
              />
            </div>

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

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 rounded-xl bg-white text-black hover:bg-zinc-200"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar configuración"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Radio className="h-5 w-5 text-cyan-300" />
              Vista previa operativa
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Estado actual y preview del embed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
                {streamStatusMeta[form.status].label}
              </Badge>

              <Badge className="border border-white/10 bg-white/[0.03] text-zinc-300">
                {streamProviderMeta[form.provider].label}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">
                {form.title || "Título pendiente"}
              </h3>
              <p className="text-sm text-zinc-400">
                {form.subtitle || "Todavía no definiste un subtítulo para esta emisión."}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="aspect-video">
                {form.embedUrl ? (
                  <iframe
                    title="Vista previa del stream"
                    src={form.embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500">
                    Cargá una URL de embed para ver la vista previa del player.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
              <p>
                <span className="font-medium text-zinc-200">Mensaje offline:</span>{" "}
                {form.offlineMessage || "Sin mensaje configurado."}
              </p>
              <p className="mt-3">
                <span className="font-medium text-zinc-200">Próximo vivo:</span>{" "}
                {form.nextLiveAt
                  ? new Date(form.nextLiveAt).toLocaleString("es-AR")
                  : "No definido"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Notas de uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <p>
              Para <span className="text-white">YouTube</span>, usá una URL de embed con
              formato tipo:
            </p>
            <code className="block rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-xs text-cyan-300">
              https://www.youtube.com/embed/VIDEO_ID
            </code>

            <p>
              Cuando el estado sea <span className="text-white">Próximamente</span>, la home
              podrá mostrar la próxima emisión junto al mensaje offline.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}