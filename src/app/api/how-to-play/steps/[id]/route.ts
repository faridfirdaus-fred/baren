// E3-4: PUT/DELETE langkah how-to-play per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { howToPlaySteps } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { StepById, StepRow } from "@/lib/api/game";
import { stepUpdateSchema, type StepUpdate } from "@/lib/validation/game";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof howToPlaySteps.$inferSelect): StepRow {
  return {
    id: r.id,
    step: r.step,
    title: r.title,
    description: r.description,
    mediaUrl: r.mediaUrl,
    sortOrder: r.sortOrder,
  };
}

function byId(db: Db): StepById {
  return {
    async update(id: number, patch: StepUpdate): Promise<StepRow | null> {
      const set: {
        step?: number;
        title?: string;
        description?: string | null;
        mediaUrl?: string | null;
        sortOrder?: number;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.step !== undefined) set.step = patch.step;
      if (patch.title !== undefined) set.title = patch.title;
      if (patch.description !== undefined) set.description = patch.description;
      if (patch.mediaUrl !== undefined) set.mediaUrl = patch.mediaUrl;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(howToPlaySteps)
        .set(set)
        .where(eq(howToPlaySteps.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<StepRow | null> {
      const rows = await db
        .delete(howToPlaySteps)
        .where(eq(howToPlaySteps.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah langkah (termasuk urutan via sortOrder). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/how-to-play/steps/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, stepUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Langkah");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/how-to-play/steps/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus langkah. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse(
    "DELETE /api/how-to-play/steps/[id]",
  );
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Langkah");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/how-to-play/steps/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
