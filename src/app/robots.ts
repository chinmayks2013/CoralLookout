import type { MetadataRoute } from "next";

function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "").trim();
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured;
  }
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "").trim() ||
    process.env.VERCEL_URL?.replace(/\/$/, "").trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  return "https://coral-lookout.vercel.app";
}

const BASE_URL = siteOrigin();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/login", "/auth/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
