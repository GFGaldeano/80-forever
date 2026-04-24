import { z } from "zod";

function optionalUrlField(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Máximo ${maxLength} caracteres.`)
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Ingresá una URL válida.",
    });
}

export const siteSettingsSchema = z.object({
  channelName: z
    .string()
    .trim()
    .min(1, "El nombre del canal es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  slogan: z
    .string()
    .trim()
    .min(1, "El slogan es obligatorio.")
    .max(180, "Máximo 180 caracteres."),
  shortDescription: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .max(180, "Máximo 180 caracteres.")
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Ingresá un email válido.",
    })
    .optional()
    .or(z.literal("")),
  whatsappCommunityUrl: optionalUrlField(500).optional().or(z.literal("")),
  primaryLogoUrl: optionalUrlField(500).optional().or(z.literal("")),
  bannerLogoUrl: optionalUrlField(500).optional().or(z.literal("")),
  defaultSocialImageUrl: optionalUrlField(500).optional().or(z.literal("")),
  siteUrl: optionalUrlField(500).optional().or(z.literal("")),
  defaultSeoTitle: z
    .string()
    .trim()
    .max(180, "Máximo 180 caracteres.")
    .optional()
    .or(z.literal("")),
  defaultSeoDescription: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres.")
    .optional()
    .or(z.literal("")),
  youtubeChannelUrl: optionalUrlField(500).optional().or(z.literal("")),
  globalNotice: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
  institutionalText: z
    .string()
    .trim()
    .max(3000, "Máximo 3000 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;