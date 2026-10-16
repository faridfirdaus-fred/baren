// E3-12: DELETE komentar per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { comments } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseIdParam } from "@/lib/api/params";

export const dynamic = "force-dynamic";

/** Admin: hapus komentar bermasalah (satu-satunya moderasi). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/comments/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const rows = await getDb()
      .delete(comments)
      .where(eq(comments.id, id.data))
      .returning({ id: comments.id });
    if (!rows[0]) return notFound("Komentar");
    return fromResult({ ok: true, data: { id: rows[0].id } });
  } catch (error) {
    console.error("DELETE /api/comments/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
