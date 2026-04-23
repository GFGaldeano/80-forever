"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Image as ImageIcon, Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  sponsorAssetPlacements,
  sponsorAssetSchema,
  sponsorAssetTypes,
  type SponsorAssetInput,
} from "@/lib/validators/sponsor-assets";
import type { AdminSponsor } from "@/lib/sponsors/get-admin-sponsors";
import type { AdminSponsorAsset } from "@/lib/sponsors/get-admin-sponsor-assets";

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

type SponsorAssetFormProps = {
  sponsors: AdminSponsor[];
  initialAsset?: AdminSponsorAsset | null;
};

type FormState = SponsorAssetInput;

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
  sponsors: AdminSponsor[],
  initialAsset?: AdminSponsorAsset | null
): FormState {
  return {
    sponsorId: initialAsset?.sponsor_id ?? sponsors[0]?.id ?? "",
    assetType: initialAsset?.asset_type ?? "image",
    placement: initialAsset?.placement ?? "both",
    assetUrl: initialAsset?.asset_url ?? "",
    cloudinaryPublicId: initialAsset?.cloudinary_public_id ?? "",
    durationSeconds: String(initialAsset?.duration_seconds ?? 8),
    priority: String(initialAsset?.priority ?? 100),
    linkUrl: initialAsset?.link_url ?? "",
    startsAt: toDateTimeLocal(initialAsset?.starts_at),
    endsAt: toDateTimeLocal(initialAsset?.ends_at),
    isVisible: initialAsset?.is_visible ?? true,
    isActive: initialAsset?.is_active ?? true,
  };
}

export function SponsorAssetForm({
  sponsors,
  initialAsset = null,
}: Readonly<SponsorAssetFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(getInitialState(sponsors, initialAsset));
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = Boolean(initialAsset?.id);

  const formTitle = useMemo(
    () => (isEditing ? "Editar asset" : "Nuevo asset"),
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = sponsorAssetSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const payload = {
        sponsor_id: parsed.data.sponsorId,
        asset_type: parsed.data.assetType,
        placement: parsed.data.placement,
        asset_url: parsed.data.assetUrl,
        cloudinary_public_id: toNullable(parsed.data.cloudinaryPublicId),
        duration_seconds: Number(parsed.data.durationSeconds),
        priority: Number(parsed.data.priority),
        link_url: toNullable(parsed.data.linkUrl),
        starts_at: parsed.data.startsAt
          ? new Date(parsed.data.startsAt).toISOString()
          : null,
        ends_at: parsed.data.endsAt
          ? new Date(parsed.data.endsAt).toISOString()
          : null,
        is_visible: parsed.data.isVisible,
        is_active: parsed.data.isActive,
      };

      let error: { message: string } | null = null;

      if (initialAsset?.id) {
        const result = await supabase
          .from("sponsor_assets")
          .update(payload)
          .eq("id", initialAsset.id);

        error = result.error;
      } else {
        const result = await supabase.from("sponsor_assets").insert(payload);
        error = result.error;
      }

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        isEditing
          ? "Asset actualizado correctamente."
          : "Asset creado correctamente."
      );

      if (isEditing) {
        router.push("/admin/assets");
        router.refresh();
        return;
      }

      setForm(getInitialState(sponsors, null));
      router.refresh();
    });
  };

  if (!sponsors.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription className="text-zinc-400">
            Necesitás al menos un sponsor antes de crear assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-xl bg-white text-black hover:bg-zinc-200">
            <Link href="/admin/sponsors">Ir a Sponsors</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="text-xl">{formTitle}</CardTitle>
          <CardDescription className="text-zinc-400">
            Asociá una pieza visual a un sponsor y definí su comportamiento público.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sponsorId">Sponsor</Label>
                <select
                  id="sponsorId"
                  value={form.sponsorId}
                  onChange={(e) => setField("sponsorId")(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
                >
                  {sponsors.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id} className="bg-zinc-950">
                      {sponsor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetType">Tipo de asset</Label>
                <select
                  id="assetType"
                  value={form.assetType}
                  onChange={(e) =>
                    setField("assetType")(e.target.value as FormState["assetType"])
                  }
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-fuchsia-500/50"
                >
                  {sponsorAssetTypes.map((type) => (
                    <option key={type} value={type} className="bg-zinc-950">
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placement">Placement</Label>
                <select
                  id="placement"
                  value={form.placement}
                  onChange={(e) =>
                    setField("placement")(e.target.value as FormState["placement"])
                  }
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-fuchsia-500/50"
                >
                  {sponsorAssetPlacements.map((placement) => (
                    <option key={placement} value={placement} className="bg-zinc-950">
                      {placement.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudinaryPublicId">Cloudinary public ID</Label>
                <Input
                  id="cloudinaryPublicId"
                  placeholder="opcional"
                  value={form.cloudinaryPublicId}
                  onChange={(e) => setField("cloudinaryPublicId")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetUrl">URL del asset</Label>
              <Input
                id="assetUrl"
                placeholder="https://res.cloudinary.com/..."
                value={form.assetUrl}
                onChange={(e) => setField("assetUrl")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link de destino</Label>
              <Input
                id="linkUrl"
                placeholder="https://..."
                value={form.linkUrl}
                onChange={(e) => setField("linkUrl")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="durationSeconds">Duración (segundos)</Label>
                <Input
                  id="durationSeconds"
                  type="number"
                  min={1}
                  max={60}
                  value={form.durationSeconds}
                  onChange={(e) => setField("durationSeconds")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Input
                  id="priority"
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(e) => setField("priority")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Inicio de vigencia</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setField("startsAt")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Fin de vigencia</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setField("endsAt")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => setField("isVisible")(e.target.checked)}
                  className="h-4 w-4 accent-cyan-400"
                />
                <div>
                  <p className="text-sm font-medium text-white">Visible</p>
                  <p className="text-xs text-zinc-400">
                    Puede aparecer públicamente si cumple las demás condiciones.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive")(e.target.checked)}
                  className="h-4 w-4 accent-fuchsia-400"
                />
                <div>
                  <p className="text-sm font-medium text-white">Activo</p>
                  <p className="text-xs text-zinc-400">
                    Habilita su operación dentro del sistema.
                  </p>
                </div>
              </label>
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
                  : "Crear asset"}
              </Button>

              {isEditing ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                >
                  <Link href="/admin/assets">Cancelar edición</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5 text-cyan-300" />
            Preview del asset
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Verificá visualmente la pieza antes de usarla en el carrusel.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <div className="aspect-[21/9]">
              {form.assetUrl ? (
                <img
                  src={form.assetUrl}
                  alt="Preview asset"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  Cargá una URL para ver el preview.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
            <p>
              <span className="text-zinc-200">Placement:</span> {form.placement.toUpperCase()}
            </p>
            <p className="mt-2">
              <span className="text-zinc-200">Duración:</span> {form.durationSeconds || "0"} s
            </p>
            <p className="mt-2">
              <span className="text-zinc-200">Prioridad:</span> {form.priority || "0"}
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-500">
            <div className="flex items-start gap-3">
              <ImageIcon className="mt-0.5 h-4 w-4" />
              <p>
                En esta fase del módulo, el asset se carga por URL. En la próxima
                capa conectamos uploader real a Cloudinary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}