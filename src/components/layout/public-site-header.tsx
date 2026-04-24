"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Radio } from "lucide-react";

import { siteConfig } from "@/lib/config/site";

const navItems = [
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

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicSiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]">
              <Radio className="h-5 w-5" />
            </div>

            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 [font-family:var(--font-orbitron)]">
                80&apos;s Forever
              </p>
              <p className="text-sm font-medium text-white">
                {siteConfig.slogan}
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex rounded-xl px-4 py-2 text-sm transition ${
                    active
                      ? "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]"
                      : "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

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
    </header>
  );
}