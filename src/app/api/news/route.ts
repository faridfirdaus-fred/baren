// E3-6: GET daftar berita terbit (9/halaman) + POST berita (admin).
// E7-2: GET by slug untuk halaman detail.

import { count, desc, eq, sql, and } from "drizzle-orm";

import { getDb } from "@/db";
import { news } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseLimitParam, parsePageParam } from "@/lib/api/params";
import {
  NEWS_PER_PAGE,
  normalizeNewsTiming,
  readNewsPage,
  type NewsCreator,
  type NewsLister,
  type NewsRow,
} from "@/lib/api/news";
import { newsCreateSchema } from "@/lib/validation/news";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

const PUBLISHED = "published";

function toRow(r: typeof news.$inferSelect): NewsRow {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    coverUrl: r.coverUrl,
    status: r.status === PUBLISHED ? PUBLISHED : "draft",
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function lister(db: Db): NewsLister {
  return {
    async listPublished(page: number, perPage: number) {
      const [rows, totals] = await Promise.all([
        db
          .select()
          .from(news)
          .where(eq(news.status, PUBLISHED))
          .orderBy(sql`${news.publishedAt} DESC NULLS LAST`, desc(news.id))
          .limit(perPage)
          .offset((page - 1) * perPage),
        db
          .select({ total: count() })
          .from(news)
          .where(eq(news.status, PUBLISHED)),
      ]);
      return { items: rows.map(toRow), total: totals[0]?.total ?? 0 };
    },
  };
}

function creator(db: Db): NewsCreator {
  return {
    async create(input): Promise<NewsRow> {
      const timed = normalizeNewsTiming(input, new Date().toISOString());
      const rows = await db
        .insert(news)
        .values({
          slug: timed.slug,
          title: timed.title,
          excerpt: timed.excerpt ?? null,
          body: timed.body,
          coverUrl: timed.coverUrl ?? null,
          status: timed.status,
          publishedAt: timed.publishedAt ? new Date(timed.publishedAt) : null,
        })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah berita.");
      return toRow(created);
    },
  };
}

/** Publik: berita terbit terbaru (?page=, ?limit= maks 9; landing memakai limit=3). 
 * E7-2: ?slug= untuk detail 1 berita published.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const slugParam = params.get("slug");

  // E7-2: jika ada ?slug=, ambil 1 berita published
  if (slugParam) {
    try {
      const db = getDb();
      const item = await db.query.news.findFirst({
        where: and(eq(news.slug, slugParam), eq(news.status, PUBLISHED)),
      });
      if (!item) {
        return fromResult({
          ok: false,
          code: "NOT_FOUND",
          message: "Berita tidak ditemukan",
          status: 404,
        });
      }
      return fromResult({ ok: true, data: toRow(item) });
    } catch (error) {
      console.error("GET /api/news?slug= gagal:", error);
      return fromResult(toDbResult(error));
    }
  }

  // List berita (paginated)
  const page = parsePageParam(params.get("page"));
  if (!page.ok) return fromResult(page);
  const limit = parseLimitParam(params.get("limit"), NEWS_PER_PAGE);
  if (!limit.ok) return fromResult(limit);
  try {
    const data = await readNewsPage(lister(getDb()), page.data, limit.data);
    return fromResult({ ok: true, data });
  } catch (error) {
    console.error("GET /api/news gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah berita (draf/terbit). */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/news");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, newsCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    return fromResult({
      ok: true,
      data: await creator(getDb()).create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/news gagal:", error);
    return fromResult(toDbResult(error, "Slug sudah dipakai."));
  }
}
