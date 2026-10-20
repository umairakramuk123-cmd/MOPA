import type { MetadataRoute } from "next";

/**
 * The portal holds unpublished legislative records, so it must never be
 * crawled or indexed. Access is session-gated at the route layout.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
