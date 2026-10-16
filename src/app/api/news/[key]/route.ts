// E3-6: detail/ubah/hapus berita via [key] tunggal.
// GET memakai slug (publik, hanya terbit); PUT/DELETE memakai ID numerik.
// Slug murni angka dilarang skema agar tak ambigu dengan ID.

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { news } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import {
  normalizeNewsTiming,
  type NewsById,
  type NewsBySlug,
  type NewsRow,
} from "@/lib/api/news";
import { newsUpdateSchema, type NewsUpdate } from "@/lib/validation/news";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof news.$inferSelect): NewsRow {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    coverUrl: r.coverUrl,
    status: r.status === "published" ? "published" : "draft",
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function bySlug(db: Db): NewsBySlug {
  return {
    async getPublished(slug: string): Promise<NewsRow | null> {
      const rows = await db
        .select()
        .from(news)
        .where(and(eq(news.slug, slug), eq(news.status, "published")))
        .limit(1);
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

function byId(db: Db): NewsById {
  return {
    async update(id: number, patch: NewsUpdate): Promise<NewsRow | null> {
      const set: {
        slug?: string;
        title?: string;
        excerpt?: string | null;
        body?: string;
        coverUrl?: string | null;
        status?: string;
        publishedAt?: Date | null;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.slug !== undefined) set.slug = patch.slug;
      if (patch.title !== undefined) set.title = patch.title;
      if (patch.excerpt !== undefined) set.excerpt = patch.excerpt;
      if (patch.body !== undefined) set.body = patch.body;
      if (patch.coverUrl !== undefined) set.coverUrl = patch.coverUrl;
      if (patch.status !== undefined || patch.publishedAt !== undefined) {
        const current = await db
          .select({ status: news.status, publishedAt: news.publishedAt })
          .from(news)
          .where(eq(news.id, id))
          .limit(1);
        const row = current[0];
        if (!row) return null;
        const timed = normalizeNewsTiming(
          {
            status:
              patch.status ??
              (row.status === "published" ? "published" : "draft"),
            publishedAt:
              patch.publishedAt ??
              (row.publishedAt ? row.publishedAt.toISOString() : null),
          },
          new Date().toISOString(),
        );
        set.status = timed.status;
        set.publishedAt = timed.publishedAt
          ? new Date(timed.publishedAt)
          : null;
      }
      const rows = await db
        .update(news)
        .set(set)
        .where(eq(news.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<NewsRow | null> {
      const rows = await db.delete(news).where(eq(news.id, id)).returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Publik: detail berita terbit berbasis slug (draf -> 404). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
): Promise<Response> {
  try {
    const { key: slug } = await params;
    const row = await bySlug(getDb()).getPublished(slug);
    if (!row) return notFound("Berita");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("GET /api/news/[key] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: ubah berita via ID numerik (termasuk status draf/terbit). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/news/[key]");
  if (denied) return denied;
  const { key: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, newsUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Berita");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/news/[key] gagal:", error);
    return fromResult(toDbResult(error, "Slug sudah dipakai."));
  }
}

/** Admin: hapus berita via ID numerik. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/news/[key]");
  if (denied) return denied;
  const { key: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Berita");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/news/[key] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
