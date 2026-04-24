import { createClient } from "@/lib/supabase/server";

type TopPage = {
  path: string;
  views: number;
};

type SiteAnalyticsSummary = {
  pageViews: {
    today: number;
    last7Days: number;
    last30Days: number;
    last365Days: number;
  };
  ctaClicksLast30Days: {
    blog: number;
    contact: number;
    songRequests: number;
    whatsapp: number;
  };
  topPagesLast30Days: TopPage[];
};

function getIsoDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

async function getEventCount({
  supabase,
  eventName,
  since,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  eventName: string;
  since: string;
}) {
  const { count, error } = await supabase
    .from("site_analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_name", eventName)
    .gte("occurred_at", since);

  if (error) {
    console.error(`Error contando ${eventName}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getSiteAnalyticsSummary(): Promise<SiteAnalyticsSummary> {
  const supabase = await createClient();

  const [today, last7Days, last30Days, last365Days, topPagesResult, ctaClicksResult] =
    await Promise.all([
      getEventCount({
        supabase,
        eventName: "page_view",
        since: getIsoDaysAgo(1),
      }),
      getEventCount({
        supabase,
        eventName: "page_view",
        since: getIsoDaysAgo(7),
      }),
      getEventCount({
        supabase,
        eventName: "page_view",
        since: getIsoDaysAgo(30),
      }),
      getEventCount({
        supabase,
        eventName: "page_view",
        since: getIsoDaysAgo(365),
      }),

      supabase
        .from("site_analytics_events")
        .select("page_path")
        .eq("event_name", "page_view")
        .gte("occurred_at", getIsoDaysAgo(30))
        .limit(2000),

      supabase
        .from("site_analytics_events")
        .select("metadata")
        .eq("event_name", "cta_click")
        .gte("occurred_at", getIsoDaysAgo(30))
        .limit(2000),
    ]);

  if (topPagesResult.error) {
    console.error("Error cargando top pages:", topPagesResult.error.message);
  }

  if (ctaClicksResult.error) {
    console.error("Error cargando clicks CTA:", ctaClicksResult.error.message);
  }

  const topPagesMap = new Map<string, number>();

  for (const row of topPagesResult.data ?? []) {
    const path = (row.page_path as string | null) ?? "/";

    topPagesMap.set(path, (topPagesMap.get(path) ?? 0) + 1);
  }

  const topPagesLast30Days = Array.from(topPagesMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const ctaClicksLast30Days = {
    blog: 0,
    contact: 0,
    songRequests: 0,
    whatsapp: 0,
  };

  for (const row of ctaClicksResult.data ?? []) {
    const metadata = row.metadata as { action?: string } | null;
    const action = metadata?.action;

    if (!action) continue;

    if (action === "nav_blog" || action === "home_blog") {
      ctaClicksLast30Days.blog += 1;
    }

    if (action === "nav_contact" || action === "home_contact") {
      ctaClicksLast30Days.contact += 1;
    }

    if (action === "nav_song_requests" || action === "home_song_requests") {
      ctaClicksLast30Days.songRequests += 1;
    }

    if (action === "whatsapp_community") {
      ctaClicksLast30Days.whatsapp += 1;
    }
  }

  return {
    pageViews: {
      today,
      last7Days,
      last30Days,
      last365Days,
    },
    ctaClicksLast30Days,
    topPagesLast30Days,
  };
}