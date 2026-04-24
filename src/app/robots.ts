import type { MetadataRoute } from "next";

import { buildAbsoluteSiteUrl, getPublicSiteSeo } from "@/lib/seo/get-public-site-seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getPublicSiteSeo();

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/blog",
        "/transmisiones",
        "/pedi-tu-tema",
        "/contacto",
      ],
      disallow: ["/admin", "/api"],
    },
    sitemap: buildAbsoluteSiteUrl(seo.siteUrl, "/sitemap.xml"),
    host: seo.siteUrl,
  };
}