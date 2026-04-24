import type { ReactNode } from "react";

import { PublicSiteFooter } from "@/components/layout/public-site-footer";
import { PublicSiteHeader } from "@/components/layout/public-site-header";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: Readonly<PublicShellProps>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        <PublicSiteHeader />
        <main className="flex-1">{children}</main>
        <PublicSiteFooter />
      </div>
    </div>
  );
}