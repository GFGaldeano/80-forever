"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  songRequestSchema,
  type SongRequestInput,
} from "@/lib/validators/song-requests";
import { useDictionary, useLocale } from "@/i18n/locale-context";

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

function getLocalizedPublicHref(locale: string, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export function SongRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<SongRequestInput>(initialState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const locale = useLocale();
  const dictionary = useDictionary();

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
      setErrorMessage(dictionary.songRequestForm.invalidData);
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

      setSuccessMessage(dictionary.songRequestForm.success);
      setForm(initialState);
      setIsSubmitted(true);
    });
  };

  if (isSubmitted) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">
            {dictionary.songRequestForm.submittedTitle}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {dictionary.songRequestForm.submittedDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
            {successMessage}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={getLocalizedPublicHref(locale, "/")}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              {dictionary.songRequestPage.backHome}
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
              {dictionary.songRequestForm.sendAnother}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">
          {dictionary.songRequestForm.title}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {dictionary.songRequestForm.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nameAlias">
                {dictionary.songRequestForm.nameAlias}
              </Label>
              <Input
                id="nameAlias"
                value={form.nameAlias}
                onChange={(e) => setField("nameAlias")(e.target.value)}
                placeholder={dictionary.songRequestForm.nameAliasPlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialHandle">
                {dictionary.songRequestForm.socialHandle}
              </Label>
              <Input
                id="socialHandle"
                value={form.socialHandle}
                onChange={(e) => setField("socialHandle")(e.target.value)}
                placeholder={dictionary.songRequestForm.socialHandlePlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="songTitle">
                {dictionary.songRequestForm.songTitle}
              </Label>
              <Input
                id="songTitle"
                value={form.songTitle}
                onChange={(e) => setField("songTitle")(e.target.value)}
                placeholder={dictionary.songRequestForm.songTitlePlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistName">
                {dictionary.songRequestForm.artistName}
              </Label>
              <Input
                id="artistName"
                value={form.artistName}
                onChange={(e) => setField("artistName")(e.target.value)}
                placeholder={dictionary.songRequestForm.artistNamePlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{dictionary.songRequestForm.message}</Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => setField("message")(e.target.value)}
              placeholder={dictionary.songRequestForm.messagePlaceholder}
              className="min-h-[120px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-zinc-400">
            {dictionary.songRequestForm.helper}
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
            {isPending
              ? dictionary.songRequestForm.submitting
              : dictionary.songRequestForm.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}