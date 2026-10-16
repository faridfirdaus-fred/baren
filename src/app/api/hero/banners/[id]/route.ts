// E3-3: PUT/DELETE banner hero per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { heroBanners } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { BannerById, BannerRow } from "@/lib/api/hero";
import { bannerUpdateSchema, type BannerUpdate } from "@/lib/validation/hero";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof heroBanners.$inferSelect): BannerRow {
  return { id: r.id, imageUrl: r.imageUrl, sortOrder: r.sortOrder };
}

function byId(db: Db): BannerById {
  return {
    async update(id: number, patch: BannerUpdate): Promise<BannerRow | null> {
      const set: { imageUrl?: string; sortOrder?: number; updatedAt: Date } = {
        updatedAt: new Date(),
      };
      if (patch.imageUrl !== undefined) set.imageUrl = patch.imageUrl;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(heroBanners)
        .set(set)
        .where(eq(heroBanners.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<BannerRow | null> {
      const rows = await db
        .delete(heroBanners)
        .where(eq(heroBanners.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

async function guard(): Promise<Response | null> {
  return requireAdminResponse("Banner [id]");
}

/** Admin: ubah banner (termasuk urutan via sortOrder). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await guard();
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, bannerUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const db = getDb();
    const row = await byId(db).update(id.data, parsed.data);
    if (!row) return notFound("Banner");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/hero/banners/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus banner. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await guard();
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const db = getDb();
    const row = await byId(db).remove(id.data);
    if (!row) return notFound("Banner");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/hero/banners/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
