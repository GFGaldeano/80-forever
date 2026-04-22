import { z } from "zod";

export const streamProviders = ["youtube", "facebook", "external"] as const;
export const streamStatuses = ["live", "offline", "upcoming", "replay"] as const;

export const streamConfigSchema = z
  .object({
    provider: z.enum(streamProviders, {
      message: "Seleccioná un proveedor válido.",
    }),
    status: z.enum(streamStatuses, {
      message: "Seleccioná un estado válido.",
    }),
    title: z.string().trim().min(1, "El título es obligatorio."),
    sourceUrl: z.string().trim(),
    embedUrl: z.string().trim(),
    subtitle: z.string().trim(),
    offlineMessage: z.string().trim(),
    nextLiveAt: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if ((values.status === "live" || values.status === "replay") && !values.embedUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["embedUrl"],
        message: "La URL de embed es obligatoria para Live o Replay.",
      });
    }

    if (values.status === "upcoming" && !values.nextLiveAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nextLiveAt"],
        message: "Indicá la fecha y hora del próximo vivo.",
      });
    }
  });

export type StreamConfigInput = z.infer<typeof streamConfigSchema>;

export const streamStatusMeta: Record<
  StreamConfigInput["status"],
  { label: string; description: string }
> = {
  live: {
    label: "En vivo",
    description: "El canal está transmitiendo ahora.",
  },
  offline: {
    label: "Offline",
    description: "No hay transmisión activa.",
  },
  upcoming: {
    label: "Próximamente",
    description: "Se anuncia una futura emisión.",
  },
  replay: {
    label: "Replay",
    description: "Se muestra una repetición o emisión grabada.",
  },
};

export const streamProviderMeta: Record<
  StreamConfigInput["provider"],
  { label: string }
> = {
  youtube: { label: "YouTube" },
  facebook: { label: "Facebook" },
  external: { label: "Externo" },
};