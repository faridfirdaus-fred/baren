// E3-5: PUT/DELETE aset galeri per ID (admin).
// DELETE mengembalikan fileUrl agar E4-5 dapat menghapus objek R2-nya.
// E8-6: DELETE juga membersihkan objek R2 server-side (urutan DB->R2):
// record dihapus dulu, lalu key diturunkan dari fileUrl via
// keyFromPublicUrl dan objek dihapus idempoten. Gagal cleanup R2 tidak
// menggagalkan penghapusan record (dilaporkan via r2Deleted:false).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { galleryAssets } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import { deleteAssetObject } from "@/lib/api/assets";
import { deleteAsset, keyFromPublicUrl, verifyStoredAsset } from "@/lib/r2";
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

/** Admin: hapus record aset + bersihkan objek R2-nya (E8-6, DB->R2). */
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
    let r2Deleted = false;
    try {
      const key = keyFromPublicUrl(row.fileUrl);
      const cleaned = await deleteAssetObject(
        {
          head: async (k) => verifyStoredAsset(k),
          remove: (k) => deleteAsset(k),
        },
        key,
      );
      r2Deleted = cleaned.ok && cleaned.data.deleted;
    } catch (error) {
      console.error(
        `DELETE /api/gallery/[id] cleanup R2 gagal (id=${id.data}):`,
        error instanceof Error ? error.message : error,
      );
    }
    return fromResult({ ok: true, data: { ...row, r2Deleted } });
  } catch (error) {
    console.error("DELETE /api/gallery/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
