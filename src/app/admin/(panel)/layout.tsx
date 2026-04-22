import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, admin } = await getCurrentAdmin();

  if (!user || !admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar admin={admin} />

        <div className="flex min-h-screen flex-col">
          <AdminTopbar admin={admin} />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}