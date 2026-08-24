import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://coral-lookout.vercel.app";

/** Public marketing and product pages for search indexing. */
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/scanner", changeFrequency: "weekly", priority: 0.9 },
  { path: "/map", changeFrequency: "weekly", priority: 0.9 },
  { path: "/gallery", changeFrequency: "daily", priority: 0.9 },
  { path: "/academy", changeFrequency: "weekly", priority: 0.8 },
  { path: "/research", changeFrequency: "weekly", priority: 0.8 },
  { path: "/forum", changeFrequency: "daily", priority: 0.8 },
  { path: "/community", changeFrequency: "weekly", priority: 0.7 },
  { path: "/compete", changeFrequency: "weekly", priority: 0.7 },
  { path: "/challenges", changeFrequency: "weekly", priority: 0.7 },
  { path: "/schools", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pilot", changeFrequency: "monthly", priority: 0.7 },
  { path: "/case-studies", changeFrequency: "monthly", priority: 0.7 },
  { path: "/vision", changeFrequency: "monthly", priority: 0.7 },
  { path: "/vision/one-pager", changeFrequency: "monthly", priority: 0.6 },
  { path: "/business", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/release-notes", changeFrequency: "weekly", priority: 0.5 },
  { path: "/teacher", changeFrequency: "monthly", priority: 0.6 },
  { path: "/teacher/join-guide", changeFrequency: "monthly", priority: 0.5 },
  { path: "/founder", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/pitch", changeFrequency: "monthly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
