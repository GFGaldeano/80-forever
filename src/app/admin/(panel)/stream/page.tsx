import { Radio } from "lucide-react";

import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAdminStreamConfig } from "@/lib/stream/get-admin-stream-config";
import { StreamConfigForm } from "@/components/admin/stream-config-form";

export default async function AdminStreamPage() {
  const { admin } = await getCurrentAdmin();
  const initialConfig = await getAdminStreamConfig();

  if (!admin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <Radio className="h-7 w-7 text-cyan-300" />
            Gestión de transmisión
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Configurá la fuente principal del canal, el estado del stream y la
            metadata que se mostrará en la home pública.
          </p>
        </div>
      </div>

      <StreamConfigForm initialConfig={initialConfig} adminId={admin.id} />
    </div>
  );
}