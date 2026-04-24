import type { MetadataRoute } from "next";

import { getPublicBlogSlugs } from "@/lib/blog/get-public-blog-slugs";
import {
  buildAbsoluteSiteUrl,
  getPublicSiteSeo,
} from "@/lib/seo/get-public-site-seo";
import { getPublicTransmissions } from "@/lib/transmissions/get-public-transmissions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getPublicSiteSeo();
  const [blogPosts, transmissions] = await Promise.all([
    getPublicBlogSlugs(),
    getPublicTransmissions(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/blog"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/transmisiones"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/pedi-tu-tema"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: buildAbsoluteSiteUrl(seo.siteUrl, "/contacto"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: buildAbsoluteSiteUrl(seo.siteUrl, `/blog/${post.slug}`),
    lastModified:
      post.updated_at || post.published_at || post.created_at || undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const transmissionRoutes: MetadataRoute.Sitemap = transmissions.map(
    (transmission) => ({
      url: buildAbsoluteSiteUrl(
        seo.siteUrl,
        `/transmisiones/${transmission.slug}`
      ),
      lastModified:
        transmission.aired_at ||
        transmission.scheduled_at ||
        transmission.created_at ||
        undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...blogRoutes, ...transmissionRoutes];
}