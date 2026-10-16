import { NextResponse } from "next/server";

import { requireAdminResponse } from "@/lib/api/guard";
import { deleteComment } from "@/lib/api/comments";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/comments/[id] - Delete comment (admin only)
 */
export async function DELETE(
  _request: Request,
  segmentData: { params: Promise<{ id: string }> },
) {
  const params = await segmentData.params;
  const denied = await requireAdminResponse(
    `DELETE /api/comments/${params.id}`,
  );
  if (denied) return denied;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const deleted = await deleteComment(id);
    if (!deleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/comments/${id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
