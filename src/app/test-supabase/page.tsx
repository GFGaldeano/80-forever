import { createClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Test Supabase</h1>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p>
            <strong>User:</strong> {user?.email ?? "No autenticado"}
          </p>
          <p className="mt-2">
            <strong>Error:</strong> {error?.message ?? "Sin errores"}
          </p>
        </div>
      </div>
    </main>
  );
}