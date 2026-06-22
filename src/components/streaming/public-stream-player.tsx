"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Radio } from "lucide-react";

import type { PublicStreamConfig } from "@/lib/stream/get-public-stream-config";
import { useLocale } from "@/i18n/locale-context";
import { trackEvent } from "@/lib/analytics/track-event";
import { HlsStreamPlayer } from "@/components/streaming/hls-stream-player";
import { PublicStreamPlaceholder } from "@/components/streaming/public-stream-placeholder";

type PublicStreamPlayerProps = {
  stream: PublicStreamConfig | null;
};

type StreamStatusResponse = {
  stream: PublicStreamConfig | null;
  checked_at: string;
};

type HlsHealth = "idle" | "checking" | "available" | "unavailable";

const STREAM_STATUS_POLL_MS = 10_000;
const HLS_HEALTH_TIMEOUT_MS = 6_000;
const HLS_RETURN_TO_FALLBACK_MS = 30_000;

function getStreamSignature(stream: PublicStreamConfig | null) {
  if (!stream) return "no-stream";

  return [
    stream.id,
    stream.provider,
    stream.status,
    stream.source_url ?? "no-source",
    stream.embed_url ?? "no-embed",
    stream.updated_at,
  ].join(":");
}

function isPlaybackStatus(status?: PublicStreamConfig["status"]) {
  return status === "live" || status === "replay";
}

function getUrlHost(value?: string | null) {
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

async function checkHlsManifest(sourceUrl: string, signal: AbortSignal) {
  const response = await fetch(sourceUrl, {
    cache: "no-store",
    mode: "cors",
    signal,
  });

  return response.ok;
}

function getCopy(locale: string) {
  if (locale === "en") {
    return {
      sectionTitle: "Main signal",
      fallbackBadge: "Fallback video",
      fallbackTitle: "Featured video while the live stream starts",
      fallbackDescription:
        "When the live stream begins, we will automatically switch to the live signal.",
      hlsChecking: "Checking live signal...",
      hlsUnavailable:
        "The live signal is not ready yet. You can keep watching the featured video while we wait.",
    };
  }

  return {
    sectionTitle: "Señal principal",
    fallbackBadge: "Video destacado",
    fallbackTitle: "Video destacado mientras comienza el vivo",
    fallbackDescription:
      "Cuando la transmisión en vivo comience, cambiaremos automáticamente a la señal en directo.",
    hlsChecking: "Verificando señal en vivo...",
    hlsUnavailable:
      "La señal en vivo todavía no está lista. Podés seguir viendo el video destacado mientras esperamos.",
  };
}

export function PublicStreamPlayer({
  stream,
}: Readonly<PublicStreamPlayerProps>) {
  const locale = useLocale();
  const copy = getCopy(locale);
  const [currentStream, setCurrentStream] = useState<PublicStreamConfig | null>(
    stream
  );
  const [hlsHealth, setHlsHealth] = useState<HlsHealth>("idle");
  const [hlsHadAvailablePlayback, setHlsHadAvailablePlayback] = useState(false);
  const lastStreamSignatureRef = useRef(getStreamSignature(stream));
  const hlsWasAvailableRef = useRef(false);
  const hlsUnavailableSinceRef = useRef<number | null>(null);

  const trackPublicPlayerEvent = useCallback(
    (action: string, metadata: Record<string, string | number | boolean | null> = {}) => {
      trackEvent({
        eventName: "stream_interaction",
        metadata: {
          action,
          component: "public_stream_player",
          provider: currentStream?.provider ?? null,
          status: currentStream?.status ?? null,
          title: currentStream?.title ?? null,
          source_host: getUrlHost(currentStream?.source_url),
          fallback_host: getUrlHost(currentStream?.embed_url),
          ...metadata,
        },
      });
    },
    [currentStream]
  );

  const applyHlsHealthResult = useCallback(
    (available: boolean, metadata: Record<string, string | number | boolean | null> = {}) => {
      if (available) {
        hlsWasAvailableRef.current = true;
        hlsUnavailableSinceRef.current = null;
        setHlsHadAvailablePlayback(true);
        setHlsHealth("available");
        trackPublicPlayerEvent("hls_manifest_available", metadata);
        return;
      }

      const now = Date.now();

      if (!hlsWasAvailableRef.current) {
        hlsUnavailableSinceRef.current = now;
        setHlsHadAvailablePlayback(false);
        setHlsHealth("unavailable");
        trackPublicPlayerEvent("hls_manifest_unavailable", metadata);
        return;
      }

      if (!hlsUnavailableSinceRef.current) {
        hlsUnavailableSinceRef.current = now;
        setHlsHealth("checking");
        trackPublicPlayerEvent("hls_manifest_unavailable_grace_started", {
          ...metadata,
          grace_ms: HLS_RETURN_TO_FALLBACK_MS,
        });
        return;
      }

      const unavailableForMs = now - hlsUnavailableSinceRef.current;

      if (unavailableForMs >= HLS_RETURN_TO_FALLBACK_MS) {
        hlsWasAvailableRef.current = false;
        setHlsHadAvailablePlayback(false);
        setHlsHealth("unavailable");
        trackPublicPlayerEvent("hls_manifest_unavailable_fallback_after_grace", {
          ...metadata,
          unavailable_for_ms: unavailableForMs,
        });
        return;
      }

      setHlsHealth("checking");
    },
    [trackPublicPlayerEvent]
  );

  const handleHlsPlayerUnavailable = useCallback(
    (reason: string) => {
      hlsWasAvailableRef.current = false;
      hlsUnavailableSinceRef.current = null;
      setHlsHadAvailablePlayback(false);
      setHlsHealth("unavailable");
      trackPublicPlayerEvent("hls_player_unavailable_fallback", {
        reason,
      });
    },
    [trackPublicPlayerEvent]
  );

  useEffect(() => {
    let cancelled = false;

    async function pollStreamStatus() {
      try {
        const response = await fetch(`/api/stream/status?locale=${locale}`, {
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json()) as StreamStatusResponse;
        const nextSignature = getStreamSignature(payload.stream);

        if (nextSignature !== lastStreamSignatureRef.current) {
          const previousSignature = lastStreamSignatureRef.current;
          lastStreamSignatureRef.current = nextSignature;
          hlsWasAvailableRef.current = false;
          hlsUnavailableSinceRef.current = null;
          setHlsHadAvailablePlayback(false);
          setCurrentStream(payload.stream);
          setHlsHealth("idle");

          trackEvent({
            eventName: "stream_interaction",
            metadata: {
              action: "stream_status_poll_change_detected",
              component: "public_stream_player",
              locale,
              previous_signature: previousSignature,
              next_signature: nextSignature,
              next_status: payload.stream?.status ?? null,
              next_provider: payload.stream?.provider ?? null,
            },
          });
        }
      } catch (error) {
        console.error("Error consultando estado público del stream:", error);
      }
    }

    const interval = window.setInterval(
      () => void pollStreamStatus(),
      STREAM_STATUS_POLL_MS
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [locale]);

  const status = currentStream?.status ?? "offline";
  const isSelfHostedHls = currentStream?.provider === "self_hosted_hls";
  const hasHlsSource =
    isSelfHostedHls && isPlaybackStatus(status) && Boolean(currentStream?.source_url);
  const hasFallbackEmbed = Boolean(currentStream?.embed_url);
  const hasExternalEmbed =
    !isSelfHostedHls && isPlaybackStatus(status) && Boolean(currentStream?.embed_url);

  useEffect(() => {
    if (!hasHlsSource || !currentStream?.source_url) {
      hlsWasAvailableRef.current = false;
      hlsUnavailableSinceRef.current = null;
      return;
    }

    let cancelled = false;
    let activeController: AbortController | null = null;
    let activeTimeout: number | null = null;

    async function runHealthCheck(reason: string) {
      if (!currentStream?.source_url || cancelled) {
        return;
      }

      setHlsHealth((previous) => {
        if (previous === "unavailable" && !hlsWasAvailableRef.current) {
          return previous;
        }

        return previous === "available" ? previous : "checking";
      });

      const controller = new AbortController();
      activeController = controller;
      activeTimeout = window.setTimeout(
        () => controller.abort(),
        HLS_HEALTH_TIMEOUT_MS
      );

      try {
        const available = await checkHlsManifest(currentStream.source_url, controller.signal);

        if (!cancelled) {
          applyHlsHealthResult(available, {
            reason,
            source_url: currentStream.source_url,
          });
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        if (!controller.signal.aborted) {
          console.error("Error verificando HLS público:", error);
        }

        applyHlsHealthResult(false, {
          reason: controller.signal.aborted ? "timeout_or_abort" : "fetch_error",
          source_url: currentStream.source_url,
        });
      } finally {
        if (activeTimeout) {
          window.clearTimeout(activeTimeout);
          activeTimeout = null;
        }
      }
    }

    void runHealthCheck("initial_or_source_change");

    const interval = window.setInterval(
      () => void runHealthCheck("scheduled_poll"),
      STREAM_STATUS_POLL_MS
    );

    return () => {
      cancelled = true;
      if (activeTimeout) {
        window.clearTimeout(activeTimeout);
      }
      activeController?.abort();
      window.clearInterval(interval);
    };
  }, [applyHlsHealthResult, currentStream?.source_url, hasHlsSource]);

  const shouldShowHls =
    hasHlsSource &&
    (hlsHealth === "idle" ||
      hlsHealth === "available" ||
      (hlsHealth === "checking" && hlsHadAvailablePlayback));
  const shouldShowFallbackEmbed = !shouldShowHls && (hasExternalEmbed || hasFallbackEmbed);

  const fallbackNotice = useMemo(() => {
    if (!isSelfHostedHls || !hasFallbackEmbed) return null;

    if (hlsHealth === "checking") {
      return copy.hlsChecking;
    }

    if (hlsHealth === "unavailable" && isPlaybackStatus(status)) {
      return copy.hlsUnavailable;
    }

    return copy.fallbackDescription;
  }, [copy.fallbackDescription, copy.hlsChecking, copy.hlsUnavailable, hasFallbackEmbed, hlsHealth, isSelfHostedHls, status]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
          {copy.sectionTitle}
        </p>
      </div>

      <div className="bg-black">
        {shouldShowHls ? (
          <HlsStreamPlayer
            sourceUrl={currentStream?.source_url ?? ""}
            fallbackEmbedUrl={currentStream?.embed_url}
            title={currentStream?.title || "80's Forever"}
            onStreamUnavailable={handleHlsPlayerUnavailable}
          />
        ) : shouldShowFallbackEmbed ? (
          <div className="relative aspect-video bg-black">
            {fallbackNotice ? (
              <div className="absolute left-4 right-4 top-4 z-10 rounded-2xl border border-cyan-400/25 bg-black/80 px-4 py-3 text-sm text-zinc-200 shadow-[0_0_26px_rgba(34,211,238,0.14)] backdrop-blur">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200 [font-family:var(--font-orbitron)]">
                      {copy.fallbackBadge}
                    </p>
                    <p className="mt-1 font-medium text-white">{copy.fallbackTitle}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-300">{fallbackNotice}</p>
                  </div>
                  <div className="hidden rounded-full border border-cyan-400/30 bg-cyan-400/10 p-3 sm:block">
                    <Radio className="h-5 w-5 text-cyan-200" />
                  </div>
                </div>
              </div>
            ) : null}
            <iframe
              key={currentStream?.embed_url ?? "fallback-embed"}
              title={currentStream?.title || "80's Forever"}
              src={currentStream?.embed_url ?? ""}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <PublicStreamPlaceholder
            status={status}
            title={currentStream?.title}
            subtitle={currentStream?.subtitle}
            offlineMessage={currentStream?.offline_message}
            nextLiveAt={currentStream?.next_live_at}
          />
        )}
      </div>
    </section>
  );
}
