import { z } from "zod";

import { parseYouTubeVideo } from "@/lib/youtube/parse-youtube";

export const transmissionSchema = z.object({
  episodeCode: z
    .string()
    .trim()
    .min(1, "El código de episodio es obligatorio.")
    .max(40, "Máximo 40 caracteres."),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(180, "Máximo 180 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug debe usar minúsculas, números y guiones."
    ),
  description: z
    .string()
    .trim()
    .max(3000, "Máximo 3000 caracteres.")
    .optional()
    .or(z.literal("")),
  youtubeUrl: z
    .string()
    .trim()
    .min(1, "La URL de YouTube es obligatoria.")
    .refine((value) => Boolean(parseYouTubeVideo(value)), {
      message: "Ingresá una URL de YouTube válida.",
    }),
  status: z.enum(["draft", "scheduled", "aired", "archived"]),
  scheduledAt: z.string().trim().optional().or(z.literal("")),
  airedAt: z.string().trim().optional().or(z.literal("")),
  isVisible: z.boolean(),
});

export type TransmissionInput = z.infer<typeof transmissionSchema>;

export function slugifyTransmissionTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}