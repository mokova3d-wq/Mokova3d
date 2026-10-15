import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/inquiries"],
      },
    ],
    sitemap: "https://mokova3d.com/sitemap.xml",
  };
}