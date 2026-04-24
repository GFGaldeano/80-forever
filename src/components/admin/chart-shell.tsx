"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type ChartShellRenderProps = {
  width: number;
  height: number;
};

type ChartShellProps = {
  children: (props: ChartShellRenderProps) => ReactNode;
  height?: number;
  emptyMessage?: string;
};

export function ChartShell({
  children,
  height = 340,
  emptyMessage = "Cargando gráfico...",
}: Readonly<ChartShellProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      const nextWidth = element.getBoundingClientRect().width;
      if (nextWidth > 0) {
        setWidth(Math.floor(nextWidth));
      }
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0"
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      {width > 0 ? (
        children({ width, height })
      ) : (
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 text-center text-sm text-zinc-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}