"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/analytics/track-event";

const LAST_PAGE_VIEW_KEY = "80f:last-page-view";
const DEDUPE_WINDOW_MS = 1500;

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams.toString();
    const pageKey = `${pathname}${queryString ? `?${queryString}` : ""}`;
    const now = Date.now();

    try {
      const raw = sessionStorage.getItem(LAST_PAGE_VIEW_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as { key: string; ts: number };

        if (parsed.key === pageKey && now - parsed.ts < DEDUPE_WINDOW_MS) {
          return;
        }
      }

      sessionStorage.setItem(
        LAST_PAGE_VIEW_KEY,
        JSON.stringify({
          key: pageKey,
          ts: now,
        })
      );
    } catch {
      // ignore
    }

    trackEvent({
      eventName: "page_view",
      pagePath: pathname,
      pageTitle: document.title,
      metadata: {
        query: queryString || null,
      },
    });
  }, [pathname, searchParams]);

  return null;
}