import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { ContactMessageForm } from "@/components/forms/contact-message-form";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12 md:px-8">
        <div className="border-b border-white/10 pb-8 text-center">
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300 transition hover:bg-fuchsia-500/15"
            >
              Volver al inicio
            </Link>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500 [font-family:var(--font-orbitron)]">
            {siteConfig.name}
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-fuchsia-300">
            <MessagesSquare className="h-4 w-4" />
            Contacto e interacción institucional
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Contacto
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
            Escribinos para consultas generales, propuestas comerciales,
            sponsors, alianzas o si querés formar parte del proyecto 80&apos;s
            Forever.
          </p>
        </div>

        <div className="mt-10">
          <ContactMessageForm />
        </div>
      </div>
    </main>
  );
}