import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCurrentAdmin } from "@/lib/auth/get-current-admin";

export default async function AdminDashboardPage() {
  const { user, admin } = await getCurrentAdmin();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Bienvenido, {admin?.full_name ?? "Administrador"}
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Ya tenés el acceso base funcionando. El próximo paso es empezar a
            construir el dashboard real, la gestión de transmisión y el módulo
            de sponsors.
          </p>
        </div>

        <Badge className="w-fit border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-300">
          {admin?.role}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base">Sesión</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            <p className="text-zinc-500">Usuario autenticado</p>
            <p className="mt-2 break-all">{user?.email}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            <p className="text-zinc-500">Acceso admin</p>
            <p className="mt-2 text-emerald-300">Activo</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base">Módulo siguiente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            <p className="text-zinc-500">Prioridad actual</p>
            <p className="mt-2">Gestión de transmisión</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base">Estado del MVP</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            <p className="text-zinc-500">Base admin</p>
            <p className="mt-2">Operativa</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Próximo objetivo de implementación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          <p>
            Vamos a construir el módulo de <span className="text-white">Transmisión</span>{" "}
            para que el panel pueda:
          </p>

          <ul className="list-disc space-y-2 pl-5 text-zinc-400">
            <li>definir el provider del stream</li>
            <li>guardar la URL de origen y embed</li>
            <li>cambiar el estado del canal</li>
            <li>mostrar una vista previa básica</li>
            <li>hacer que la home consuma configuración real</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}