import { createClient } from "@/lib/supabase/server";

export type AnalyticsTrafficPoint = {
  key: string;
  label: string;
  views: number;
  uniqueVisitors: number;
};

export type SiteAnalyticsTrafficSeries = {
  daily: AnalyticsTrafficPoint[];
  weekly: AnalyticsTrafficPoint[];
  monthly: AnalyticsTrafficPoint[];
  yearly: AnalyticsTrafficPoint[];
};

type PageViewRow = {
  occurred_at: string;
  visitor_id: string;
};

type BucketDefinition = {
  key: string;
  label: string;
  startMs: number;
  endMs: number;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function buildDailyBuckets(days = 14): BucketDefinition[] {
  const buckets: BucketDefinition[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);

    const start = startOfDay(date);
    const end = endOfDay(date);

    buckets.push({
      key: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
        start.getDate()
      )}`,
      label: formatDayLabel(start),
      startMs: start.getTime(),
      endMs: end.getTime(),
    });
  }

  return buckets;
}

function buildWeeklyBuckets(weeks = 12): BucketDefinition[] {
  const buckets: BucketDefinition[] = [];
  const today = new Date();

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - offset * 7);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    buckets.push({
      key: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
        start.getDate()
      )}`,
      label: `${formatDayLabel(start)}–${formatDayLabel(end)}`,
      startMs: start.getTime(),
      endMs: end.getTime(),
    });
  }

  return buckets;
}

function buildMonthlyBuckets(months = 12): BucketDefinition[] {
  const buckets: BucketDefinition[] = [];
  const now = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() - offset + 1,
      0,
      23,
      59,
      59,
      999
    );

    buckets.push({
      key: `${start.getFullYear()}-${pad(start.getMonth() + 1)}`,
      label: formatMonthLabel(start),
      startMs: start.getTime(),
      endMs: end.getTime(),
    });
  }

  return buckets;
}

function buildYearlyBuckets(years = 5): BucketDefinition[] {
  const buckets: BucketDefinition[] = [];
  const currentYear = new Date().getFullYear();

  for (let offset = years - 1; offset >= 0; offset -= 1) {
    const year = currentYear - offset;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    buckets.push({
      key: String(year),
      label: String(year),
      startMs: start.getTime(),
      endMs: end.getTime(),
    });
  }

  return buckets;
}

function aggregateRowsIntoBuckets(
  rows: PageViewRow[],
  buckets: BucketDefinition[]
): AnalyticsTrafficPoint[] {
  const bucketState = buckets.map((bucket) => ({
    ...bucket,
    views: 0,
    visitorIds: new Set<string>(),
  }));

  for (const row of rows) {
    const eventMs = new Date(row.occurred_at).getTime();

    for (const bucket of bucketState) {
      if (eventMs >= bucket.startMs && eventMs <= bucket.endMs) {
        bucket.views += 1;
        bucket.visitorIds.add(row.visitor_id);
        break;
      }
    }
  }

  return bucketState.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    views: bucket.views,
    uniqueVisitors: bucket.visitorIds.size,
  }));
}

export async function getSiteAnalyticsTrafficSeries(): Promise<SiteAnalyticsTrafficSeries> {
  const supabase = await createClient();

  const yearlyBuckets = buildYearlyBuckets(5);
  const earliestStartMs = yearlyBuckets[0]?.startMs ?? Date.now();

  const { data, error } = await supabase
    .from("site_analytics_events")
    .select("occurred_at, visitor_id")
    .eq("event_name", "page_view")
    .gte("occurred_at", new Date(earliestStartMs).toISOString())
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("Error cargando series analytics:", error.message);

    return {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
    };
  }

  const rows = (data as PageViewRow[] | null) ?? [];

  return {
    daily: aggregateRowsIntoBuckets(rows, buildDailyBuckets(14)),
    weekly: aggregateRowsIntoBuckets(rows, buildWeeklyBuckets(12)),
    monthly: aggregateRowsIntoBuckets(rows, buildMonthlyBuckets(12)),
    yearly: aggregateRowsIntoBuckets(rows, yearlyBuckets),
  };
}