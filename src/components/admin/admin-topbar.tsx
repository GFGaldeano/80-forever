"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminSidebarMobile } from "@/components/admin/admin-sidebar";

type AdminIdentity = {
  full_name: string | null;
  email: string;
  role: string;
};

type AdminTopbarProps = {
  admin: AdminIdentity;
};

function getPageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/stream")) return "Transmisión";
  if (pathname.startsWith("/admin/sponsors")) return "Sponsors";
  if (pathname.startsWith("/admin/assets")) return "Assets";
  if (pathname.startsWith("/admin/requests")) return "Pedidos";
  if (pathname.startsWith("/admin/blog")) return "Blog";
  if (pathname.startsWith("/admin/settings")) return "Configuración";

  return "Panel";
}

export function AdminTopbar({ admin }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-80 border-white/10 bg-black p-0 text-white"
              >
                <AdminSidebarMobile admin={admin} />
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
              Panel de administración
            </p>
            <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
          </div>
        </div>

        <AdminLogoutButton />
      </div>
    </header>
  );
}