"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adminLoginSchema } from "@/lib/validators/auth";

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

type FormValues = {
  email: string;
  password: string;
};

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormValues>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleChange =
    (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const parsed = adminLoginSchema.safeParse(form);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message;
      setErrorMessage(firstError ?? "Revisá los datos ingresados.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error || !data.user) {
        setErrorMessage("Credenciales inválidas o acceso no autorizado.");
        return;
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("admin_users")
        .select("id, role, is_active")
        .eq("auth_user_id", data.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError || !adminProfile) {
        await supabase.auth.signOut();
        setErrorMessage(
          "Tu usuario existe, pero no tiene permisos de administrador activos.",
        );
        return;
      }

      setSuccessMessage("Acceso correcto. Redirigiendo al panel...");

      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <Card className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/85 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <CardHeader className="space-y-3 pb-4 text-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            Panel de administración
          </p>

          <CardTitle className="text-3xl font-semibold tracking-tight text-white">
            Iniciar sesión
          </CardTitle>
        </div>

        <CardDescription className="text-sm text-zinc-400">
          Accedé al panel de administración de 80&apos;s Forever
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-zinc-200"
            >
              Usuario / email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="gustavo_galdeano@yahoo.com.ar"
              value={form.email}
              onChange={handleChange("email")}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-fuchsia-500/60"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-zinc-200"
            >
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange("password")}
              className="h-12 rounded-xl border-white/10 bg-black/60 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-cyan-500/60"
              autoComplete="current-password"
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
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-xl bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
