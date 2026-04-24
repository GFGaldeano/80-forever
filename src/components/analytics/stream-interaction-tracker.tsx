"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/analytics/track-event";

type StreamStatus = "live" | "offline" | "upcoming" | "replay";

type StreamInteractionTrackerProps = {
  streamStatus: StreamStatus;
  streamTitle?: string | null;
  children: ReactNode;
};

function getViewKey(pathname: string, streamStatus: StreamStatus, streamTitle?: string | null) {
  return `80f:stream-view:${pathname}:${streamStatus}:${streamTitle ?? "untitled"}`;
}

export function StreamInteractionTracker({
  streamStatus,
  streamTitle,
  children,
}: Readonly<StreamInteractionTrackerProps>) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastClickAtRef = useRef(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const safePath = pathname || window.location.pathname;
    const storageKey = getViewKey(safePath, streamStatus, streamTitle);

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (!isVisible) return;

        try {
          const alreadyTracked = sessionStorage.getItem(storageKey);

          if (alreadyTracked) {
            observer.disconnect();
            return;
          }

          sessionStorage.setItem(storageKey, "1");
        } catch {
          // ignore storage issues
        }

        trackEvent({
          eventName: "stream_interaction",
          pagePath: safePath,
          pageTitle: document.title,
          metadata: {
            action: "stream_block_view",
            status: streamStatus,
            title: streamTitle ?? null,
            is_live: streamStatus === "live",
            location: "home_stream_section",
          },
        });

        observer.disconnect();
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [pathname, streamStatus, streamTitle]);

  const handleClickCapture = () => {
    const now = Date.now();

    if (now - lastClickAtRef.current < 1500) {
      return;
    }

    lastClickAtRef.current = now;

    trackEvent({
      eventName: "stream_interaction",
      pagePath: pathname || window.location.pathname,
      pageTitle: document.title,
      metadata: {
        action: "stream_block_click",
        status: streamStatus,
        title: streamTitle ?? null,
        is_live: streamStatus === "live",
        location: "home_stream_section",
      },
    });
  };

  return (
    <div ref={containerRef} onClickCapture={handleClickCapture}>
      {children}
    </div>
  );
}