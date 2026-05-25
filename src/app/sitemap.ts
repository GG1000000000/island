import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import brandsData from "@/data/brand_averages.json";

const BASE = "https://island-5yov.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/calc",
    "/recalls",
    "/bll",
    "/tap",
    "/products",
    "/brands",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  // Contaminant detail pages
  const { data: contams } = await supabase
    .from("contaminants")
    .select("id")
    .limit(2000);
  const contaminantUrls: MetadataRoute.Sitemap = (contams ?? []).map((c) => ({
    url: `${BASE}/c/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Brand pages
  const brandUrls: MetadataRoute.Sitemap = (brandsData as { brand: string }[]).map((b) => ({
    url: `${BASE}/brand/${encodeURIComponent(b.brand)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...statics, ...contaminantUrls, ...brandUrls];
}
