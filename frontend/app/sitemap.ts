import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const staticRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/aeo-guide", changeFrequency: "monthly", priority: 0.8 },
  { path: "/aeo-checker-tool", changeFrequency: "weekly", priority: 0.85 },
  { path: "/aeo-readiness", changeFrequency: "weekly", priority: 0.75 },
  { path: "/aeo-monitoring", changeFrequency: "weekly", priority: 0.75 },
  { path: "/aeo-audit", changeFrequency: "weekly", priority: 0.85 },
  { path: "/aeo-grader", changeFrequency: "weekly", priority: 0.84 },
  { path: "/aeo-software", changeFrequency: "weekly", priority: 0.85 },
  { path: "/aeo-tracker", changeFrequency: "weekly", priority: 0.85 },
  { path: "/sample-aeo-report", changeFrequency: "weekly", priority: 0.8 },
  { path: "/aeo-checker-vs-aeo-grader", changeFrequency: "monthly", priority: 0.78 },
  { path: "/how-to-improve-aeo-score", changeFrequency: "monthly", priority: 0.78 },
  { path: "/ai-seo-checker", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/integrations", changeFrequency: "monthly", priority: 0.7 },
  { path: "/case-studies", changeFrequency: "monthly", priority: 0.7 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.5 },
  { path: "/documentation", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
] as const;

const articleRoutes = [
  {
    path: "/blog/why-i-stopped-worrying-about-google-rankings",
    lastModified: "2026-01-16",
  },
  {
    path: "/blog/the-time-chatgpt-cited-my-competitor-instead-of-me",
    lastModified: "2026-01-11",
  },
  {
    path: "/blog/i-audited-50-sites-for-aeo-heres-what-i-found",
    lastModified: "2026-01-04",
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articlePages: MetadataRoute.Sitemap = articleRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}
