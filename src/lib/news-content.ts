// Fetch latest 3 published news for landing page

import { getDb } from "@/db";
import { news } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
};

export async function getLatestNews(): Promise<NewsItem[] | null> {
  try {
    const db = getDb();
    const items = await db
      .select({
        id: news.id,
        slug: news.slug,
        title: news.title,
        excerpt: news.excerpt,
        coverUrl: news.coverUrl,
        publishedAt: news.publishedAt,
      })
      .from(news)
      .where(eq(news.status, "published"))
      .orderBy(desc(news.publishedAt), desc(news.id))
      .limit(3);

    return items.length > 0
      ? items.map((item) => ({
          ...item,
          publishedAt: item.publishedAt?.toISOString() ?? null,
        }))
      : null;
  } catch (error) {
    console.error("getLatestNews error:", error);
    return null;
  }
}
