import Link from "next/link";
import { Filter, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TransmissionsFiltersProps = {
  initialQuery: string;
  initialStatus: string;
  initialVisible: string;
};

export function TransmissionsFilters({
  initialQuery,
  initialStatus,
  initialVisible,
}: Readonly<TransmissionsFiltersProps>) {
  return (
    <form
      method="get"
      className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 text-white"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">
          <Filter className="h-4 w-4" />
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Filtros</h3>
          <p className="text-xs text-zinc-500">
            Buscá y refiná transmisiones por estado o visibilidad.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="q">Buscar</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="q"
              name="q"
              defaultValue={initialQuery}
              placeholder="Título, episodio, slug o descripción..."
              className="h-12 rounded-xl border-white/10 bg-black/60 pl-10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue={initialStatus}
            className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
          >
            <option value="all" className="bg-zinc-950">
              Todos
            </option>
            <option value="draft" className="bg-zinc-950">
              Borrador
            </option>
            <option value="scheduled" className="bg-zinc-950">
              Programada
            </option>
            <option value="aired" className="bg-zinc-950">
              Emitida
            </option>
            <option value="archived" className="bg-zinc-950">
              Archivada
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visible">Visibilidad</Label>
          <select
            id="visible"
            name="visible"
            defaultValue={initialVisible}
            className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
          >
            <option value="all" className="bg-zinc-950">
              Todas
            </option>
            <option value="visible" className="bg-zinc-950">
              Visibles
            </option>
            <option value="hidden" className="bg-zinc-950">
              Ocultas
            </option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Button
            type="submit"
            className="h-12 rounded-xl bg-white text-black hover:bg-zinc-200"
          >
            Aplicar
          </Button>

          <Button
            asChild
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
          >
            <Link href="/admin/transmissions">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}