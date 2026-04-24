import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/config/site";

const footerLinks = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Pedí tu tema",
    href: "/pedi-tu-tema",
  },
  {
    label: "Contacto",
    href: "/contacto",
  },
];

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 [font-family:var(--font-orbitron)]">
              {siteConfig.name}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {siteConfig.slogan}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              Canal temático de streaming musical con identidad retro-premium,
              contenido editorial, participación de la audiencia y comunidad
              activa alrededor del universo 80&apos;s.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-white">Explorar</p>

            <div className="flex flex-wrap gap-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white transition hover:bg-white/[0.04]"
                >
                  {item.label}
                </Link>
              ))}

              <a
                href={siteConfig.whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:bg-green-500/15"
              >
                <MessageCircle className="h-4 w-4" />
                Comunidad
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.</p>
          <p>Diseñado para música, comunidad y experiencia editorial.</p>
        </div>
      </div>
    </footer>
  );
}