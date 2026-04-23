"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { contactMessageStatuses } from "@/lib/validators/contact-messages";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ContactMessageStatusFormProps = {
  messageId: string;
  initialStatus: "new" | "read" | "archived";
  initialNotes: string | null;
};

export function ContactMessageStatusForm({
  messageId,
  initialStatus,
  initialNotes,
}: Readonly<ContactMessageStatusFormProps>) {
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

      const { error } = await supabase
        .from("contact_messages")
        .update({
          status,
          admin_notes: notes.trim() || null,
        })
        .eq("id", messageId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Mensaje actualizado.");
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
          {contactMessageStatuses.map((item) => (
            <option key={item} value={item} className="bg-zinc-950">
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200">Notas internas</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas internas sobre este contacto..."
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