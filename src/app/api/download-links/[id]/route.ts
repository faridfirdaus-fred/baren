// E3-8: PUT/DELETE download link per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { downloadLinks } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { DownloadById, DownloadRow } from "@/lib/api/links";
import {
  downloadUpdateSchema,
  type DownloadUpdate,
} from "@/lib/validation/links";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof downloadLinks.$inferSelect): DownloadRow {
  return {
    id: r.id,
    platform: r.platform,
    label: r.label,
    url: r.url,
    sortOrder: r.sortOrder,
  };
}

function byId(db: Db): DownloadById {
  return {
    async update(
      id: number,
      patch: DownloadUpdate,
    ): Promise<DownloadRow | null> {
      const set: {
        platform?: string;
        label?: string;
        url?: string;
        sortOrder?: number;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.platform !== undefined) set.platform = patch.platform;
      if (patch.label !== undefined) set.label = patch.label;
      if (patch.url !== undefined) set.url = patch.url;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(downloadLinks)
        .set(set)
        .where(eq(downloadLinks.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<DownloadRow | null> {
      const rows = await db
        .delete(downloadLinks)
        .where(eq(downloadLinks.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah tautan unduhan. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/download-links/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, downloadUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Tautan unduhan");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/download-links/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus tautan unduhan. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/download-links/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Tautan unduhan");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/download-links/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
