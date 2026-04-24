export type ParsedYouTubeVideo = {
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
};

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

function buildParsedVideo(videoId: string): ParsedYouTubeVideo {
  return {
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

export function extractYouTubeVideoId(input: string) {
  const trimmed = input.trim();

  if (!trimmed) return null;

  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId && YOUTUBE_ID_REGEX.test(videoId) ? videoId : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const watchId = url.searchParams.get("v");
      if (watchId && YOUTUBE_ID_REGEX.test(watchId)) {
        return watchId;
      }

      const segments = url.pathname.split("/").filter(Boolean);

      const knownPrefixes = ["embed", "shorts", "live", "v"];
      if (segments.length >= 2 && knownPrefixes.includes(segments[0])) {
        const candidate = segments[1];
        return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function parseYouTubeVideo(input: string) {
  const videoId = extractYouTubeVideoId(input);

  if (!videoId) {
    return null;
  }

  return buildParsedVideo(videoId);
}