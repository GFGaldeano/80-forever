"use client";

import type { AnalyticsEventName } from "@/lib/validators/analytics";

type Primitive = string | number | boolean | null;

type TrackEventInput = {
  eventName: AnalyticsEventName;
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  metadata?: Record<string, Primitive | undefined>;
};

const VISITOR_ID_KEY = "80f:visitor-id";
const SESSION_ID_KEY = "80f:session-id";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `80f-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateStorageId(
  storage: Storage,
  key: string
) {
  const existing = storage.getItem(key);

  if (existing) {
    return existing;
  }

  const nextValue = generateId();
  storage.setItem(key, nextValue);
  return nextValue;
}

function sanitizeMetadata(
  metadata?: Record<string, Primitive | undefined>
): Record<string, Primitive> {
  if (!metadata) return {};

  return Object.entries(metadata).reduce<Record<string, Primitive>>(
    (accumulator, [key, value]) => {
      if (value === undefined) {
        return accumulator;
      }

      accumulator[key] = value;
      return accumulator;
    },
    {}
  );
}

export function trackEvent({
  eventName,
  pagePath,
  pageTitle,
  referrer,
  metadata,
}: TrackEventInput) {
  if (typeof window === "undefined") return;

  try {
    const visitorId = getOrCreateStorageId(localStorage, VISITOR_ID_KEY);
    const sessionId = getOrCreateStorageId(sessionStorage, SESSION_ID_KEY);

    const payload = {
      eventName,
      pagePath: pagePath || window.location.pathname,
      pageTitle: pageTitle || document.title || "",
      referrer: referrer || document.referrer || "",
      visitorId,
      sessionId,
      metadata: sanitizeMetadata(metadata),
    };

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/track", blob);

      if (sent) {
        return;
      }
    }

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.error("Error enviando evento analytics:", error);
  }
}