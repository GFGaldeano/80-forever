"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();

      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className="h-10 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Saliendo..." : "Salir"}
    </Button>
  );
}