import type { Metadata } from "next";

export const SITE_NAME = "CheckSiteAEO";

function normalizeSiteUrl(input: string): string {
  try {
    const url = new URL(input);
    // Canonical host preference: non-www
    url.hostname = url.hostname.replace(/^www\./, "");
    return url.origin;
  } catch {
    return "https://checksiteaeo.com";
  }
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_APP_URL || "https://checksiteaeo.com"
);
export const OG_IMAGE = "/og-image.png";
export const TWITTER_HANDLE = "@checksiteaeo";

export function absoluteUrl(path: string = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  noIndex = false,
}: CreatePageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      type,
      url: absoluteUrl(path),
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
      creator: TWITTER_HANDLE,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          },
        }
      : {}),
  };
}
