"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type DeleteTransmissionButtonProps = {
  transmissionId: string;
  transmissionTitle: string;
};

export function DeleteTransmissionButton({
  transmissionId,
  transmissionTitle,
}: Readonly<DeleteTransmissionButtonProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = () => {
    const confirmed = window.confirm(
      `¿Querés eliminar la transmisión "${transmissionTitle}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setErrorMessage("");

    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("transmissions")
        .delete()
        .eq("id", transmissionId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/admin/transmissions");
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleDelete}
        className="border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isPending ? "Eliminando..." : "Eliminar"}
      </Button>

      {errorMessage ? (
        <div className="max-w-[240px] rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}