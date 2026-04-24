import type { AdminBlogPost } from "@/lib/blog/get-admin-blog-posts";
import type { SiteSettings } from "@/lib/settings/get-site-settings";
import type { AdminSponsorAsset } from "@/lib/sponsors/get-admin-sponsor-assets";
import type { AdminSponsor } from "@/lib/sponsors/get-admin-sponsors";
import type { AdminStreamConfig } from "@/lib/stream/get-admin-stream-config";
import type { AdminTransmission } from "@/lib/transmissions/get-admin-transmissions";

export type ReadinessStatus = "ready" | "warning" | "critical";

export type LaunchReadinessCheck = {
  key: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  recommendation?: string;
};

export type LaunchReadinessReport = {
  overallStatus: ReadinessStatus;
  score: number;
  readyCount: number;
  totalChecks: number;
  envChecks: LaunchReadinessCheck[];
  contentChecks: LaunchReadinessCheck[];
  recommendations: string[];
};

type BuildLaunchReadinessReportInput = {
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

function getEnvChecks(): LaunchReadinessCheck[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

  return [
    {
      key: "site-url",
      label: "URL pública base",
      status: isTruthy(siteUrl) ? "ready" : "critical",
      detail: isTruthy(siteUrl)
        ? "NEXT_PUBLIC_SITE_URL está configurada."
        : "Falta NEXT_PUBLIC_SITE_URL para metadata, sitemap y canonicales.",
      recommendation: "Configurar NEXT_PUBLIC_SITE_URL con la URL pública final.",
    },
    {
      key: "supabase-public",
      label: "Supabase público",
      status:
        isTruthy(supabaseUrl) && isTruthy(supabaseAnonKey) ? "ready" : "critical",
      detail:
        isTruthy(supabaseUrl) && isTruthy(supabaseAnonKey)
          ? "Variables públicas de Supabase presentes."
          : "Faltan variables públicas de Supabase.",
      recommendation:
        "Verificar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    },
    {
      key: "supabase-service-role",
      label: "Supabase service role",
      status: isTruthy(supabaseServiceRoleKey) ? "ready" : "warning",
      detail: isTruthy(supabaseServiceRoleKey)
        ? "SUPABASE_SERVICE_ROLE_KEY presente."
        : "No se detectó SUPABASE_SERVICE_ROLE_KEY.",
      recommendation:
        "Agregar SUPABASE_SERVICE_ROLE_KEY si habrá tareas server-side privilegiadas.",
    },
    {
      key: "cloudinary",
      label: "Cloudinary",
      status:
        isTruthy(cloudinaryCloudName) &&
        isTruthy(cloudinaryApiKey) &&
        isTruthy(cloudinaryApiSecret)
          ? "ready"
          : "warning",
      detail:
        isTruthy(cloudinaryCloudName) &&
        isTruthy(cloudinaryApiKey) &&
        isTruthy(cloudinaryApiSecret)
          ? "Credenciales de Cloudinary completas."
          : "Cloudinary no está completamente configurado.",
      recommendation:
        "Completar CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET para uploads estables.",
    },
  ];
}

function isAssetLiveWindow(asset: AdminSponsorAsset) {
  const now = Date.now();

  const startsOk = !asset.starts_at || new Date(asset.starts_at).getTime() <= now;
  const endsOk = !asset.ends_at || new Date(asset.ends_at).getTime() >= now;

  return startsOk && endsOk;
}

export function buildLaunchReadinessReport({
  settings,
  streamConfig,
  transmissions,
  blogPosts,
  sponsors,
  sponsorAssets,
}: BuildLaunchReadinessReportInput): LaunchReadinessReport {
  const envChecks = getEnvChecks();

  const visibleTransmissions = transmissions.filter((item) => item.is_visible);
  const visiblePosts = blogPosts.filter((item) => item.is_visible);
  const activeSponsors = sponsors.filter((item) => item.is_active);
  const liveAssets = sponsorAssets.filter(
    (item) => item.is_active && item.is_visible && isAssetLiveWindow(item)
  );

  const contentChecks: LaunchReadinessCheck[] = [
    {
      key: "branding",
      label: "Branding base",
      status:
        settings &&
        isTruthy(settings.channel_name) &&
        isTruthy(settings.slogan) &&
        (isTruthy(settings.primary_logo_url) || isTruthy(settings.banner_logo_url))
          ? "ready"
          : "warning",
      detail:
        settings &&
        isTruthy(settings.channel_name) &&
        isTruthy(settings.slogan) &&
        (isTruthy(settings.primary_logo_url) || isTruthy(settings.banner_logo_url))
          ? "Nombre, slogan y logo configurados."
          : "Faltan piezas de branding base en Configuración.",
      recommendation:
        "Completar nombre, slogan y al menos un logo institucional en /admin/settings.",
    },
    {
      key: "contact-community",
      label: "Contacto y comunidad",
      status:
        settings &&
        (isTruthy(settings.contact_email) ||
          isTruthy(settings.whatsapp_community_url))
          ? "ready"
          : "warning",
      detail:
        settings &&
        (isTruthy(settings.contact_email) ||
          isTruthy(settings.whatsapp_community_url))
          ? "Hay al menos un canal de contacto/comunidad configurado."
          : "No hay email ni comunidad de WhatsApp configurados.",
      recommendation:
        "Definir email de contacto y/o enlace de comunidad en /admin/settings.",
    },
    {
      key: "stream",
      label: "Stream principal",
      status:
        streamConfig &&
        isTruthy(streamConfig.title) &&
        (isTruthy(streamConfig.embed_url) || isTruthy(streamConfig.source_url))
          ? "ready"
          : "warning",
      detail:
        streamConfig &&
        isTruthy(streamConfig.title) &&
        (isTruthy(streamConfig.embed_url) || isTruthy(streamConfig.source_url))
          ? "El stream principal tiene título y fuente/embed."
          : "El stream principal no está completamente configurado.",
      recommendation:
        "Revisar /admin/stream y definir título, estado y URL de source/embed.",
    },
    {
      key: "transmissions",
      label: "Historial de transmisiones",
      status: visibleTransmissions.length > 0 ? "ready" : "warning",
      detail:
        visibleTransmissions.length > 0
          ? `Hay ${visibleTransmissions.length} transmisiones visibles en el historial público.`
          : "No hay transmisiones visibles para la página pública.",
      recommendation:
        "Publicar al menos una transmisión visible en /admin/transmissions.",
    },
    {
      key: "blog",
      label: "Contenido editorial",
      status: visiblePosts.length > 0 ? "ready" : "warning",
      detail:
        visiblePosts.length > 0
          ? `Hay ${visiblePosts.length} publicaciones visibles en el blog.`
          : "No hay posts visibles en el blog público.",
      recommendation: "Publicar al menos un post visible en /admin/blog.",
    },
    {
      key: "commercial",
      label: "Cobertura comercial",
      status:
        activeSponsors.length > 0 && liveAssets.length > 0 ? "ready" : "warning",
      detail:
        activeSponsors.length > 0 && liveAssets.length > 0
          ? `Hay ${activeSponsors.length} sponsors activos y ${liveAssets.length} assets vigentes.`
          : "La capa comercial todavía no tiene sponsors activos con assets vigentes.",
      recommendation:
        "Activar sponsors y cargar assets visibles/vigentes en /admin/sponsors y /admin/assets.",
    },
  ];

  const allChecks = [...envChecks, ...contentChecks];
  const readyCount = allChecks.filter((item) => item.status === "ready").length;
  const totalChecks = allChecks.length;
  const score = Math.round((readyCount / totalChecks) * 100);

  const hasCritical = allChecks.some((item) => item.status === "critical");
  const hasWarning = allChecks.some((item) => item.status === "warning");

  const overallStatus: ReadinessStatus = hasCritical
    ? "critical"
    : hasWarning
    ? "warning"
    : "ready";

  const recommendations = allChecks
    .filter((item) => item.status !== "ready" && item.recommendation)
    .map((item) => item.recommendation as string);

  return {
    overallStatus,
    score,
    readyCount,
    totalChecks,
    envChecks,
    contentChecks,
    recommendations,
  };
}