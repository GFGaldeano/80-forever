"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Megaphone,
  Image as ImageIcon,
  Music2,
  FileText,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AdminIdentity = {
  full_name: string | null;
  email: string;
  role: string;
};

type AdminSidebarProps = {
  admin: AdminIdentity;
};

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    title: "Transmisión",
    href: "/admin/stream",
    icon: Radio,
    enabled: true,
  },
  {
    title: "Sponsors",
    href: "/admin/sponsors",
    icon: Megaphone,
    enabled: false,
  },
  {
    title: "Assets",
    href: "/admin/assets",
    icon: ImageIcon,
    enabled: false,
  },
  {
    title: "Pedidos",
    href: "/admin/requests",
    icon: Music2,
    enabled: false,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
    enabled: false,
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings,
    enabled: false,
  },
];

function SidebarNavContent({ admin }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
          80&apos;s Forever
        </p>

        <h2 className="mt-3 text-xl font-semibold text-white">Admin Panel</h2>

        <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">
            {admin.full_name ?? "Administrador"}
          </p>
          <p className="truncate text-xs text-zinc-400">{admin.email}</p>

          <Badge className="mt-2 w-fit border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
            {admin.role}
          </Badge>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (!item.enabled) {
            return (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-3 text-sm text-zinc-500"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                isActive
                  ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                  : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  return (
    <aside className="hidden border-r border-white/10 bg-zinc-950/80 lg:block">
      <SidebarNavContent admin={admin} />
    </aside>
  );
}

export function AdminSidebarMobile({ admin }: AdminSidebarProps) {
  return <SidebarNavContent admin={admin} />;
}