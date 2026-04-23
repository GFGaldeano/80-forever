"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { songRequestStatuses } from "@/lib/validators/song-requests";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SongRequestStatusFormProps = {
  requestId: string;
  initialStatus: "new" | "read" | "highlighted" | "approved" | "archived";
  initialNotes: string | null;
};

export function SongRequestStatusForm({
  requestId,
  initialStatus,
  initialNotes,
}: Readonly<SongRequestStatusFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSave = () => {
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("No se pudo validar la sesión del administrador.");
        return;
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError || !adminProfile) {
        setErrorMessage(
          "No se encontró un perfil administrativo activo para esta sesión."
        );
        return;
      }

      const { error } = await supabase
        .from("song_requests")
        .update({
          status,
          admin_notes: notes.trim() || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminProfile.id,
        })
        .eq("id", requestId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Pedido actualizado.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200">Estado</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof initialStatus)}
          className="flex h-11 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
        >
          {songRequestStatuses.map((item) => (
            <option key={item} value={item} className="bg-zinc-950">
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200">
          Notas internas
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas internas de revisión editorial..."
          className="min-h-[110px] rounded-2xl border-white/10 bg-black/60 text-white"
        />
      </div>

      <div className="min-h-11">
        {errorMessage ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}

        {!errorMessage && successMessage ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="h-11 rounded-xl bg-white text-black hover:bg-zinc-200"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}