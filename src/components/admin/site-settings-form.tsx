"use client";

import { useState, useTransition } from "react";
import { Save, Settings2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/settings/get-site-settings";
import {
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/lib/validators/site-settings";

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

type SiteSettingsFormProps = {
  initialSettings: SiteSettings;
};

function toInitialState(settings: SiteSettings): SiteSettingsInput {
  return {
    channelName: settings.channel_name,
    slogan: settings.slogan,
    shortDescription: settings.short_description,
    contactEmail: settings.contact_email,
    whatsappCommunityUrl: settings.whatsapp_community_url,
    primaryLogoUrl: settings.primary_logo_url,
    bannerLogoUrl: settings.banner_logo_url,
    defaultSocialImageUrl: settings.default_social_image_url,
    siteUrl: settings.site_url,
    defaultSeoTitle: settings.default_seo_title,
    defaultSeoDescription: settings.default_seo_description,
    youtubeChannelUrl: settings.youtube_channel_url,
    globalNotice: settings.global_notice,
    institutionalText: settings.institutional_text,
  };
}

export function SiteSettingsForm({
  initialSettings,
}: Readonly<SiteSettingsFormProps>) {
  const [form, setForm] = useState<SiteSettingsInput>(
    toInitialState(initialSettings)
  );
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const setField =
    <K extends keyof SiteSettingsInput>(field: K) =>
    (value: SiteSettingsInput[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = siteSettingsSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Revisá los datos ingresados."
      );
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
        site_key: "primary",
        channel_name: parsed.data.channelName,
        slogan: parsed.data.slogan,
        short_description: parsed.data.shortDescription || null,
        contact_email: parsed.data.contactEmail || null,
        whatsapp_community_url: parsed.data.whatsappCommunityUrl || null,
        primary_logo_url: parsed.data.primaryLogoUrl || null,
        banner_logo_url: parsed.data.bannerLogoUrl || null,
        default_social_image_url: parsed.data.defaultSocialImageUrl || null,
        site_url: parsed.data.siteUrl || null,
        default_seo_title: parsed.data.defaultSeoTitle || null,
        default_seo_description: parsed.data.defaultSeoDescription || null,
        youtube_channel_url: parsed.data.youtubeChannelUrl || null,
        global_notice: parsed.data.globalNotice || null,
        institutional_text: parsed.data.institutionalText || null,
        updated_by: adminProfile.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "site_key" });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Configuración guardada correctamente.");
    });
  };

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Settings2 className="h-5 w-5 text-cyan-300" />
          Configuración general
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Base central para branding, contacto, SEO e integraciones del canal.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white">General</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Identidad principal del canal y descripción corta.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="channelName">Nombre del canal</Label>
                <Input
                  id="channelName"
                  value={form.channelName}
                  onChange={(e) => setField("channelName")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  value={form.slogan}
                  onChange={(e) => setField("slogan")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripción corta</Label>
              <Textarea
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) =>
                  setField("shortDescription")(e.target.value)
                }
                className="min-h-[110px] rounded-2xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="globalNotice">Aviso global del sitio</Label>
              <Input
                id="globalNotice"
                placeholder="Mensaje breve opcional para usar luego en banners o avisos."
                value={form.globalNotice}
                onChange={(e) => setField("globalNotice")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionalText">Texto institucional</Label>
              <Textarea
                id="institutionalText"
                value={form.institutionalText}
                onChange={(e) =>
                  setField("institutionalText")(e.target.value)
                }
                className="min-h-[140px] rounded-2xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white">Contacto e integración</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Canales principales de contacto y comunidad.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de contacto</Label>
                <Input
                  id="contactEmail"
                  value={form.contactEmail}
                  onChange={(e) => setField("contactEmail")(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappCommunityUrl">WhatsApp comunidad</Label>
                <Input
                  id="whatsappCommunityUrl"
                  value={form.whatsappCommunityUrl}
                  onChange={(e) =>
                    setField("whatsappCommunityUrl")(e.target.value)
                  }
                  className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeChannelUrl">Canal oficial de YouTube</Label>
              <Input
                id="youtubeChannelUrl"
                value={form.youtubeChannelUrl}
                onChange={(e) =>
                  setField("youtubeChannelUrl")(e.target.value)
                }
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white">Branding</h3>
              <p className="mt-1 text-xs text-zinc-500">
                URLs base para imágenes institucionales del canal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryLogoUrl">Logo principal</Label>
              <Input
                id="primaryLogoUrl"
                value={form.primaryLogoUrl}
                onChange={(e) => setField("primaryLogoUrl")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerLogoUrl">Banner / logo horizontal</Label>
              <Input
                id="bannerLogoUrl"
                value={form.bannerLogoUrl}
                onChange={(e) => setField("bannerLogoUrl")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSocialImageUrl">Imagen social por defecto</Label>
              <Input
                id="defaultSocialImageUrl"
                value={form.defaultSocialImageUrl}
                onChange={(e) =>
                  setField("defaultSocialImageUrl")(e.target.value)
                }
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white">SEO y sitio</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Configuración base para posicionamiento y metadatos globales.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl">URL base del sitio</Label>
              <Input
                id="siteUrl"
                value={form.siteUrl}
                onChange={(e) => setField("siteUrl")(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSeoTitle">Título SEO por defecto</Label>
              <Input
                id="defaultSeoTitle"
                value={form.defaultSeoTitle}
                onChange={(e) =>
                  setField("defaultSeoTitle")(e.target.value)
                }
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">
                Descripción SEO por defecto
              </Label>
              <Textarea
                id="defaultSeoDescription"
                value={form.defaultSeoDescription}
                onChange={(e) =>
                  setField("defaultSeoDescription")(e.target.value)
                }
                className="min-h-[110px] rounded-2xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </section>

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
  );
}