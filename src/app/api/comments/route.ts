import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { createComment, listComments } from "@/lib/api/comments";
import { commentBodySchema } from "@/lib/validation/comments";

export const dynamic = "force-dynamic";

/**
 * GET /api/comments - List all comments (public, no auth)
 */
export async function GET() {
  try {
    const comments = await listComments();
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return fromResult(toDbResult(error));
  }
}

/**
 * POST /api/comments - Create comment (authenticated visitor only)
 */
export async function POST(request: Request) {
  // Auth check
  let session = null;
  try {
    session = await auth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let json;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate
  const parsed = commentBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Create comment
  try {
    const comment = await createComment(session.user.id, parsed.data.body);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return fromResult(toDbResult(error));
  }
}
