// E3-4: PUT/DELETE fitur per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { features } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { FeatureById, FeatureRow } from "@/lib/api/game";
import { featureUpdateSchema, type FeatureUpdate } from "@/lib/validation/game";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof features.$inferSelect): FeatureRow {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    iconUrl: r.iconUrl,
    sortOrder: r.sortOrder,
  };
}

function byId(db: Db): FeatureById {
  return {
    async update(id: number, patch: FeatureUpdate): Promise<FeatureRow | null> {
      const set: {
        title?: string;
        description?: string | null;
        iconUrl?: string | null;
        sortOrder?: number;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.title !== undefined) set.title = patch.title;
      if (patch.description !== undefined) set.description = patch.description;
      if (patch.iconUrl !== undefined) set.iconUrl = patch.iconUrl;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(features)
        .set(set)
        .where(eq(features.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<FeatureRow | null> {
      const rows = await db
        .delete(features)
        .where(eq(features.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah fitur (termasuk urutan via sortOrder). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/features/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, featureUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Fitur");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/features/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus fitur. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/features/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Fitur");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/features/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
