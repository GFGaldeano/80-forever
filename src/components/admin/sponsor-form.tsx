"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Wand2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  slugifySponsorName,
  sponsorSchema,
  type SponsorInput,
} from "@/lib/validators/sponsors";
import type { AdminSponsor } from "@/lib/sponsors/get-admin-sponsors";

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

type SponsorFormProps = {
  initialSponsor?: AdminSponsor | null;
};

type FormState = SponsorInput;

function toNullable(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

function getInitialState(initialSponsor?: AdminSponsor | null): FormState {
  return {
    name: initialSponsor?.name ?? "",
    slug: initialSponsor?.slug ?? "",
    websiteUrl: initialSponsor?.website_url ?? "",
    contactName: initialSponsor?.contact_name ?? "",
    contactPhone: initialSponsor?.contact_phone ?? "",
    contactEmail: initialSponsor?.contact_email ?? "",
    notes: initialSponsor?.notes ?? "",
    isVisible: initialSponsor?.is_visible ?? true,
    isActive: initialSponsor?.is_active ?? true,
  };
}

export function SponsorForm({
  initialSponsor = null,
}: Readonly<SponsorFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(getInitialState(initialSponsor));
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = Boolean(initialSponsor?.id);

  const formTitle = useMemo(
    () => (isEditing ? "Editar sponsor" : "Nuevo sponsor"),
    [isEditing],
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
      slug: slugifySponsorName(prev.name),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = sponsorSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.",
      );
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const payload = {
        name: parsed.data.name,
        slug: parsed.data.slug,
        website_url: toNullable(parsed.data.websiteUrl),
        contact_name: toNullable(parsed.data.contactName),
        contact_phone: toNullable(parsed.data.contactPhone),
        contact_email: toNullable(parsed.data.contactEmail),
        notes: toNullable(parsed.data.notes),
        is_visible: parsed.data.isVisible,
        is_active: parsed.data.isActive,
      };

      let error: { message: string } | null = null;

      if (initialSponsor?.id) {
        const result = await supabase
          .from("sponsors")
          .update(payload)
          .eq("id", initialSponsor.id);

        error = result.error;
      } else {
        const result = await supabase.from("sponsors").insert(payload);
        error = result.error;
      }

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        isEditing
          ? "Sponsor actualizado correctamente."
          : "Sponsor creado correctamente.",
      );

      if (isEditing) {
        router.push("/admin/sponsors");
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
          Gestioná la identidad comercial, visibilidad y estado operativo del
          sponsor.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre comercial</Label>
            <Input
              id="name"
              placeholder="Ej. Retro Bar Tucumán"
              value={form.name}
              onChange={(e) => setField("name")(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="retro-bar-tucuman"
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
            <Label htmlFor="websiteUrl">Sitio web</Label>
            <Input
              id="websiteUrl"
              placeholder="https://..."
              value={form.websiteUrl}
              onChange={(e) => setField("websiteUrl")(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contacto</Label>
              <Input
                id="contactName"
                placeholder="Nombre del contacto"
                value={form.contactName}
                onChange={(e) => setField("contactName")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono</Label>
              <Input
                id="contactPhone"
                placeholder="+54 ..."
                value={form.contactPhone}
                onChange={(e) => setField("contactPhone")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de contacto</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="contacto@negocio.com"
              value={form.contactEmail}
              onChange={(e) => setField("contactEmail")(e.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones, acuerdos comerciales o referencias internas."
              value={form.notes}
              onChange={(e) => setField("notes")(e.target.value)}
              className="min-h-[120px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
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
                  Puede aparecer públicamente si tiene assets activos.
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
                  : "Crear sponsor"}
            </Button>

            {isEditing ? (
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
              >
                <Link href="/admin/sponsors">Cancelar edición</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
