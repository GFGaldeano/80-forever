"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  contactMessageSchema,
  contactMessageTypes,
  type ContactMessageInput,
} from "@/lib/validators/contact-messages";
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

const initialState: ContactMessageInput = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  message: "",
  messageType: "general",
};

function getLocalizedPublicHref(locale: string, path: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export function ContactMessageForm() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ContactMessageInput>(initialState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const locale = useLocale();
  const dictionary = useDictionary();

  const setField =
    <K extends keyof ContactMessageInput>(field: K) =>
    (value: ContactMessageInput[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = contactMessageSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(dictionary.contactForm.invalidData);
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        business_name: parsed.data.businessName?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        message: parsed.data.message,
        message_type: parsed.data.messageType,
        status: "new",
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(dictionary.contactForm.success);
      setForm(initialState);
      setIsSubmitted(true);
    });
  };

  if (isSubmitted) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">
            {dictionary.contactForm.submittedTitle}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {dictionary.contactForm.submittedDescription}
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
              {dictionary.contactPage.backHome}
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
              {dictionary.contactForm.sendAnother}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">{dictionary.contactForm.title}</CardTitle>
        <CardDescription className="text-zinc-400">
          {dictionary.contactForm.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{dictionary.contactForm.name}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setField("name")(e.target.value)}
                placeholder={dictionary.contactForm.namePlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">
                {dictionary.contactForm.businessName}
              </Label>
              <Input
                id="businessName"
                value={form.businessName}
                onChange={(e) => setField("businessName")(e.target.value)}
                placeholder={dictionary.contactForm.businessNamePlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{dictionary.contactForm.email}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email")(e.target.value)}
                placeholder={dictionary.contactForm.emailPlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{dictionary.contactForm.phone}</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setField("phone")(e.target.value)}
                placeholder={dictionary.contactForm.phonePlaceholder}
                className="h-12 rounded-xl border-white/10 bg-black/60 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageType">{dictionary.contactForm.messageType}</Label>
            <select
              id="messageType"
              value={form.messageType}
              onChange={(e) =>
                setField("messageType")(
                  e.target.value as ContactMessageInput["messageType"]
                )
              }
              className="flex h-12 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition focus:border-cyan-500/50"
            >
              {contactMessageTypes.map((type) => (
                <option key={type} value={type} className="bg-zinc-950">
                  {dictionary.contactForm.messageTypeOptions[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{dictionary.contactForm.message}</Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => setField("message")(e.target.value)}
              placeholder={dictionary.contactForm.messagePlaceholder}
              className="min-h-[140px] rounded-2xl border-white/10 bg-black/60 text-white"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-zinc-400">
            {dictionary.contactForm.helper}
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
              ? dictionary.contactForm.submitting
              : dictionary.contactForm.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}