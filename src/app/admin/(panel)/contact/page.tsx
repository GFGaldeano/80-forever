import { MessagesSquare } from "lucide-react";

import { ContactMessagesTable } from "@/components/admin/contact-messages-table";
import { getAdminContactMessages } from "@/lib/contact-messages/get-admin-contact-messages";

export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage() {
  const messages = await getAdminContactMessages();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 [font-family:var(--font-orbitron)]">
            80&apos;s Forever
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            <MessagesSquare className="h-7 w-7 text-cyan-300" />
            Contacto
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Revisá, clasificá y gestioná los mensajes institucionales,
            comerciales y de potenciales sponsors enviados desde la web.
          </p>
        </div>
      </div>

      <ContactMessagesTable messages={messages} />
    </div>
  );
}