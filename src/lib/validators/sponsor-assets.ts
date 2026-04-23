import { z } from "zod";

export const sponsorAssetTypes = ["image", "gif"] as const;
export const sponsorAssetPlacements = ["top", "bottom", "both"] as const;

export const sponsorAssetSchema = z
  .object({
    sponsorId: z.string().trim().min(1, "Debes seleccionar un sponsor."),
    assetType: z.enum(sponsorAssetTypes, {
      message: "Seleccioná un tipo de asset válido.",
    }),
    placement: z.enum(sponsorAssetPlacements, {
      message: "Seleccioná una ubicación válida.",
    }),
    assetUrl: z
      .string()
      .trim()
      .min(1, "La URL del asset es obligatoria.")
      .refine((value) => /^https?:\/\/.+/i.test(value), {
        message: "La URL del asset debe comenzar con http:// o https://",
      }),
    cloudinaryPublicId: z.string().trim().optional().or(z.literal("")),
    durationSeconds: z
      .string()
      .trim()
      .min(1, "La duración es obligatoria.")
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 60, {
        message: "La duración debe ser un número entre 1 y 60 segundos.",
      }),
    priority: z
      .string()
      .trim()
      .min(1, "La prioridad es obligatoria.")
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 0, {
        message: "La prioridad debe ser un número entero mayor o igual a 0.",
      }),
    linkUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
        message: "La URL del link debe comenzar con http:// o https://",
      }),
    startsAt: z.string().trim().optional().or(z.literal("")),
    endsAt: z.string().trim().optional().or(z.literal("")),
    isVisible: z.boolean(),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.startsAt && values.endsAt) {
      const start = new Date(values.startsAt);
      const end = new Date(values.endsAt);

      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endsAt"],
          message: "La fecha de fin debe ser posterior a la fecha de inicio.",
        });
      }
    }
  });

export type SponsorAssetInput = z.infer<typeof sponsorAssetSchema>;