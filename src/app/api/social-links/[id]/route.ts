// E3-8: PUT/DELETE social link per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { socialLinks } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { SocialById, SocialRow } from "@/lib/api/links";
import { socialUpdateSchema, type SocialUpdate } from "@/lib/validation/links";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof socialLinks.$inferSelect): SocialRow {
  return { id: r.id, platform: r.platform, url: r.url, sortOrder: r.sortOrder };
}

function byId(db: Db): SocialById {
  return {
    async update(id: number, patch: SocialUpdate): Promise<SocialRow | null> {
      const set: {
        platform?: string;
        url?: string;
        sortOrder?: number;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };
      if (patch.platform !== undefined) set.platform = patch.platform;
      if (patch.url !== undefined) set.url = patch.url;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      const rows = await db
        .update(socialLinks)
        .set(set)
        .where(eq(socialLinks.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<SocialRow | null> {
      const rows = await db
        .delete(socialLinks)
        .where(eq(socialLinks.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah tautan media sosial. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/social-links/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, socialUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Tautan");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/social-links/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus tautan media sosial. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/social-links/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Tautan");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/social-links/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
