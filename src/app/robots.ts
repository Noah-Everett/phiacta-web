import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth/session/compose routes have no SEO value and exposing them
        // to crawlers just wastes crawl budget.
        disallow: [
          "/auth/",
          "/dashboard",
          "/settings/",
          "/post",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
