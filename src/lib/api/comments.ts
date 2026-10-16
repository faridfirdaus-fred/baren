// Comment helpers for API routes

import { getDb } from "@/db";
import { comments, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type CommentListItem = {
  id: number;
  body: string;
  userName: string;
  userPhotoUrl: string | null;
  createdAt: string;
};

/**
 * List all comments (public, latest first, no email leak)
 */
export async function listComments(): Promise<CommentListItem[]> {
  try {
    const db = getDb();
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
  const db = getDb();
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
  const db = getDb();
  const deleted = await db.delete(comments).where(eq(comments.id, id));
  return (deleted.rowCount ?? 0) > 0;
}
