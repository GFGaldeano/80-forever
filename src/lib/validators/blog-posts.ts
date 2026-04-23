import { z } from "zod";

export const blogPostSchema = z.object({
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
  excerpt: z
    .string()
    .trim()
    .max(320, "Máximo 320 caracteres.")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(1, "El contenido es obligatorio.")
    .max(12000, "Máximo 12000 caracteres."),
  coverImageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: "La URL de portada debe comenzar con http:// o https://",
    }),
  cloudinaryPublicId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  publishedAt: z.string().trim().optional().or(z.literal("")),
  isVisible: z.boolean(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export function slugifyBlogTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}