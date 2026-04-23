import { z } from "zod";

export const sponsorSchema = z.object({
  name: z.string().trim().min(1, "El nombre comercial es obligatorio."),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug debe usar minúsculas, números y guiones."
    ),
  websiteUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: "La URL del sitio debe comenzar con http:// o https://",
    }),
  contactName: z.string().trim().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Ingresá un email válido.",
    }),
  notes: z.string().trim().optional().or(z.literal("")),
  isVisible: z.boolean(),
  isActive: z.boolean(),
});

export type SponsorInput = z.infer<typeof sponsorSchema>;

export function slugifySponsorName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}