type JsonLdObject = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  url: string;
};

export function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd({
  siteName,
  siteUrl,
  logoUrl,
  contactEmail,
  sameAs,
}: {
  siteName: string;
  siteUrl: string;
  logoUrl?: string;
  contactEmail?: string;
  sameAs?: string[];
}): JsonLdObject {
  const json: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  };

  if (logoUrl) {
    json.logo = logoUrl;
  }

  if (contactEmail) {
    json.email = contactEmail;
  }

  if (sameAs?.length) {
    json.sameAs = sameAs;
  }

  return json;
}

export function buildWebSiteJsonLd({
  siteName,
  siteUrl,
  description,
}: {
  siteName: string;
  siteUrl: string;
  description?: string;
}): JsonLdObject {
  const json: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };

  if (description) {
    json.description = description;
  }

  return json;
}

export function buildCollectionPageJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description?: string;
  url: string;
}): JsonLdObject {
  const json: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
  };

  if (description) {
    json.description = description;
  }

  return json;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleJsonLd({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
}: {
  headline: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string;
  publisherName: string;
  publisherLogo?: string;
}): JsonLdObject {
  const json: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    mainEntityOfPage: url,
    author: {
      "@type": "Organization",
      name: authorName || publisherName,
    },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      ...(publisherLogo
        ? {
            logo: {
              "@type": "ImageObject",
              url: publisherLogo,
            },
          }
        : {}),
    },
  };

  if (description) {
    json.description = description;
  }

  if (image) {
    json.image = [image];
  }

  if (datePublished) {
    json.datePublished = datePublished;
  }

  if (dateModified) {
    json.dateModified = dateModified;
  }

  return json;
}

export function buildVideoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  embedUrl,
  contentUrl,
  uploadDate,
  publisherName,
  publisherLogo,
}: {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  contentUrl?: string;
  uploadDate?: string | null;
  publisherName: string;
  publisherLogo?: string;
}): JsonLdObject {
  const json: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    publisher: {
      "@type": "Organization",
      name: publisherName,
      ...(publisherLogo
        ? {
            logo: {
              "@type": "ImageObject",
              url: publisherLogo,
            },
          }
        : {}),
    },
  };

  if (description) {
    json.description = description;
  }

  if (thumbnailUrl) {
    json.thumbnailUrl = [thumbnailUrl];
  }

  if (embedUrl) {
    json.embedUrl = embedUrl;
  }

  if (contentUrl) {
    json.contentUrl = contentUrl;
  }

  if (uploadDate) {
    json.uploadDate = uploadDate;
  }

  return json;
}