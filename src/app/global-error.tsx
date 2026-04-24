"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center md:px-8">
          <div className="inline-flex rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 shadow-[0_0_28px_rgba(239,68,68,0.18)]">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Ocurrió un error inesperado
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            La aplicación encontró un problema inesperado. Podés reintentar esta
            acción o volver al inicio.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              onClick={reset}
              className="bg-white text-black hover:bg-zinc-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>

          {error?.digest ? (
            <p className="mt-6 text-xs text-zinc-600">Error ID: {error.digest}</p>
          ) : null}
        </div>
      </body>
    </html>
  );
}