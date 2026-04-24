import { Settings2 } from "lucide-react";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/settings/get-site-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <Settings2 className="h-7 w-7 text-fuchsia-300" />
            Configuración
          </h2>

          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
            Centro base de branding, contacto, SEO e integraciones del canal.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SiteSettingsForm initialSettings={settings} />

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Resumen actual</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Canal
              </p>
              <p className="mt-2 font-medium text-white">
                {settings.channel_name}
              </p>
              <p className="mt-1 text-zinc-400">{settings.slogan}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Contacto
              </p>
              <p className="mt-2 break-all text-zinc-300">
                {settings.contact_email || "Sin email configurado"}
              </p>
              <p className="mt-1 break-all text-zinc-400">
                {settings.whatsapp_community_url || "Sin comunidad configurada"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                SEO base
              </p>
              <p className="mt-2 text-zinc-300">
                {settings.default_seo_title || "Sin título SEO configurado"}
              </p>
              <p className="mt-1 text-zinc-400">
                {settings.default_seo_description ||
                  "Sin descripción SEO configurada"}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-200">
              Esta base permite que futuras ramas reemplacen valores hardcodeados
              del sitio por configuración dinámica desde panel.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}