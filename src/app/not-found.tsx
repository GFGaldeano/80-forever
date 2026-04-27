"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";

function getLocaleFromPath(pathname: string | null): Locale {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];
  return firstSegment && isValidLocale(firstSegment) ? firstSegment : defaultLocale;
}

function getLocalizedPublicHref(locale: Locale, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export default function NotFound() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  const copy =
    locale === "en"
      ? {
          title: "Page not found",
          description:
            "The route you tried to access does not exist, was moved or is not available yet. Go back home or keep exploring the public channel content.",
          backHome: "Back to home",
          viewTransmissions: "View transmissions",
        }
      : {
          title: "Página no encontrada",
          description:
            "La ruta que buscaste no existe, fue movida o todavía no está disponible. Volvé al inicio o seguí explorando el contenido público del canal.",
          backHome: "Volver al inicio",
          viewTransmissions: "Ver transmisiones",
        };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center md:px-8">
        <div className="inline-flex rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4 text-fuchsia-300 shadow-[0_0_28px_rgba(217,70,239,0.18)]">
          <Compass className="h-8 w-8" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
          80&apos;s Forever
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          {copy.title}
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
          {copy.description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-white text-black hover:bg-zinc-200">
            <Link href={getLocalizedPublicHref(locale, "/")}>
              <Home className="mr-2 h-4 w-4" />
              {copy.backHome}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200"
          >
            <Link href={getLocalizedPublicHref(locale, "/transmisiones")}>
              <Radio className="mr-2 h-4 w-4" />
              {copy.viewTransmissions}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}