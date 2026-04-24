"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { AnalyticsEventName } from "@/lib/validators/analytics";
import { trackEvent } from "@/lib/analytics/track-event";

type Primitive = string | number | boolean | null;

type TrackedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  eventName?: AnalyticsEventName;
  eventAction?: string;
  eventLabel?: string;
  eventMetadata?: Record<string, Primitive | undefined>;
};

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function TrackedLink({
  href,
  children,
  className,
  target,
  rel,
  prefetch,
  eventName = "cta_click",
  eventAction,
  eventLabel,
  eventMetadata,
}: Readonly<TrackedLinkProps>) {
  const pathname = usePathname();
  const external = isExternalHref(href) || target === "_blank";

  const handleClick = () =>  {
    trackEvent({
      eventName,
      pagePath: pathname || window.location.pathname,
      pageTitle: document.title,
      metadata: {
        action: eventAction || null,
        label: eventLabel || null,
        href,
        ...eventMetadata,
      },
    });
  };

  if (external) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={className}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}