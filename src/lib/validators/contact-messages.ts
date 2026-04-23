import { z } from "zod";

export const contactMessageTypes = [
  "general",
  "commercial",
  "sponsor",
  "sumarme_al_proyecto",
  "alianza_prensa",
] as const;

export const contactMessageStatuses = ["new", "read", "archived"] as const;

export const contactMessageSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Tu nombre es obligatorio.")
      .max(100, "Máximo 100 caracteres."),
    businessName: z
      .string()
      .trim()
      .max(120, "Máximo 120 caracteres.")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .max(160, "Máximo 160 caracteres.")
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: "Ingresá un email válido.",
      }),
    phone: z
      .string()
      .trim()
      .max(60, "Máximo 60 caracteres.")
      .optional()
      .or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(1, "El mensaje es obligatorio.")
      .max(1000, "Máximo 1000 caracteres."),
    messageType: z.enum(contactMessageTypes, {
      message: "Seleccioná un tipo de mensaje válido.",
    }),
  })
  .superRefine((values, ctx) => {
    const hasEmail = Boolean(values.email?.trim());
    const hasPhone = Boolean(values.phone?.trim());

    if (!hasEmail && !hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Dejanos al menos un email o teléfono para poder responderte.",
      });
    }
  });

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const contactMessageTypeMeta: Record<
  (typeof contactMessageTypes)[number],
  { label: string }
> = {
  general: { label: "Consulta general" },
  commercial: { label: "Comercial" },
  sponsor: { label: "Quiero publicitar / ser sponsor" },
  sumarme_al_proyecto: { label: "Quiero formar parte del proyecto" },
  alianza_prensa: { label: "Alianza / prensa" },
};

export const contactMessageStatusMeta: Record<
  (typeof contactMessageStatuses)[number],
  { label: string; className: string }
> = {
  new: {
    label: "Nuevo",
    className: "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  read: {
    label: "Leído",
    className: "border border-white/10 bg-white/[0.03] text-zinc-300",
  },
  archived: {
    label: "Archivado",
    className: "border border-zinc-700 bg-zinc-800/60 text-zinc-300",
  },
};