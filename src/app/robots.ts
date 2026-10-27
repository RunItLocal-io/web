import type { MetadataRoute } from "next";
import { SITE } from "@/lib/share";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
