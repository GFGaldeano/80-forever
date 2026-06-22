import { NextResponse } from "next/server";

import { isValidLocale, type Locale } from "@/i18n/config";
import { getPublicStreamConfig } from "@/lib/stream/get-public-stream-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getLocaleFromRequest(request: Request): Locale {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale") ?? "";

  return isValidLocale(localeParam) ? localeParam : "es";
}

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const stream = await getPublicStreamConfig(locale);

  return NextResponse.json(
    {
      stream,
      checked_at: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
