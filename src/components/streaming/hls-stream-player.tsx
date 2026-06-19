"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Radio } from "lucide-react";

import { trackEvent } from "@/lib/analytics/track-event";

type HlsStreamPlayerProps = {
  sourceUrl: string;
  fallbackEmbedUrl?: string | null;
  title: string;
};

type PlayerState = "idle" | "loading" | "ready" | "error";
type Primitive = string | number | boolean | null;

function getErrorMessage(errorDetail?: string) {
  if (!errorDetail) {
    return "No se pudo cargar la señal HLS.";
  }

  return `No se pudo cargar la señal HLS (${errorDetail}).`;
}

function getUrlHost(value?: string | null) {
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function HlsStreamPlayer({
  sourceUrl,
  fallbackEmbedUrl,
  title,
}: Readonly<HlsStreamPlayerProps>) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackedEventsRef = useRef<Set<string>>(new Set());
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const trackHlsEvent = useCallback(
    (action: string, metadata: Record<string, Primitive | undefined> = {}) => {
      const eventKey = `${sourceUrl}:${fallbackEmbedUrl ?? "no-fallback"}:${action}:${metadata.mode ?? ""}:${metadata.error_detail ?? ""}`;

      if (trackedEventsRef.current.has(eventKey)) {
        return;
      }

      trackedEventsRef.current.add(eventKey);

      trackEvent({
        eventName: "stream_interaction",
        metadata: {
          action,
          component: "hls_stream_player",
          provider: "self_hosted_hls",
          title,
          source_host: getUrlHost(sourceUrl),
          fallback_host: getUrlHost(fallbackEmbedUrl),
          has_source_url: Boolean(sourceUrl),
          has_fallback_embed: Boolean(fallbackEmbedUrl),
          ...metadata,
        },
      });
    },
    [fallbackEmbedUrl, sourceUrl, title]
  );

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !sourceUrl) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function setupHls(videoElement: HTMLVideoElement) {
      setPlayerState("loading");
      setErrorMessage("");
      trackHlsEvent("hls_load_start");

      if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        trackHlsEvent("hls_native_supported", { mode: "native" });
        videoElement.src = sourceUrl;

        const handleLoadedMetadata = () => {
          if (!cancelled) {
            setPlayerState("ready");
            trackHlsEvent("hls_ready", { mode: "native" });
          }
        };

        const handleError = () => {
          if (!cancelled) {
            setPlayerState("error");
            setErrorMessage("El navegador no pudo reproducir la señal HLS nativa.");
            trackHlsEvent("hls_error", {
              mode: "native",
              error_detail: "native_video_error",
              fallback_triggered: Boolean(fallbackEmbedUrl),
            });

            if (fallbackEmbedUrl) {
              trackHlsEvent("hls_fallback_youtube", {
                mode: "native",
                reason: "native_video_error",
              });
            }
          }
        };

        videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.addEventListener("error", handleError);

        cleanup = () => {
          videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
          videoElement.removeEventListener("error", handleError);
          videoElement.removeAttribute("src");
          videoElement.load();
        };

        return;
      }

      const { default: Hls } = await import("hls.js");

      if (cancelled) {
        return;
      }

      if (!Hls.isSupported()) {
        setPlayerState("error");
        setErrorMessage("Este navegador no soporta HLS ni MediaSource Extensions.");
        trackHlsEvent("hls_unsupported", {
          mode: "hls_js",
          fallback_triggered: Boolean(fallbackEmbedUrl),
        });

        if (fallbackEmbedUrl) {
          trackHlsEvent("hls_fallback_youtube", {
            mode: "hls_js",
            reason: "hls_unsupported",
          });
        }

        return;
      }

      trackHlsEvent("hls_js_supported", { mode: "hls_js" });

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        trackHlsEvent("hls_media_attached", { mode: "hls_js" });
        hls.loadSource(sourceUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) {
          setPlayerState("ready");
          trackHlsEvent("hls_ready", { mode: "hls_js" });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || cancelled) {
          return;
        }

        const detail = String(data.details ?? "unknown_hls_error");

        setPlayerState("error");
        setErrorMessage(getErrorMessage(detail));
        trackHlsEvent("hls_error", {
          mode: "hls_js",
          error_detail: detail,
          error_type: String(data.type ?? "unknown"),
          fatal: true,
          fallback_triggered: Boolean(fallbackEmbedUrl),
        });

        if (fallbackEmbedUrl) {
          trackHlsEvent("hls_fallback_youtube", {
            mode: "hls_js",
            reason: detail,
          });
        }

        hls.destroy();
      });

      hls.attachMedia(videoElement);
      cleanup = () => hls.destroy();
    }

    void setupHls(videoElement);

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [fallbackEmbedUrl, sourceUrl, trackHlsEvent]);

  if (playerState === "error" && fallbackEmbedUrl) {
    return (
      <div className="relative aspect-video bg-black">
        <div className="absolute left-4 top-4 z-10 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
          Fallback YouTube
        </div>
        <iframe
          title={`${title} fallback`}
          src={fallbackEmbedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black">
      <video
        ref={videoRef}
        className="h-full w-full bg-black"
        controls
        playsInline
        preload="metadata"
        aria-label={title}
      />

      {playerState === "loading" || playerState === "idle" ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center">
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 p-4">
            <Radio className="h-7 w-7 text-cyan-300" />
          </div>
          <p className="text-sm text-zinc-300">Cargando señal HLS...</p>
        </div>
      ) : null}

      {playerState === "error" && !fallbackEmbedUrl ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center">
          <div className="rounded-full border border-red-500/30 bg-red-500/10 p-4">
            <AlertTriangle className="h-7 w-7 text-red-300" />
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-300">
            {errorMessage || "No se pudo reproducir la señal HLS."}
          </p>
        </div>
      ) : null}

      {playerState === "ready" ? (
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
          HLS propio
        </div>
      ) : null}
    </div>
  );
}
