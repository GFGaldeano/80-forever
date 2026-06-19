import { z } from "zod";

export const streamProviders = [
  "youtube",
  "facebook",
  "external",
  "self_hosted_hls",
] as const;

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
    const requiresPlaybackUrl = values.status === "live" || values.status === "replay";

    if (
      requiresPlaybackUrl &&
      values.provider === "self_hosted_hls" &&
      !values.sourceUrl
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceUrl"],
        message: "La URL HLS (.m3u8) es obligatoria para Self-hosted HLS en Live o Replay.",
      });
    }

    if (
      requiresPlaybackUrl &&
      values.provider !== "self_hosted_hls" &&
      !values.embedUrl
    ) {
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
export type StreamProvider = StreamConfigInput["provider"];
export type StreamStatus = StreamConfigInput["status"];

export const streamStatusMeta: Record<
  StreamStatus,
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
  StreamProvider,
  {
    label: string;
    description: string;
    sourceUrlLabel: string;
    sourceUrlPlaceholder: string;
    embedUrlLabel: string;
    embedUrlPlaceholder: string;
    embedUrlHelp: string;
  }
> = {
  youtube: {
    label: "YouTube",
    description: "Fallback principal de emergencia y proveedor externo por embed.",
    sourceUrlLabel: "URL de origen",
    sourceUrlPlaceholder: "https://www.youtube.com/watch?v=VIDEO_ID",
    embedUrlLabel: "URL de embed",
    embedUrlPlaceholder: "https://www.youtube.com/embed/VIDEO_ID",
    embedUrlHelp: "Usá la URL embed oficial de YouTube para mostrar el player en la home.",
  },
  facebook: {
    label: "Facebook",
    description: "Proveedor externo para emisiones públicas de Facebook Live.",
    sourceUrlLabel: "URL de origen",
    sourceUrlPlaceholder: "https://www.facebook.com/...",
    embedUrlLabel: "URL de embed",
    embedUrlPlaceholder: "https://www.facebook.com/plugins/video.php?...",
    embedUrlHelp: "Usá la URL de embed pública provista por Facebook.",
  },
  external: {
    label: "Externo",
    description: "Embed externo compatible con iframe.",
    sourceUrlLabel: "URL de origen",
    sourceUrlPlaceholder: "https://...",
    embedUrlLabel: "URL de embed",
    embedUrlPlaceholder: "https://...",
    embedUrlHelp: "Usá una URL embebible compatible con iframe.",
  },
  self_hosted_hls: {
    label: "Self-hosted HLS",
    description: "Servidor propio de streaming. Preparado para MediaMTX/OBS y player HLS.",
    sourceUrlLabel: "URL HLS (.m3u8)",
    sourceUrlPlaceholder: "https://stream.80forever.com/80forever/index.m3u8",
    embedUrlLabel: "URL fallback de emergencia",
    embedUrlPlaceholder: "https://www.youtube.com/embed/VIDEO_ID",
    embedUrlHelp:
      "Opcional: conservá un embed YouTube como fallback rápido si el servidor propio falla.",
  },
};
