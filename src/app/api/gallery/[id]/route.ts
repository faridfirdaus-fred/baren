// E3-5: PUT/DELETE aset galeri per ID (admin).
// DELETE mengembalikan fileUrl agar E4-5 dapat menghapus objek R2-nya.

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { galleryAssets } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { GalleryById, GalleryRow } from "@/lib/api/gallery";
import {
  galleryUpdateSchema,
  type GalleryUpdate,
} from "@/lib/validation/gallery";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof galleryAssets.$inferSelect): GalleryRow {
  return {
    id: r.id,
    kind: (r.kind ?? "image") as GalleryRow["kind"],
    title: r.title,
    fileUrl: r.fileUrl,
    sortOrder: r.sortOrder,
  };
}

function byId(db: Db): GalleryById {
  return {
    async update(id: number, patch: GalleryUpdate): Promise<GalleryRow | null> {
      const set: {
        kind?: string;
        title?: string | null;
        fileUrl?: string;
        sortOrder?: number;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.kind !== undefined) set.kind = patch.kind;
      if (patch.title !== undefined) set.title = patch.title;
      if (patch.fileUrl !== undefined) set.fileUrl = patch.fileUrl;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(galleryAssets)
        .set(set)
        .where(eq(galleryAssets.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<GalleryRow | null> {
      const rows = await db
        .delete(galleryAssets)
        .where(eq(galleryAssets.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah aset (termasuk urutan via sortOrder). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/gallery/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, galleryUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Aset galeri");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/gallery/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus record aset (fileUrl dikembalikan untuk E4-5). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/gallery/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Aset galeri");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/gallery/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
