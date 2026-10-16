// E3-12: GET komentar publik (terbaru dulu) + POST komentar (login Google).

import { and, desc, eq, gte, lt } from "drizzle-orm";

import { getDb } from "@/db";
import { comments, users } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth-guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fail, fromResult, unauthorized } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam, parseLimitParam } from "@/lib/api/params";
import {
  checkCommentRateLimit,
  COMMENTS_MAX_PER_PAGE,
  COMMENTS_PER_PAGE,
  COMMENT_RATE_WINDOW_MS,
  readComments,
  type CommentRow,
} from "@/lib/api/comments";
import { commentCreateSchema } from "@/lib/validation/comments";

export const dynamic = "force-dynamic";

function toRow(
  r: typeof comments.$inferSelect,
  author: { name: string | null; image: string | null },
): CommentRow {
  return {
    id: r.id,
    name: author.name,
    photoUrl: author.image,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  };
}

/** Publik: daftar komentar tanpa email. */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const limit = parseLimitParam(
    params.get("limit"),
    COMMENTS_PER_PAGE,
    COMMENTS_MAX_PER_PAGE,
  );
  if (!limit.ok) return fromResult(limit);
  const rawCursor = params.get("cursor");
  const cursor =
    rawCursor === null
      ? { ok: true as const, data: null }
      : parseIdParam(rawCursor);
  if (!cursor.ok) return fromResult(cursor);
  try {
    const db = getDb();
    const rows = await db
      .select({ comment: comments, author: users })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(cursor.data === null ? undefined : lt(comments.id, cursor.data))
      .orderBy(desc(comments.id))
      .limit(limit.data);
    const lister = {
      list: async () =>
        rows.map(({ comment, author }) => toRow(comment, author)),
    };
    return fromResult({
      ok: true,
      data: await readComments(lister, {
        limit: limit.data,
        cursor: cursor.data,
      }),
    });
  } catch (error) {
    console.error("GET /api/comments gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Pengunjung login Google: kirim komentar (langsung tayang). */
export async function POST(request: Request): Promise<Response> {
  const session = await requireSessionUser();
  if (!session.ok) return unauthorized();
  const parsed = await parseJsonBody(request, commentCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const db = getDb();
    const windowStart = new Date(Date.now() - COMMENT_RATE_WINDOW_MS);
    const recent = await db
      .select({ createdAt: comments.createdAt })
      .from(comments)
      .where(
        and(
          eq(comments.userId, session.userId),
          gte(comments.createdAt, windowStart),
        ),
      );
    if (
      !checkCommentRateLimit(
        recent.map((r) => r.createdAt.getTime()),
        Date.now(),
      )
    ) {
      return fail(
        "VALIDATION_ERROR",
        "Terlalu banyak komentar. Coba lagi dalam 10 menit.",
        429,
      );
    }
    const inserted = await db
      .insert(comments)
      .values({ userId: session.userId, body: parsed.data.body })
      .returning();
    const created = inserted[0];
    if (!created) throw new Error("Gagal menyimpan komentar.");
    const authors = await db
      .select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    const author = authors[0] ?? { name: null, image: null };
    return fromResult({ ok: true, data: toRow(created, author), status: 201 });
  } catch (error) {
    console.error("POST /api/comments gagal:", error);
    return fromResult(toDbResult(error));
  }
}
