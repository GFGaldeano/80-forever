import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Film,
  Image as ImageIcon,
  Megaphone,
  MessagesSquare,
  Music2,
  Radio,
  Settings2,
  Sparkles,
} from "lucide-react";

import { getAdminBlogPosts } from "@/lib/blog/get-admin-blog-posts";
import { getAdminSponsorAssets } from "@/lib/sponsors/get-admin-sponsor-assets";
import { getAdminSponsors } from "@/lib/sponsors/get-admin-sponsors";
import { getAdminStreamConfig } from "@/lib/stream/get-admin-stream-config";
import { getAdminTransmissions } from "@/lib/transmissions/get-admin-transmissions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStreamStatusLabel(status?: string | null) {
  switch (status) {
    case "live":
      return "En vivo";
    case "upcoming":
      return "Próximamente";
    case "replay":
      return "Replay";
    case "offline":
    default:
      return "Offline";
  }
}

function getStreamStatusBadgeClass(status?: string | null) {
  switch (status) {
    case "live":
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "upcoming":
      return "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "replay":
      return "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300";
    case "offline":
    default:
      return "border border-white/10 bg-white/[0.03] text-zinc-400";
  }
}

function truncateText(value?: string | null, max = 72) {
  if (!value) return "Sin información adicional.";
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

type QuickLinkCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
};

function QuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
  accentClass,
}: Readonly<QuickLinkCardProps>) {
  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`inline-flex rounded-2xl border p-3 ${accentClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
          >
            <Link href={href}>
              Ir
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const [streamConfig, transmissions, blogPosts, sponsors, sponsorAssets] =
    await Promise.all([
      getAdminStreamConfig().catch(() => null),
      getAdminTransmissions().catch(() => []),
      getAdminBlogPosts().catch(() => []),
      getAdminSponsors().catch(() => []),
      getAdminSponsorAssets().catch(() => []),
    ]);

  const transmissionsVisible = transmissions.filter((item) => item.is_visible).length;
  const transmissionsAired = transmissions.filter((item) => item.status === "aired").length;
  const transmissionsSynced = transmissions.filter(
    (item) => Boolean(item.youtube_last_synced_at)
  ).length;

  const blogVisible = blogPosts.filter((item) => item.is_visible).length;
  const blogPublished = blogPosts.filter((item) => Boolean(item.published_at)).length;

  const sponsorsActive = sponsors.filter((item) => item.is_active).length;
  const assetsVisible = sponsorAssets.filter((item) => item.is_visible).length;
  const assetsActive = sponsorAssets.filter((item) => item.is_active).length;

  const recentTransmissions = transmissions.slice(0, 5);
  const recentPosts = blogPosts.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <BarChart3 className="h-7 w-7 text-fuchsia-300" />
            Dashboard administrativo
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
            Consola de control general del canal, con lectura operativa,
            editorial y comercial de la plataforma.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Link href="/admin/transmissions">
              <Film className="mr-2 h-4 w-4" />
              Gestionar transmisiones
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
          >
            <Link href="/admin/stream">
              <Radio className="mr-2 h-4 w-4" />
              Configurar stream
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Estado del stream
            </p>

            <div className="mt-3 flex items-center gap-3">
              <Badge className={getStreamStatusBadgeClass(streamConfig?.status)}>
                {getStreamStatusLabel(streamConfig?.status)}
              </Badge>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              {streamConfig?.title || "Sin título configurado"}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Próximo vivo: {formatDateTime(streamConfig?.next_live_at)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Transmisiones
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {transmissions.length}
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-400">
              <p>Visibles: {transmissionsVisible}</p>
              <p>Emitidas: {transmissionsAired}</p>
              <p>Sync YouTube: {transmissionsSynced}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Blog
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {blogPosts.length}
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-400">
              <p>Visibles: {blogVisible}</p>
              <p>Con fecha de publicación: {blogPublished}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Sponsors y assets
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {sponsors.length}
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-400">
              <p>Sponsors activos: {sponsorsActive}</p>
              <p>Assets activos: {assetsActive}</p>
              <p>Assets visibles: {assetsVisible}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickLinkCard
          title="Transmisión actual"
          description="Controlá el player principal, el estado del canal y el próximo vivo."
          href="/admin/stream"
          icon={Radio}
          accentClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
        />

        <QuickLinkCard
          title="Transmisiones pasadas"
          description="Cargá, editá y administrá el historial público de emisiones."
          href="/admin/transmissions"
          icon={Film}
          accentClass="border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
        />

        <QuickLinkCard
          title="Blog"
          description="Gestioná efemérides, novedades del canal y contenido editorial."
          href="/admin/blog"
          icon={FileText}
          accentClass="border-violet-500/20 bg-violet-500/10 text-violet-300"
        />

        <QuickLinkCard
          title="Configuración"
          description="Centralizá branding, SEO, contacto e integraciones del sitio."
          href="/admin/settings"
          icon={Settings2}
          accentClass="border-orange-500/20 bg-orange-500/10 text-orange-300"
        />

        <QuickLinkCard
          title="Sponsors"
          description="Administrá la base comercial de anunciantes y marcas asociadas."
          href="/admin/sponsors"
          icon={Megaphone}
          accentClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        />

        <QuickLinkCard
          title="Assets"
          description="Controlá creatividades, placements y piezas visuales activas."
          href="/admin/assets"
          icon={ImageIcon}
          accentClass="border-rose-500/20 bg-rose-500/10 text-rose-300"
        />

        <QuickLinkCard
          title="Pedidos musicales"
          description="Revisá interacciones del público y futuras señales editoriales."
          href="/admin/requests"
          icon={Music2}
          accentClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
        />

        <QuickLinkCard
          title="Contacto"
          description="Consultá mensajes entrantes, oportunidades y feedback del público."
          href="/admin/contact"
          icon={MessagesSquare}
          accentClass="border-amber-500/20 bg-amber-500/10 text-amber-300"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-cyan-300" />
              Actividad reciente de transmisiones
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Últimos movimientos del historial audiovisual.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentTransmissions.length ? (
              recentTransmissions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {item.episode_code}
                      </p>
                      <p className="mt-1 font-medium text-white">{item.title}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStreamStatusBadgeClass(item.status)}>
                        {item.status === "aired"
                          ? "Emitida"
                          : item.status === "scheduled"
                          ? "Programada"
                          : item.status === "archived"
                          ? "Archivada"
                          : "Borrador"}
                      </Badge>

                      <Badge
                        className={
                          item.is_visible
                            ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                            : "border border-white/10 bg-white/[0.03] text-zinc-400"
                        }
                      >
                        {item.is_visible ? "Visible" : "Oculta"}
                      </Badge>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {truncateText(item.description)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-zinc-500">
                      Última fecha relevante:{" "}
                      {formatDateTime(item.aired_at || item.scheduled_at || item.created_at)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                      >
                        <Link href={`/admin/transmissions?edit=${item.id}`}>
                          Editar
                        </Link>
                      </Button>

                      {item.is_visible ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200"
                        >
                          <Link href={`/transmisiones/${item.slug}`} target="_blank">
                            Ver público
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center text-zinc-400">
                Todavía no hay transmisiones cargadas.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-zinc-950/80 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-fuchsia-300" />
                Actividad editorial reciente
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Últimos posts del blog cargados en el sistema.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {recentPosts.length ? (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{post.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">{post.slug}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={
                            post.is_visible
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border border-white/10 bg-white/[0.03] text-zinc-400"
                          }
                        >
                          {post.is_visible ? "Visible" : "Oculto"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">
                        Publicación: {formatDateTime(post.published_at || post.created_at)}
                      </p>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                      >
                        <Link href={`/admin/blog?edit=${post.id}`}>Editar</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center text-zinc-400">
                  Todavía no hay posts cargados.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                Resumen operativo
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-zinc-400">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p>
                  El dashboard ya está conectado con los módulos clave del canal:
                  stream, transmisiones, blog, sponsors y assets.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-200">
                <p>
                  Prioridad operativa sugerida: mantener visible el historial de
                  transmisiones, sostener el flujo editorial del blog y monitorear
                  sponsors/assets activos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}