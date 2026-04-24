import { createClient } from "@/lib/supabase/server";

type StreamStatus = "live" | "offline" | "upcoming" | "replay";

type StreamInteractionRow = {
  occurred_at: string;
  metadata: {
    action?: string;
    status?: string;
    title?: string | null;
  } | null;
};

type RecentTransmissionInteraction = {
  occurred_at: string;
  action: string;
  status: StreamStatus;
  title: string | null;
};

export type TransmissionAnalyticsSummary = {
  blockViews: {
    today: number;
    last7Days: number;
    last30Days: number;
  };
  blockClicks: {
    last30Days: number;
  };
  live: {
    viewsLast30Days: number;
    shareLast30Days: number;
  };
  statusBreakdownLast30Days: Record<StreamStatus, number>;
  recentInteractions: RecentTransmissionInteraction[];
};

function getIsoDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export async function getTransmissionAnalyticsSummary(): Promise<TransmissionAnalyticsSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_analytics_events")
    .select("occurred_at, metadata")
    .eq("event_name", "stream_interaction")
    .gte("occurred_at", getIsoDaysAgo(30))
    .order("occurred_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("Error cargando analytics de transmisión:", error.message);

    return {
      blockViews: {
        today: 0,
        last7Days: 0,
        last30Days: 0,
      },
      blockClicks: {
        last30Days: 0,
      },
      live: {
        viewsLast30Days: 0,
        shareLast30Days: 0,
      },
      statusBreakdownLast30Days: {
        live: 0,
        upcoming: 0,
        replay: 0,
        offline: 0,
      },
      recentInteractions: [],
    };
  }

  const rows = ((data ?? []) as StreamInteractionRow[]).filter(
    (row) => row.metadata?.action === "stream_block_view" || row.metadata?.action === "stream_block_click"
  );

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  const thirtyDaysMs = 30 * oneDayMs;

  let blockViewsToday = 0;
  let blockViewsLast7Days = 0;
  let blockViewsLast30Days = 0;
  let blockClicksLast30Days = 0;
  let liveViewsLast30Days = 0;

  const statusBreakdownLast30Days: Record<StreamStatus, number> = {
    live: 0,
    upcoming: 0,
    replay: 0,
    offline: 0,
  };

  for (const row of rows) {
    const occurredMs = new Date(row.occurred_at).getTime();
    const diff = now - occurredMs;

    const action = row.metadata?.action;
    const status = (row.metadata?.status as StreamStatus | undefined) ?? "offline";

    if (action === "stream_block_view") {
      if (diff <= oneDayMs) {
        blockViewsToday += 1;
      }

      if (diff <= sevenDaysMs) {
        blockViewsLast7Days += 1;
      }

      if (diff <= thirtyDaysMs) {
        blockViewsLast30Days += 1;
        statusBreakdownLast30Days[status] += 1;

        if (status === "live") {
          liveViewsLast30Days += 1;
        }
      }
    }

    if (action === "stream_block_click" && diff <= thirtyDaysMs) {
      blockClicksLast30Days += 1;
    }
  }

  const recentInteractions: RecentTransmissionInteraction[] = rows.slice(0, 5).map((row) => ({
    occurred_at: row.occurred_at,
    action: row.metadata?.action ?? "stream_block_view",
    status: ((row.metadata?.status as StreamStatus | undefined) ?? "offline"),
    title: row.metadata?.title ?? null,
  }));

  return {
    blockViews: {
      today: blockViewsToday,
      last7Days: blockViewsLast7Days,
      last30Days: blockViewsLast30Days,
    },
    blockClicks: {
      last30Days: blockClicksLast30Days,
    },
    live: {
      viewsLast30Days: liveViewsLast30Days,
      shareLast30Days:
        blockViewsLast30Days > 0
          ? Math.round((liveViewsLast30Days / blockViewsLast30Days) * 100)
          : 0,
    },
    statusBreakdownLast30Days,
    recentInteractions,
  };
}