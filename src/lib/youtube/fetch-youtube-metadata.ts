import { parseYouTubeVideo } from "@/lib/youtube/parse-youtube";

export type SyncedYouTubeMetadata = {
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  title: string | null;
  authorName: string | null;
  authorUrl: string | null;
  source: "youtube_oembed" | "parsed_url";
  syncedAt: string;
};

type YouTubeOEmbedResponse = {
  title?: string;
  author_name?: string;
  author_url?: string;
};

export async function fetchYouTubeMetadata(
  youtubeUrl: string
): Promise<SyncedYouTubeMetadata | null> {
  const parsed = parseYouTubeVideo(youtubeUrl);

  if (!parsed) {
    return null;
  }

  const fallback: SyncedYouTubeMetadata = {
    videoId: parsed.videoId,
    watchUrl: parsed.watchUrl,
    embedUrl: parsed.embedUrl,
    thumbnailUrl: parsed.thumbnailUrl,
    title: null,
    authorName: null,
    authorUrl: null,
    source: "parsed_url",
    syncedAt: new Date().toISOString(),
  };

  try {
    const endpoint = new URL("https://www.youtube.com/oembed");
    endpoint.searchParams.set("url", parsed.watchUrl);
    endpoint.searchParams.set("format", "json");

    const response = await fetch(endpoint.toString(), {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    const json = (await response.json()) as YouTubeOEmbedResponse;

    return {
      ...fallback,
      title: json.title?.trim() || null,
      authorName: json.author_name?.trim() || null,
      authorUrl: json.author_url?.trim() || null,
      source: "youtube_oembed",
    };
  } catch {
    return fallback;
  }
}