import type { NextConfig } from "next";

const EDGE_DAY =
  "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";
const EDGE_STATIC =
  "public, max-age=31536000, immutable";
const EDGE_HOUR =
  "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: EDGE_STATIC }],
      },
      {
        source: "/certificates/:path*",
        headers: [{ key: "Cache-Control", value: EDGE_DAY }],
      },
      {
        source: "/:path*.(ico|png|jpg|jpeg|gif|webp|svg|woff2)",
        headers: [{ key: "Cache-Control", value: EDGE_DAY }],
      },
      {
        source: "/api/map/:path*",
        headers: [{ key: "Cache-Control", value: EDGE_DAY }],
      },
      {
        source: "/map",
        headers: [{ key: "Cache-Control", value: EDGE_DAY }],
      },
      {
        source: "/vision",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/vision/:path*",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/docs",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/docs/:path*",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/privacy",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/case-studies",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/schools",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/pilot",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
      {
        source: "/business",
        headers: [{ key: "Cache-Control", value: EDGE_HOUR }],
      },
    ];
  },
};

export default nextConfig;
