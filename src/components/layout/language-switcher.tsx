"use client";

import { useMemo } from "react";
import { Languages } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { isValidLocale, locales, type Locale } from "@/i18n/config";
import { useDictionary, useLocale } from "@/i18n/locale-context";

function buildLocalizedPath(pathname: string, targetLocale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isValidLocale(segments[0])) {
    segments[0] = targetLocale;
    return `/${segments.join("/")}`;
  }

  return `/${targetLocale}${pathname === "/" ? "" : pathname}`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const dictionary = useDictionary();

  const search = useMemo(() => {
    const value = searchParams.toString();
    return value ? `?${value}` : "";
  }, [searchParams]);

  const handleChangeLocale = (targetLocale: Locale) => {
    if (targetLocale === locale) return;

    const nextPath = `${buildLocalizedPath(pathname, targetLocale)}${search}`;
    router.push(nextPath);
    router.refresh();
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-zinc-300">
      <Languages className="h-4 w-4 text-cyan-300" />

      <span className="hidden text-zinc-500 sm:inline">
        {dictionary.common.language}
      </span>

      <div className="inline-flex overflow-hidden rounded-lg border border-white/10">
        {locales.map((item) => {
          const isActive = item === locale;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleChangeLocale(item)}
              className={`px-3 py-1.5 transition ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "bg-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
              aria-pressed={isActive}
            >
              {item.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}