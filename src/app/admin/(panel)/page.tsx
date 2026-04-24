import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Megaphone,
  MessagesSquare,
  Music2,
  Radio,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetricCard } from "@/components/admin/dashboard-metric-card";
import { StreamStatusBadge } from "@/components/streaming/stream-status-badge";
import { getAdminDashboardSummary } from "@/lib/admin/get-dashboard-summary";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

const quickLinks = [
  {
    title: "Transmisión",
    href: "/admin/stream",
    description: "Estado, embed y configuración general del canal.",
    icon: Radio,
  },
  {
    title: "Sponsors",
    href: "/admin/sponsors",
    description: "Gestión de marcas, sponsors y partners.",
    icon: Megaphone,
  },
  {
    title: "Assets",
    href: "/admin/assets",
    description: "Creatividades y banners para rotación pública.",
    icon: ImageIcon,
  },
  {
    title: "Pedidos",
    href: "/admin/requests",
    description: "Revisión editorial de pedidos musicales.",
    icon: Music2,
  },
  {
    title: "Contacto",
    href: "/admin/contact",
    description: "Consultas generales, comerciales y sponsors.",
    icon: MessagesSquare,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    description: "Publicaciones editoriales, efemérides y novedades.",
    icon: FileText,
  },
];

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <Activity className="h-7 w-7 text-fuchsia-300" />
            Dashboard
          </h2>

          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
            Vista ejecutiva del estado del proyecto, operación editorial y módulos activos del sistema.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
            Estado actual de transmisión
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StreamStatusBadge status={summary.stream.status} />
            <p className="text-sm text-zinc-300">
              {summary.stream.title || "Sin título cargado"}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <DashboardMetricCard
          title="Sponsors"
          value={summary.metrics.sponsorsCount}
          hint="Total de sponsors registrados."
          icon={Megaphone}
          accentClassName="border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.12)]"
        />

        <DashboardMetricCard
          title="Assets activos"
          value={summary.metrics.activeAssetsCount}
          hint="Creatividades listas para rotación pública."
          icon={ImageIcon}
          accentClassName="border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
        />

        <DashboardMetricCard
          title="Pedidos"
          value={summary.metrics.songRequestsCount}
          hint="Pedidos musicales recibidos."
          icon={Music2}
          accentClassName="border-violet-500/20 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
        />

        <DashboardMetricCard
          title="Contactos"
          value={summary.metrics.contactMessagesCount}
          hint="Mensajes comerciales e institucionales."
          icon={MessagesSquare}
          accentClassName="border-orange-500/20 bg-orange-500/10 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.12)]"
        />

        <DashboardMetricCard
          title="Blog"
          value={summary.metrics.blogPostsCount}
          hint="Posts creados dentro del módulo editorial."
          icon={FileText}
          accentClassName="border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {summary.recentSongRequests.length ? (
              summary.recentSongRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="font-medium text-white">
                    {request.song_title} — {request.artist_name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {request.name_alias}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>{request.status}</span>
                    <span>{formatDateTime(request.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                Todavía no hay pedidos recientes.
              </p>
            )}

            <Link
              href="/admin/requests"
              className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              Ver módulo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Contactos recientes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {summary.recentContactMessages.length ? (
              summary.recentContactMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="font-medium text-white">{message.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {message.business_name || message.email || "Sin referencia"}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>{message.message_type}</span>
                    <span>{formatDateTime(message.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                Todavía no hay contactos recientes.
              </p>
            )}

            <Link
              href="/admin/contact"
              className="inline-flex items-center gap-2 text-sm text-orange-300 transition hover:text-orange-200"
            >
              Ver módulo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Posts recientes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {summary.recentBlogPosts.length ? (
              summary.recentBlogPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="font-medium text-white">{post.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{post.slug}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>{post.is_visible ? "visible" : "oculto"}</span>
                    <span>
                      {formatDateTime(post.published_at || post.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                Todavía no hay publicaciones recientes.
              </p>
            )}

            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-2 text-sm text-fuchsia-300 transition hover:text-fuchsia-200"
            >
              Ver módulo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {item.description}
                      </p>
                    </div>

                    <div className="inline-flex rounded-xl border border-white/10 bg-zinc-950 p-2 text-zinc-300">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              Próxima capa: analytics y audiencia
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              En la siguiente fase vamos a incorporar métricas reales de audiencia web, visitas por período, picos durante transmisión, interacción con sponsors y, si conviene, conexión con YouTube.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                  Audiencia diaria
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">—</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                  Audiencia semanal
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">—</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                  Audiencia mensual
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">—</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                  Audiencia anual
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">—</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-zinc-400">
              Esta estructura ya deja el dashboard listo para enchufar charts interactivos y KPIs de negocio en la próxima rama.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}