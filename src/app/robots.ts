import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://island-5yov.vercel.app/sitemap.xml",
    host: "https://island-5yov.vercel.app",
  };
}
