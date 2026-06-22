"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Radio, Volume2, VolumeX } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { trackEvent } from "@/lib/analytics/track-event";

type HlsStreamPlayerProps = {
  sourceUrl: string;
  fallbackEmbedUrl?: string | null;
  title: string;
  onStreamUnavailable?: (reason: string) => void;
};

type PlayerState = "idle" | "loading" | "ready" | "error";
type Primitive = string | number | boolean | null;

const STREAM_STALL_FALLBACK_MS = 30_000;

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

function getCopy(locale: string) {
  if (locale === "en") {
    return {
      loading: "Preparing live signal...",
      hlsBadge: "Own HLS",
      soundTitle: "The live stream starts automatically.",
      soundDescription:
        "Due to browser policies, audio may start muted. Tap Enable sound to listen.",
      enableSound: "Enable sound",
      muteAgain: "Mute",
      autoplayBlocked:
        "Your browser blocked autoplay. Press play once to start the live stream.",
      fallbackBadge: "YouTube fallback",
    };
  }

  return {
    loading: "Preparando señal en vivo...",
    hlsBadge: "HLS propio",
    soundTitle: "La transmisión en vivo comienza automáticamente.",
    soundDescription:
      "Por políticas del navegador, el sonido puede iniciar silenciado. Tocá Activar sonido para escuchar.",
    enableSound: "Activar sonido",
    muteAgain: "Silenciar",
    autoplayBlocked:
      "El navegador bloqueó la reproducción automática. Tocá play una vez para iniciar el vivo.",
    fallbackBadge: "Fallback YouTube",
  };
}

export function HlsStreamPlayer({
  sourceUrl,
  fallbackEmbedUrl,
  title,
  onStreamUnavailable,
}: Readonly<HlsStreamPlayerProps>) {
  const locale = useLocale();
  const copy = getCopy(locale);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackedEventsRef = useRef<Set<string>>(new Set());
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

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

  const requestAutoplay = useCallback(
    async (mode: "native" | "hls_js") => {
      const videoElement = videoRef.current;

      if (!videoElement) {
        return;
      }

      videoElement.muted = true;
      videoElement.playsInline = true;
      setIsMuted(true);

      try {
        await videoElement.play();
        setAutoplayBlocked(false);
        trackHlsEvent("hls_autoplay_started", {
          mode,
          muted: true,
        });
      } catch (error) {
        setAutoplayBlocked(true);
        trackHlsEvent("hls_autoplay_blocked", {
          mode,
          error_detail: error instanceof Error ? error.name : "unknown_error",
        });
      }
    },
    [trackHlsEvent]
  );

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const handleVolumeChange = () => {
      setIsMuted(videoElement.muted || videoElement.volume === 0);
    };

    videoElement.addEventListener("volumechange", handleVolumeChange);

    return () => {
      videoElement.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    let stallTimeout: number | null = null;

    const clearStallTimeout = () => {
      if (stallTimeout) {
        window.clearTimeout(stallTimeout);
        stallTimeout = null;
      }
    };

    const startStallTimeout = (reason: string) => {
      if (playerState !== "ready") {
        return;
      }

      clearStallTimeout();
      stallTimeout = window.setTimeout(() => {
        trackHlsEvent("hls_stalled_fallback_after_grace", {
          reason,
          grace_ms: STREAM_STALL_FALLBACK_MS,
        });
        onStreamUnavailable?.(reason);
      }, STREAM_STALL_FALLBACK_MS);
    };

    const handleWaiting = () => startStallTimeout("video_waiting");
    const handleStalled = () => startStallTimeout("video_stalled");
    const handleError = () => onStreamUnavailable?.("video_error");
    const handleRecovered = () => clearStallTimeout();

    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("stalled", handleStalled);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("playing", handleRecovered);
    videoElement.addEventListener("canplay", handleRecovered);
    videoElement.addEventListener("timeupdate", handleRecovered);

    return () => {
      clearStallTimeout();
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("stalled", handleStalled);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("playing", handleRecovered);
      videoElement.removeEventListener("canplay", handleRecovered);
      videoElement.removeEventListener("timeupdate", handleRecovered);
    };
  }, [onStreamUnavailable, playerState, trackHlsEvent]);

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
      setAutoplayBlocked(false);
      setIsMuted(true);
      videoElement.muted = true;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      trackHlsEvent("hls_load_start");

      if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        trackHlsEvent("hls_native_supported", { mode: "native" });
        videoElement.src = sourceUrl;

        const handleLoadedMetadata = () => {
          if (!cancelled) {
            setPlayerState("ready");
            trackHlsEvent("hls_ready", { mode: "native" });
            void requestAutoplay("native");
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

            onStreamUnavailable?.("native_video_error");

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

        onStreamUnavailable?.("hls_unsupported");

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
          void requestAutoplay("hls_js");
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

        onStreamUnavailable?.(detail);

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
  }, [fallbackEmbedUrl, onStreamUnavailable, requestAutoplay, sourceUrl, trackHlsEvent]);

  const handleEnableSound = async () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.muted = false;
    videoElement.volume = 1;

    if (videoElement.paused) {
      try {
        await videoElement.play();
        setAutoplayBlocked(false);
      } catch (error) {
        setAutoplayBlocked(true);
        trackHlsEvent("hls_audio_enable_play_blocked", {
          error_detail: error instanceof Error ? error.name : "unknown_error",
        });
      }
    }

    setIsMuted(false);
    trackHlsEvent("hls_audio_enabled");
  };

  const handleMute = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.muted = true;
    setIsMuted(true);
    trackHlsEvent("hls_audio_muted");
  };

  if (playerState === "error" && fallbackEmbedUrl) {
    return (
      <div className="relative aspect-video bg-black">
        <div className="absolute left-4 top-4 z-10 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
          {copy.fallbackBadge}
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
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-label={title}
      />

      {playerState === "loading" || playerState === "idle" ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center">
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 p-4">
            <Radio className="h-7 w-7 text-cyan-300" />
          </div>
          <p className="text-sm text-zinc-300">{copy.loading}</p>
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
          {copy.hlsBadge}
        </div>
      ) : null}

      {playerState === "ready" && isMuted ? (
        <div className="absolute bottom-4 left-4 right-4 z-10 rounded-2xl border border-emerald-400/25 bg-black/82 p-4 text-sm text-zinc-200 shadow-[0_0_28px_rgba(16,185,129,0.16)] backdrop-blur md:left-auto md:max-w-md">
          <div className="flex items-start gap-3">
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 p-2">
              <VolumeX className="h-5 w-5 text-emerald-200" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{copy.soundTitle}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-300">
                {copy.soundDescription}
              </p>
              {autoplayBlocked ? (
                <p className="mt-2 text-xs leading-5 text-amber-200">
                  {copy.autoplayBlocked}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleEnableSound}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-400/25"
              >
                <Volume2 className="h-4 w-4" />
                {copy.enableSound}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {playerState === "ready" && !isMuted ? (
        <button
          type="button"
          onClick={handleMute}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 text-xs text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
        >
          <Volume2 className="h-4 w-4 text-emerald-200" />
          {copy.muteAgain}
        </button>
      ) : null}
    </div>
  );
}
