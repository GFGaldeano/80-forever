"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  songRequestSchema,
  type SongRequestInput,
} from "@/lib/validators/song-requests";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: SongRequestInput = {
  nameAlias: "",
  songTitle: "",
  artistName: "",
  message: "",
  socialHandle: "",
};

export function SongRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<SongRequestInput>(initialState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setField =
    <K extends keyof SongRequestInput>(field: K) =>
    (value: SongRequestInput[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = songRequestSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Revisá los datos ingresados."
      );
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.from("song_requests").insert({
        name_alias: parsed.data.nameAlias,
        song_title: parsed.data.songTitle,
        artist_name: parsed.data.artistName,
        message: parsed.data.message?.trim() || null,
        social_handle: parsed.data.socialHandle?.trim() || null,
        status: "new",
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        "Tu pedido fue enviado correctamente. ¡Gracias por participar!"
      );
      setForm(initialState);
      setIsSubmitted(true);
    });
  };

  if (isSubmitted) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">¡Pedido enviado!</CardTitle>
          <CardDescription className="text-zinc-400">
            Tu canción quedó registrada correctamente dentro del sistema de
            80&apos;s Forever.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
            {successMessage}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Volver al inicio
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setSuccessMessage("");
                setErrorMessage("");
                setForm(initialState);
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-black/50 px-5 text-sm font-medium text-white transition hover:bg-white/[0.04]"
            >
              Enviar otro pedido
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Pedí tu tema</CardTitle>
        <CardDescription className="text-zinc-400">
          Dejanos tu canción, artista o dedicatoria para futuras emisiones de
          80&apos;s Forever.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nameAlias">Nombre o alias</Label>
              <Input
                id="nameAlias"
                value={form.nameAlias}
                onChange={(e) => setField("nameAlias")(e.target.value)}
                placeholder="Ej. Gustavo / DJ Retro"
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialHandle">Red social (opcional)</Label>
              <Input
                id="socialHandle"
                value={form.socialHandle}
                onChange={(e) => setField("socialHandle")(e.target.value)}
                placeholder="@usuario"
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="songTitle">Tema</Label>
              <Input
                id="songTitle"
                value={form.songTitle}
                onChange={(e) => setField("songTitle")(e.target.value)}
                placeholder="Ej. Take On Me"
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistName">Artista</Label>
              <Input
                id="artistName"
                value={form.artistName}
                onChange={(e) => setField("artistName")(e.target.value)}
                placeholder="Ej. A-ha"
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje o dedicatoria (opcional)</Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => setField("message")(e.target.value)}
              placeholder="Contanos por qué querés escuchar este tema..."
              className="min-h-[120px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-zinc-400">
            Tu pedido no garantiza salida inmediata al aire. Se revisará dentro
            de la programación editorial del canal.
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
            type="submit"
            disabled={isPending}
            className="h-12 rounded-xl bg-white text-black hover:bg-zinc-200"
          >
            <Send className="mr-2 h-4 w-4" />
            {isPending ? "Enviando..." : "Enviar pedido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}