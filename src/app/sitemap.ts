import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://baren.example.com";

  const db = getDb();
  const publishedNews = await db
    .select({ slug: news.slug, publishedAt: news.publishedAt })
    .from(news)
    .where(eq(news.status, "published"));

  const newsUrls: MetadataRoute.Sitemap = publishedNews.map((item) => ({
    url: `${baseUrl}/berita/${item.slug}`,
    lastModified: item.publishedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...newsUrls,
  ];
}
