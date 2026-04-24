import { NextResponse } from "next/server";
import { z } from "zod";

import { fetchYouTubeMetadata } from "@/lib/youtube/fetch-youtube-metadata";

export const runtime = "nodejs";

const requestSchema = z.object({
  youtubeUrl: z.string().trim().min(1, "La URL es obligatoria."),
});

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Payload inválido." },
        { status: 400 }
      );
    }

    const metadata = await fetchYouTubeMetadata(parsed.data.youtubeUrl);

    if (!metadata) {
      return NextResponse.json(
        { error: "No se pudo interpretar la URL de YouTube." },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: metadata }, { status: 200 });
  } catch (error) {
    console.error("Error en /api/youtube/metadata:", error);

    return NextResponse.json(
      { error: "No se pudo sincronizar la metadata de YouTube." },
      { status: 500 }
    );
  }
}