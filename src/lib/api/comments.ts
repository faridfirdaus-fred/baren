// Comment helpers for API routes
import { desc, eq } from "drizzle-orm";

export type CommentListItem = {
  id: number;
  body: string;
  userName: string;
  userPhotoUrl: string | null;
  createdAt: string;
};

export type CommentRow = {
  id: number;
  name: string | null;
  photoUrl: string | null;
  body: string;
  createdAt: string;
};

export type CommentLister = { list(): Promise<CommentRow[]> };

export const COMMENTS_PER_PAGE = 20;
export const COMMENTS_MAX_PER_PAGE = 50;
export const COMMENT_RATE_LIMIT = 5;
export const COMMENT_RATE_WINDOW_MS = 10 * 60_000;

/** GET publik: terbaru dulu; cursor = ID terakhir yang sudah tampil. */
export async function readComments(
  store: CommentLister,
  opts: { limit: number; cursor: number | null },
): Promise<CommentRow[]> {
  const rows = await store.list();
  const sorted = [...rows].sort((a, b) => b.id - a.id);
  const cursor = opts.cursor;
  const after = cursor === null ? sorted : sorted.filter((r) => r.id < cursor);
  return after.slice(0, opts.limit);
}

/** true bila user masih boleh kirim (maks 5 per 10 menit). */
export function checkCommentRateLimit(stamps: number[], now: number): boolean {
  const windowStart = now - COMMENT_RATE_WINDOW_MS;
  return stamps.filter((t) => t >= windowStart).length < COMMENT_RATE_LIMIT;
}

async function getDatabase() {
  const { getDb } = await import("@/db");
  const { comments, users } = await import("@/db/schema");
  return { db: getDb(), comments, users };
}

/**
 * List all comments (public, latest first, no email leak)
 */
export async function listComments(): Promise<CommentListItem[]> {
  try {
    const { db, comments, users } = await getDatabase();
    const rows = await db
      .select({
        id: comments.id,
        body: comments.body,
        userName: users.name,
        userPhotoUrl: users.image,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt), desc(comments.id))
      .limit(100);

    return rows.map((row) => ({
      ...row,
      userName: row.userName ?? "Anonim",
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("listComments error:", error);
    return [];
  }
}

/**
 * Create comment (authenticated user only)
 */
export async function createComment(
  userId: string,
  body: string,
): Promise<CommentListItem> {
  const { db, comments, users } = await getDatabase();
  const [newComment] = await db
    .insert(comments)
    .values({ userId, body })
    .returning();

  const [user] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    id: newComment.id,
    body: newComment.body,
    userName: user?.name ?? "Anonim",
    userPhotoUrl: user?.image ?? null,
    createdAt: newComment.createdAt.toISOString(),
  };
}

/**
 * Delete comment by ID (admin only, no cascade)
 */
export async function deleteComment(id: number): Promise<boolean> {
  const { db, comments } = await getDatabase();
  const deleted = await db.delete(comments).where(eq(comments.id, id));
  return (deleted.rowCount ?? 0) > 0;
}
