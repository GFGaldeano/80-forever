import type { Locale } from "./config";

export async function getDictionary(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("./dictionaries/en")).default;
    case "es":
    default:
      return (await import("./dictionaries/es")).default;
  }
}