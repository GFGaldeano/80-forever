import type { AdminBlogPost } from "@/lib/blog/get-admin-blog-posts";
import type { SiteSettings } from "@/lib/settings/get-site-settings";
import type { AdminSponsorAsset } from "@/lib/sponsors/get-admin-sponsor-assets";
import type { AdminSponsor } from "@/lib/sponsors/get-admin-sponsors";
import type { AdminStreamConfig } from "@/lib/stream/get-admin-stream-config";
import type { AdminTransmission } from "@/lib/transmissions/get-admin-transmissions";

export type OperationalAlertSeverity = "critical" | "warning" | "info";

export type OperationalAlert = {
  key: string;
  title: string;
  description: string;
  severity: OperationalAlertSeverity;
  actionHref?: string;
  actionLabel?: string;
};

type BuildOperationalAlertsInput = {
  settings: SiteSettings | null;
  streamConfig: AdminStreamConfig | null;
  transmissions: AdminTransmission[];
  blogPosts: AdminBlogPost[];
  sponsors: AdminSponsor[];
  sponsorAssets: AdminSponsorAsset[];
};

function isTruthy(value?: string | null) {
  return Boolean(value?.trim());
}

function isAssetLiveWindow(asset: AdminSponsorAsset) {
  const now = Date.now();

  const startsOk = !asset.starts_at || new Date(asset.starts_at).getTime() <= now;
  const endsOk = !asset.ends_at || new Date(asset.ends_at).getTime() >= now;

  return startsOk && endsOk;
}

function getHoursUntil(dateValue: string) {
  const diffMs = new Date(dateValue).getTime() - Date.now();
  return diffMs / (1000 * 60 * 60);
}

function getSeverityWeight(severity: OperationalAlertSeverity) {
  switch (severity) {
    case "critical":
      return 3;
    case "warning":
      return 2;
    case "info":
    default:
      return 1;
  }
}

export function buildOperationalAlerts({
  settings,
  streamConfig,
  transmissions,
  blogPosts,
  sponsors,
  sponsorAssets,
}: BuildOperationalAlertsInput): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  const visibleTransmissions = transmissions.filter((item) => item.is_visible);
  const visiblePosts = blogPosts.filter((item) => item.is_visible);
  const activeSponsors = sponsors.filter((item) => item.is_active);
  const liveAssets = sponsorAssets.filter(
    (item) => item.is_active && item.is_visible && isAssetLiveWindow(item)
  );

  const transmissionsWithSyncError = transmissions.filter((item) =>
    Boolean(item.youtube_sync_error?.trim())
  );

  const visibleWithoutSync = visibleTransmissions.filter(
    (item) => !item.youtube_last_synced_at
  );

  const futureTransmissions = transmissions
    .filter((item) => item.scheduled_at && new Date(item.scheduled_at).getTime() > Date.now())
    .sort(
      (a, b) =>
        new Date(a.scheduled_at as string).getTime() -
        new Date(b.scheduled_at as string).getTime()
    );

  const nextTransmission = futureTransmissions[0];

  if (!streamConfig) {
    alerts.push({
      key: "missing-stream-config",
      title: "No hay stream principal configurado",
      description:
        "La home pública no tiene una configuración principal de stream cargada.",
      severity: "critical",
      actionHref: "/admin/stream",
      actionLabel: "Configurar stream",
    });
  } else {
    if (
      streamConfig.status === "live" &&
      !isTruthy(streamConfig.embed_url) &&
      !isTruthy(streamConfig.source_url)
    ) {
      alerts.push({
        key: "live-without-source",
        title: "El canal figura en vivo pero no tiene source/embed",
        description:
          "El estado está en vivo, pero falta la URL principal para reproducir la señal.",
        severity: "critical",
        actionHref: "/admin/stream",
        actionLabel: "Corregir stream",
      });
    }

    if (streamConfig.status === "upcoming" && !streamConfig.next_live_at) {
      alerts.push({
        key: "upcoming-without-date",
        title: "El stream está como próximo pero sin fecha",
        description:
          "Conviene definir la fecha del próximo vivo para mejorar la comunicación pública.",
        severity: "warning",
        actionHref: "/admin/stream",
        actionLabel: "Definir próximo vivo",
      });
    }
  }

  if (!isTruthy(settings?.contact_email) && !isTruthy(settings?.whatsapp_community_url)) {
    alerts.push({
      key: "missing-contact-channels",
      title: "No hay canal de contacto o comunidad configurado",
      description:
        "El sitio no tiene email de contacto ni enlace de comunidad cargados en configuración.",
      severity: "warning",
      actionHref: "/admin/settings",
      actionLabel: "Ir a configuración",
    });
  }

  if (visibleTransmissions.length === 0) {
    alerts.push({
      key: "no-visible-transmissions",
      title: "No hay transmisiones visibles",
      description:
        "El historial público de transmisiones está vacío o completamente oculto.",
      severity: "warning",
      actionHref: "/admin/transmissions",
      actionLabel: "Gestionar transmisiones",
    });
  }

  if (visiblePosts.length === 0) {
    alerts.push({
      key: "no-visible-blog-posts",
      title: "No hay posts visibles en el blog",
      description:
        "La sección editorial pública no tiene publicaciones activas en este momento.",
      severity: "warning",
      actionHref: "/admin/blog",
      actionLabel: "Gestionar blog",
    });
  }

  if (activeSponsors.length === 0) {
    alerts.push({
      key: "no-active-sponsors",
      title: "No hay sponsors activos",
      description:
        "La capa comercial no tiene sponsors activos cargados actualmente.",
      severity: "warning",
      actionHref: "/admin/sponsors",
      actionLabel: "Gestionar sponsors",
    });
  }

  if (liveAssets.length === 0) {
    alerts.push({
      key: "no-live-assets",
      title: "No hay assets comerciales vigentes",
      description:
        "No hay piezas activas, visibles y dentro de su ventana temporal de publicación.",
      severity: "warning",
      actionHref: "/admin/assets",
      actionLabel: "Gestionar assets",
    });
  }

  if (transmissionsWithSyncError.length > 0) {
    alerts.push({
      key: "youtube-sync-errors",
      title: "Hay transmisiones con errores de sync YouTube",
      description: `Se detectaron ${transmissionsWithSyncError.length} transmisiones con errores o fallbacks en la sincronización.`,
      severity: "warning",
      actionHref: "/admin/transmissions",
      actionLabel: "Revisar transmisiones",
    });
  }

  if (visibleWithoutSync.length > 0) {
    alerts.push({
      key: "visible-without-youtube-sync",
      title: "Hay transmisiones visibles sin sync de YouTube",
      description: `Se detectaron ${visibleWithoutSync.length} transmisiones visibles sin metadata sincronizada.`,
      severity: "info",
      actionHref: "/admin/transmissions",
      actionLabel: "Sincronizar metadata",
    });
  }

  if (nextTransmission?.scheduled_at) {
    const hoursUntil = getHoursUntil(nextTransmission.scheduled_at);

    if (hoursUntil <= 48) {
      alerts.push({
        key: "next-transmission-soon",
        title: "Hay una próxima transmisión dentro de 48 horas",
        description: `${nextTransmission.title} está programada para ${new Intl.DateTimeFormat(
          "es-AR",
          {
            dateStyle: "short",
            timeStyle: "short",
          }
        ).format(new Date(nextTransmission.scheduled_at))}.`,
        severity: "info",
        actionHref: "/admin/transmissions",
        actionLabel: "Ver agenda",
      });
    }
  }

  return alerts.sort(
    (a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity)
  );
}