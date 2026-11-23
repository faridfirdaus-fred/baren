// Fetch latest 3 published news for landing page

import { getDb } from "@/db";
import { news } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

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

/** Ambil seluruh berita terbit untuk halaman indeks /berita. */
export async function getAllPublishedNews(limit = 50): Promise<NewsItem[]> {
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
      .limit(limit);

    return items.map((item) => ({
      ...item,
      publishedAt: item.publishedAt?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("getAllPublishedNews error:", error);
    return [];
  }
}

export type NewsDetailItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
};

/** Ambil detail 1 berita terbit berdasarkan slug langsung dari DB. */
export async function getPublishedNewsBySlug(
  slug: string,
): Promise<NewsDetailItem | null> {
  try {
    const db = getDb();
    const items = await db
      .select({
        id: news.id,
        slug: news.slug,
        title: news.title,
        excerpt: news.excerpt,
        body: news.body,
        coverUrl: news.coverUrl,
        status: news.status,
        publishedAt: news.publishedAt,
      })
      .from(news)
      .where(and(eq(news.slug, slug), eq(news.status, "published")))
      .limit(1);

    if (items.length === 0 || !items[0]) return null;
    const item = items[0];
    return {
      ...item,
      status: item.status as "draft" | "published",
      publishedAt: item.publishedAt?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("getPublishedNewsBySlug error:", error);
    return null;
  }
}
