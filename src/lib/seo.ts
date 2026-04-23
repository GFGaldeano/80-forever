const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    LOCAL_SITE_URL;

  const normalized = envUrl.startsWith("http")
    ? envUrl
    : `https://${envUrl}`;

  return normalized.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildMetaDescription(input: string, maxLength = 160) {
  const normalized = input.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}