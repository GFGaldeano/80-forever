"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { PublicSponsorAsset } from "@/lib/sponsors/get-public-sponsor-assets";
import { useLocale } from "@/i18n/locale-context";
import { PublicSponsorBannerCard } from "@/components/sponsors/public-sponsor-banner-card";

type PublicSponsorCarouselProps = {
  assets: PublicSponsorAsset[];
  title: string;
};

function getDurationMs(value?: number) {
  if (!value || Number.isNaN(value)) return 8000;
  return Math.min(Math.max(value, 1), 60) * 1000;
}

export function PublicSponsorCarousel({
  assets,
  title,
}: Readonly<PublicSponsorCarouselProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const locale = useLocale();

  const safeAssets = useMemo(
    () => assets.filter((asset) => asset.asset_url),
    [assets]
  );

  const normalizedActiveIndex =
    safeAssets.length === 0 ? 0 : activeIndex % safeAssets.length;

  const currentAsset = safeAssets[normalizedActiveIndex];

  useEffect(() => {
    if (safeAssets.length <= 1 || isPaused || !currentAsset) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % safeAssets.length);
    }, getDurationMs(currentAsset.duration_seconds));

    return () => window.clearTimeout(timeout);
  }, [
    currentAsset,
    currentAsset?.duration_seconds,
    isPaused,
    safeAssets.length,
  ]);

  if (!safeAssets.length || !currentAsset) return null;

  return (
    <section
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
          {title}
        </p>

        {safeAssets.length > 1 ? (
          <div className="flex items-center gap-2">
            {safeAssets.map((asset, index) => {
              const isActive = index === normalizedActiveIndex;
              const ariaLabel =
                locale === "en"
                  ? `Go to sponsor ${index + 1}`
                  : `Ir al sponsor ${index + 1}`;

              return (
                <button
                  key={asset.id}
                  type="button"
                  aria-label={ariaLabel}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition ${
                    isActive
                      ? "w-8 bg-cyan-300"
                      : "w-2.5 bg-white/20 hover:bg-white/35"
                  }`}
                />
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAsset.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <PublicSponsorBannerCard asset={currentAsset} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}