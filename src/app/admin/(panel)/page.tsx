import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Eye,
  FileText,
  Image as ImageIcon,
  Megaphone,
  MessagesSquare,
  MousePointerClick,
  Music2,
  Radio,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetricCard } from "@/components/admin/dashboard-metric-card";
import { SiteAnalyticsCTAChart } from "@/components/admin/site-analytics-cta-chart";
import { SiteAnalyticsTopPagesChart } from "@/components/admin/site-analytics-top-pages-chart";
import { SiteAnalyticsTrafficChart } from "@/components/admin/site-analytics-traffic-chart";
import { StreamStatusBadge } from "@/components/streaming/stream-status-badge";
import { getAdminDashboardSummary } from "@/lib/admin/get-dashboard-summary";
import { getSiteAnalyticsSummary } from "@/lib/admin/get-site-analytics-summary";
import { getSiteAnalyticsTrafficSeries } from "@/lib/admin/get-site-analytics-traffic-series";
import { getTransmissionAnalyticsSummary } from "@/lib/admin/get-transmission-analytics-summary";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTransmissionAction(action: string) {
  switch (action) {
    case "stream_block_view":
      return "Vista del bloque";
    case "stream_block_click":
      return "Click en bloque";
    default:
      return action;
  }
}

function formatTransmissionStatus(
  status: "live" | "offline" | "upcoming" | "replay"
) {
  switch (status) {
    case "live":
      return "En vivo";
    case "upcoming":
      return "Próximo";
    case "replay":
      return "Replay";
    case "offline":
    default:
      return "Offline";
  }
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
  const [summary, analytics, trafficSeries, transmission] = await Promise.all([
    getAdminDashboardSummary(),
    getSiteAnalyticsSummary(),
    getSiteAnalyticsTrafficSeries(),
    getTransmissionAnalyticsSummary(),
  ]);

  const ctaChartData = [
    {
      label: "Blog",
      clicks: analytics.ctaClicksLast30Days.blog,
      color: "#22d3ee",
    },
    {
      label: "Contacto",
      clicks: analytics.ctaClicksLast30Days.contact,
      color: "#fb923c",
    },
    {
      label: "Pedí tu tema",
      clicks: analytics.ctaClicksLast30Days.songRequests,
      color: "#a78bfa",
    },
    {
      label: "Comunidad",
      clicks: analytics.ctaClicksLast30Days.whatsapp,
      color: "#4ade80",
    },
  ];

  const transmissionStatusRows = [
    {
      key: "live",
      label: "En vivo",
      value: transmission.statusBreakdownLast30Days.live,
      accent: "bg-emerald-400/80",
      text: "text-emerald-300",
    },
    {
      key: "upcoming",
      label: "Próximo",
      value: transmission.statusBreakdownLast30Days.upcoming,
      accent: "bg-cyan-400/80",
      text: "text-cyan-300",
    },
    {
      key: "replay",
      label: "Replay",
      value: transmission.statusBreakdownLast30Days.replay,
      accent: "bg-violet-400/80",
      text: "text-violet-300",
    },
    {
      key: "offline",
      label: "Offline",
      value: transmission.statusBreakdownLast30Days.offline,
      accent: "bg-zinc-400/80",
      text: "text-zinc-300",
    },
  ];

  const transmissionMaxValue = Math.max(
    ...transmissionStatusRows.map((row) => row.value),
    1
  );

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
            Vista ejecutiva del estado del proyecto, operación editorial,
            audiencia web y comportamiento alrededor de la transmisión.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Audiencia hoy
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {analytics.pageViews.today}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Últimos 7 días
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {analytics.pageViews.last7Days}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Últimos 30 días
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {analytics.pageViews.last30Days}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Últimos 365 días
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {analytics.pageViews.last365Days}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr] xl:[&>*]:min-w-0">
        <SiteAnalyticsTrafficChart series={trafficSeries} />
        <SiteAnalyticsCTAChart data={ctaChartData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:[&>*]:min-w-0">
        <SiteAnalyticsTopPagesChart data={analytics.topPagesLast30Days} />

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Lectura de audiencia</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              Ya tenemos una primera lectura real de navegación y comportamiento.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              Esto permite medir el peso del blog, contacto, pedidos y comunidad.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              El siguiente foco natural es entender qué cambia cuando hay transmisión.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-cyan-300" />
              Señales de transmisión
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Bloque visto hoy
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {transmission.blockViews.today}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Bloque visto 7 días
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {transmission.blockViews.last7Days}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Bloque visto 30 días
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {transmission.blockViews.last30Days}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Clicks bloque 30 días
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {transmission.blockClicks.last30Days}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Durante vivo
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-emerald-300">
                      {transmission.live.viewsLast30Days}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Vistas del bloque con el canal en estado <span className="text-emerald-300">live</span> en los últimos 30 días.
                    </p>
                  </div>

                  <div className="inline-flex rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
                    <Eye className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Participación del vivo
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {transmission.live.shareLast30Days}%
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                  <MousePointerClick className="h-4 w-4 text-cyan-300" />
                  Distribución por estado del stream
                </p>

                <div className="space-y-4">
                  {transmissionStatusRows.map((row) => (
                    <div key={row.key}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className={`text-sm ${row.text}`}>{row.label}</p>
                        <p className="text-sm text-zinc-400">{row.value}</p>
                      </div>

                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className={`h-2 rounded-full ${row.accent}`}
                          style={{
                            width:
                              row.value > 0
                                ? `${Math.max(
                                    8,
                                    (row.value / transmissionMaxValue) * 100
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              En esta fase medimos visualización e interacción del bloque del stream.
              La interacción interna del reproductor de YouTube se integrará después.
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle>Actividad reciente del stream</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {transmission.recentInteractions.length ? (
              transmission.recentInteractions.map((item, index) => (
                <div
                  key={`${item.occurred_at}-${item.action}-${index}`}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="font-medium text-white">
                    {formatTransmissionAction(item.action)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {item.title || "Sin título de transmisión"}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>{formatTransmissionStatus(item.status)}</span>
                    <span>{formatDateTime(item.occurred_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                Todavía no hay actividad reciente del bloque de transmisión.
              </p>
            )}
          </CardContent>
        </Card>
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
            <CardTitle>Lectura ejecutiva</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              Ya medimos audiencia general, navegación y ahora también señales específicas del stream.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              Esto da base objetiva para correlacionar programación, vivo e interés del público.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              El paso siguiente ideal es sumar eventos internos del reproductor y preparar integración con YouTube.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}