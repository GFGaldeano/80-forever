import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { analyticsEventSchema } from "@/lib/validators/analytics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = analyticsEventSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload analytics inválido." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("site_analytics_events").insert({
      event_name: parsed.data.eventName,
      page_path: parsed.data.pagePath,
      page_title: parsed.data.pageTitle || null,
      referrer:
        parsed.data.referrer || request.headers.get("referer") || null,
      visitor_id: parsed.data.visitorId,
      session_id: parsed.data.sessionId,
      metadata: parsed.data.metadata ?? {},
    });

    if (error) {
      console.error("Error guardando analytics event:", error.message);

      return NextResponse.json(
        { error: "No se pudo guardar el evento analytics." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error en /api/analytics/track:", error);

    return NextResponse.json(
      { error: "Error inesperado registrando analytics." },
      { status: 500 }
    );
  }
}