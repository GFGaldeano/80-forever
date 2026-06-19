"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Radio } from "lucide-react";

type HlsStreamPlayerProps = {
  sourceUrl: string;
  fallbackEmbedUrl?: string | null;
  title: string;
};

type PlayerState = "idle" | "loading" | "ready" | "error";

function getErrorMessage(errorDetail?: string) {
  if (!errorDetail) {
    return "No se pudo cargar la señal HLS.";
  }

  return `No se pudo cargar la señal HLS (${errorDetail}).`;
}

export function HlsStreamPlayer({
  sourceUrl,
  fallbackEmbedUrl,
  title,
}: Readonly<HlsStreamPlayerProps>) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

      if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = sourceUrl;

        const handleLoadedMetadata = () => {
          if (!cancelled) {
            setPlayerState("ready");
          }
        };

        const handleError = () => {
          if (!cancelled) {
            setPlayerState("error");
            setErrorMessage("El navegador no pudo reproducir la señal HLS nativa.");
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
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(sourceUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) {
          setPlayerState("ready");
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || cancelled) {
          return;
        }

        setPlayerState("error");
        setErrorMessage(getErrorMessage(data.details));
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
  }, [sourceUrl]);

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
