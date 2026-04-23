import { z } from "zod";

export const songRequestStatuses = [
  "new",
  "read",
  "highlighted",
  "approved",
  "archived",
] as const;

export const songRequestSchema = z.object({
  nameAlias: z
    .string()
    .trim()
    .min(1, "Tu nombre o alias es obligatorio.")
    .max(80, "Máximo 80 caracteres."),
  songTitle: z
    .string()
    .trim()
    .min(1, "El tema es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  artistName: z
    .string()
    .trim()
    .min(1, "El artista es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  message: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres.")
    .optional()
    .or(z.literal("")),
  socialHandle: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type SongRequestInput = z.infer<typeof songRequestSchema>;

export const songRequestStatusMeta: Record<
  (typeof songRequestStatuses)[number],
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
  highlighted: {
    label: "Destacado",
    className:
      "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  },
  approved: {
    label: "Aprobado",
    className:
      "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  archived: {
    label: "Archivado",
    className: "border border-zinc-700 bg-zinc-800/60 text-zinc-300",
  },
};