// E3-11: PUT/DELETE kartu per ID (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { landingCards } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult, notFound } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { parseIdParam } from "@/lib/api/params";
import type { LandingCardById, LandingCardRow } from "@/lib/api/landing-cards";
import {
  landingCardUpdateSchema,
  type LandingCardUpdate,
} from "@/lib/validation/landing-cards";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof landingCards.$inferSelect): LandingCardRow {
  return {
    id: r.id,
    slot: r.slot,
    eyebrow: r.eyebrow,
    title: r.title,
    subtitle: r.subtitle,
    body: r.body,
    imageUrl: r.imageUrl,
    ctaLabel: r.ctaLabel,
    ctaUrl: r.ctaUrl,
    tone: r.tone === "light" || r.tone === "ember" ? r.tone : "dark",
    sortOrder: r.sortOrder,
    isPublished: r.isPublished === 0 ? 0 : 1,
  };
}

function byId(db: Db): LandingCardById {
  return {
    async update(
      id: number,
      patch: LandingCardUpdate,
    ): Promise<LandingCardRow | null> {
      const set: {
        slot?: string;
        eyebrow?: string | null;
        title?: string;
        subtitle?: string | null;
        body?: string | null;
        imageUrl?: string | null;
        ctaLabel?: string | null;
        ctaUrl?: string | null;
        tone?: string;
        sortOrder?: number;
        isPublished?: number;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.slot !== undefined) set.slot = patch.slot;
      if (patch.eyebrow !== undefined) set.eyebrow = patch.eyebrow ?? null;
      if (patch.title !== undefined) set.title = patch.title;
      if (patch.subtitle !== undefined) set.subtitle = patch.subtitle ?? null;
      if (patch.body !== undefined) set.body = patch.body ?? null;
      if (patch.imageUrl !== undefined) set.imageUrl = patch.imageUrl ?? null;
      if (patch.ctaLabel !== undefined) set.ctaLabel = patch.ctaLabel ?? null;
      if (patch.ctaUrl !== undefined) set.ctaUrl = patch.ctaUrl ?? null;
      if (patch.tone !== undefined) set.tone = patch.tone;
      if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;
      if (patch.isPublished !== undefined) set.isPublished = patch.isPublished;
      const rows = await db
        .update(landingCards)
        .set(set)
        .where(eq(landingCards.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
    async remove(id: number): Promise<LandingCardRow | null> {
      const rows = await db
        .delete(landingCards)
        .where(eq(landingCards.id, id))
        .returning();
      return rows[0] ? toRow(rows[0]) : null;
    },
  };
}

/** Admin: ubah kartu (termasuk urutan via sortOrder). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/landing-cards/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  const parsed = await parseJsonBody(request, landingCardUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await byId(getDb()).update(id.data, parsed.data);
    if (!row) return notFound("Kartu");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/landing-cards/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: hapus kartu. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireAdminResponse("DELETE /api/landing-cards/[id]");
  if (denied) return denied;
  const { id: raw } = await params;
  const id = parseIdParam(raw);
  if (!id.ok) return fromResult(id);
  try {
    const row = await byId(getDb()).remove(id.data);
    if (!row) return notFound("Kartu");
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("DELETE /api/landing-cards/[id] gagal:", error);
    return fromResult(toDbResult(error));
  }
}
