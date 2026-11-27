import { getDb } from "@/db";
import { news } from "@/db/schema";
import { serializeNewsBody } from "@/lib/news-gallery";
import { and, desc, eq } from "drizzle-orm";

export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
};

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

const FALLBACK_EVENT_ARTICLES: NewsDetailItem[] = [
  {
    id: 9001,
    slug: "keseruan-booth-baren-festival-ckg",
    title: "Keseruan Booth BAREN di Festival Build CKG",
    excerpt:
      "Antusiasme pengunjung mencoba langsung duel 2 vs 2 layar bersama di booth pameran BAREN.",
    coverUrl: "/art/event-art.jpg",
    body: serializeNewsBody(
      "Booth BAREN dipadati pengunjung yang penasaran mencoba adaptasi modern permainan tradisional benteng-bentengan dalam format party game 2 vs 2.\n\nDengan empat controller aktif di depan layar besar, setiap ronde berdurasi 3 menit berlangsung riuh oleh kerja sama tim saat menyelamatkan kawan dari zona tahanan dan merebut benteng lawan di detik terakhir.",
      [
        "/art/event-art.jpg",
        "/art/event-booth-setup.jpg",
        "/art/event-players.jpg",
        "/art/event-match.jpg",
      ],
    ),
    status: "published",
    publishedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: 9002,
    slug: "mabar-komunitas-playtest-arena-baren",
    title: "Mabar Komunitas & Playtest Arena Kampung BAREN",
    excerpt:
      "Sesi uji main terbuka menguji tiga konsep arena mulai dari Lapang Kampung hingga Pasar Ramai.",
    coverUrl: "/art/event-players.jpg",
    body: serializeNewsBody(
      "Tim pengembang menggelar sesi playtest terbuka bersama komunitas lokal untuk menguji mekanisme status FRESH, pancingan penjaga, dan penyelamatan rekan satu tim.",
      [
        "/art/event-players.jpg",
        "/art/feature-1.jpg",
        "/art/feature-2.jpg",
        "/art/feature-3.jpg",
      ],
    ),
    status: "published",
    publishedAt: "2026-10-12T09:00:00.000Z",
  },
  {
    id: 9003,
    slug: "intip-tiga-arena-unik-baren",
    title: "Intip Tiga Konsep Arena Unik di BAREN",
    excerpt:
      "Kenali karakteristik Lapang Kampung, Pasar Ramai yang penuh kejutan, dan Alun-Alun Hujan yang licin.",
    coverUrl: "/art/feature-3.jpg",
    body: serializeNewsBody(
      "Setiap arena dirancang menghadirkan dinamika strategi berbeda dalam pertandingan singkat 2 vs 2 — mulai dari arena terbuka ramah pemula hingga lorong pasar dengan gerobak melintas.",
      ["/art/feature-1.jpg", "/art/feature-3.jpg", "/art/cover-3.jpg"],
    ),
    status: "published",
    publishedAt: "2026-10-05T09:00:00.000Z",
  },
];

function toListItem(item: NewsDetailItem): NewsItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    coverUrl: item.coverUrl,
    publishedAt: item.publishedAt,
  };
}

export async function getLatestNews(): Promise<NewsItem[]> {
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

    if (items.length > 0) {
      return items.map((item) => ({
        ...item,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      }));
    }
    return FALLBACK_EVENT_ARTICLES.map(toListItem);
  } catch {
    return FALLBACK_EVENT_ARTICLES.map(toListItem);
  }
}

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

    if (items.length > 0) {
      return items.map((item) => ({
        ...item,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      }));
    }
    return FALLBACK_EVENT_ARTICLES.map(toListItem);
  } catch {
    return FALLBACK_EVENT_ARTICLES.map(toListItem);
  }
}

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

    if (items.length > 0 && items[0]) {
      const item = items[0];
      return {
        ...item,
        status: item.status as "draft" | "published",
        publishedAt: item.publishedAt?.toISOString() ?? null,
      };
    }
    return FALLBACK_EVENT_ARTICLES.find((a) => a.slug === slug) ?? null;
  } catch {
    return FALLBACK_EVENT_ARTICLES.find((a) => a.slug === slug) ?? null;
  }
}
