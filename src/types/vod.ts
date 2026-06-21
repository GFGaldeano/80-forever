export const vodAssetStatuses = [
  "draft",
  "processing",
  "ready",
  "published",
  "archived",
] as const;

export type VodAssetStatus = (typeof vodAssetStatuses)[number];

export const vodAssetMediaKinds = ["emission", "clip", "promo", "other"] as const;

export type VodAssetMediaKind = (typeof vodAssetMediaKinds)[number];

export const vodAssetStorageProviders = [
  "local",
  "self_hosted",
  "cloudinary",
  "external",
] as const;

export type VodAssetStorageProvider =
  (typeof vodAssetStorageProviders)[number];

export const vodAssetStatusMeta: Record<
  VodAssetStatus,
  { label: string; description: string }
> = {
  draft: {
    label: "Borrador",
    description: "Metadata inicial sin publicar.",
  },
  processing: {
    label: "Procesando",
    description: "La grabación está siendo convertida o preparada.",
  },
  ready: {
    label: "Lista",
    description: "El video está preparado, pero aún no publicado.",
  },
  published: {
    label: "Publicada",
    description: "El video on-demand está visible públicamente.",
  },
  archived: {
    label: "Archivada",
    description: "El video queda conservado, pero fuera de publicación activa.",
  },
};

export const vodAssetMediaKindMeta: Record<
  VodAssetMediaKind,
  { label: string; description: string }
> = {
  emission: {
    label: "Emisión pasada",
    description: "Grabación completa o principal de una transmisión.",
  },
  clip: {
    label: "Clip",
    description: "Fragmento corto extraído de una emisión.",
  },
  promo: {
    label: "Promo",
    description: "Contenido promocional o institucional.",
  },
  other: {
    label: "Otro",
    description: "Contenido VOD que no encaja en las categorías anteriores.",
  },
};
