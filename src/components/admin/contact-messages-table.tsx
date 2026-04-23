import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminContactMessage } from "@/lib/contact-messages/get-admin-contact-messages";
import {
  contactMessageStatusMeta,
  contactMessageTypeMeta,
} from "@/lib/validators/contact-messages";
import { ContactMessageStatusForm } from "@/components/admin/contact-message-status-form";

type ContactMessagesTableProps = {
  messages: AdminContactMessage[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ContactMessagesTable({
  messages,
}: Readonly<ContactMessagesTableProps>) {
  if (!messages.length) {
    return (
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle>Mensajes de contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center">
            <p className="text-lg font-medium text-white">
              Todavía no hay mensajes
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Los contactos enviados desde la web aparecerán acá para revisión.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((contactMessage) => {
        const statusMeta = contactMessageStatusMeta[contactMessage.status];
        const typeMeta = contactMessageTypeMeta[contactMessage.message_type];

        return (
          <Card
            key={contactMessage.id}
            className="border-white/10 bg-zinc-950/80 text-white"
          >
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {contactMessage.name}
                  </CardTitle>
                  <p className="mt-2 text-sm text-zinc-400">
                    {typeMeta.label} · {formatDateTime(contactMessage.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
                    {typeMeta.label}
                  </Badge>
                  <Badge className={statusMeta.className}>
                    {statusMeta.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 pt-6 xl:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      Contacto
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-zinc-300">
                      <p>Email: {contactMessage.email || "—"}</p>
                      <p>Teléfono: {contactMessage.phone || "—"}</p>
                      <p>Negocio: {contactMessage.business_name || "—"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                      Estado actual
                    </p>
                    <p className="mt-3 text-sm text-zinc-300">
                      {statusMeta.label}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 [font-family:var(--font-orbitron)]">
                    Mensaje
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {contactMessage.message}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <ContactMessageStatusForm
                  messageId={contactMessage.id}
                  initialStatus={contactMessage.status}
                  initialNotes={contactMessage.admin_notes}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}