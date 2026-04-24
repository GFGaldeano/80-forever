import { NextResponse } from "next/server";

import { getAdminBlogPosts } from "@/lib/blog/get-admin-blog-posts";
import { buildLaunchReadinessReport } from "@/lib/readiness/build-launch-readiness-report";
import { getSiteSettings } from "@/lib/settings/get-site-settings";
import { getAdminSponsorAssets } from "@/lib/sponsors/get-admin-sponsor-assets";
import { getAdminSponsors } from "@/lib/sponsors/get-admin-sponsors";
import { getAdminStreamConfig } from "@/lib/stream/get-admin-stream-config";
import { getAdminTransmissions } from "@/lib/transmissions/get-admin-transmissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [
    settingsResult,
    streamResult,
    transmissionsResult,
    blogResult,
    sponsorsResult,
    assetsResult,
  ] = await Promise.allSettled([
    getSiteSettings(),
    getAdminStreamConfig(),
    getAdminTransmissions(),
    getAdminBlogPosts(),
    getAdminSponsors(),
    getAdminSponsorAssets(),
  ]);

  const report = buildLaunchReadinessReport({
    settings: settingsResult.status === "fulfilled" ? settingsResult.value : null,
    streamConfig: streamResult.status === "fulfilled" ? streamResult.value : null,
    transmissions:
      transmissionsResult.status === "fulfilled" ? transmissionsResult.value : [],
    blogPosts: blogResult.status === "fulfilled" ? blogResult.value : [],
    sponsors: sponsorsResult.status === "fulfilled" ? sponsorsResult.value : [],
    sponsorAssets: assetsResult.status === "fulfilled" ? assetsResult.value : [],
  });

  const ok = report.overallStatus !== "critical";

  return NextResponse.json(
    {
      ok,
      status: report.overallStatus,
      score: report.score,
      checked_at: new Date().toISOString(),
      summary: {
        ready_checks: report.readyCount,
        total_checks: report.totalChecks,
        recommendations: report.recommendations.length,
      },
      report,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}