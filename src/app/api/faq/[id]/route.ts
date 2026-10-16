// E3-7: PUT/DELETE FAQ per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { faq } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { FaqById, FaqRow } from "@/lib/api/faq";
import { faqUpdateSchema, type FaqUpdate } from "@/lib/validation/faq";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof faq.$inferSelect): FaqRow {
  return {
    id: r.id,
    question: r.question,
    answer: r.answer,
    sortOrder: r.sortOrder,
  };
}

function byId(db: Db): FaqById {
  return {
    async update(id: number, patch: FaqUpdate): Promise<FaqRow | null> {
      const set: {
        question?: string;
        answer?: string;
        sortOrder?: number;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.question !== undefined) set.question = patch.question;
      if (patch.answer !== undefined) set.answer = patch.answer;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(faq)
        .set(set)
        .where(eq(faq.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<FaqRow | null> {
      const rows = await db.delete(faq).where(eq(faq.id, id)).returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah FAQ (termasuk urutan via sortOrder). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/faq/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, faqUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("FAQ");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/faq/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus FAQ. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/faq/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("FAQ");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/faq/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
