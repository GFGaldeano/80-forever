import Image from "next/image";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { siteConfig } from "@/lib/config/site";

export default async function AdminLoginPage() {
  const { admin } = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-16 left-1/4 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="rounded-2xl bg-[#000000] px-2 py-2">
            <Image
              src={siteConfig.logoSquareUrl}
              alt={siteConfig.name}
              width={208}
              height={208}
              priority
              className="h-auto w-44 select-none md:w-52"
            />
          </div>

          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
