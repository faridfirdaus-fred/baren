// E3-11: GET kartu terbit (publik) + POST kartu (admin).

import { asc } from "drizzle-orm";

import { getDb } from "@/db";
import { landingCards } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readLandingCards,
  type LandingCardCreator,
  type LandingCardRow,
} from "@/lib/api/landing-cards";
import { landingCardCreateSchema } from "@/lib/validation/landing-cards";
import { revalidateSite } from "@/lib/api/revalidate";

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

function creator(db: Db): LandingCardCreator {
  return {
    async create(input): Promise<LandingCardRow> {
      const rows = await db
        .insert(landingCards)
        .values({
          slot: input.slot ?? "general",
          eyebrow: input.eyebrow ?? null,
          title: input.title,
          subtitle: input.subtitle ?? null,
          body: input.body ?? null,
          imageUrl: input.imageUrl ?? null,
          ctaLabel: input.ctaLabel ?? null,
          ctaUrl: input.ctaUrl ?? null,
          tone: input.tone ?? "dark",
          sortOrder: input.sortOrder ?? 0,
          isPublished: input.isPublished ?? 1,
        })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah kartu.");
      return toRow(created);
    },
  };
}

/** Publik: kartu terbit berurutan. Admin: ?scope=admin (semua status) + opsi ?slot= */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope");
    const slot = url.searchParams.get("slot");
    const db = getDb();

    if (scope === "admin") {
      const denied = await requireAdminResponse(
        "GET /api/landing-cards?scope=admin",
      );
      if (denied) return denied;
      const rows = await db
        .select()
        .from(landingCards)
        .orderBy(asc(landingCards.sortOrder), asc(landingCards.id));
      const mapped = rows.map(toRow);
      const filtered = slot
        ? mapped.filter((r) => r.slot.toLowerCase() === slot.toLowerCase())
        : mapped;
      return fromResult({ ok: true, data: filtered });
    }

    const rows = await db.select().from(landingCards);
    const lister = { list: async () => rows.map(toRow) };
    const published = await readLandingCards(lister);
    const filtered = slot
      ? published.filter((r) => r.slot.toLowerCase() === slot.toLowerCase())
      : published;
    return fromResult({ ok: true, data: filtered });
  } catch (error) {
    console.error("GET /api/landing-cards gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah kartu. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/landing-cards");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, landingCardCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const created = await creator(getDb()).create(parsed.data);
    revalidateSite();
    return fromResult({
      ok: true,
      data: created,
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/landing-cards gagal:", error);
    return fromResult(toDbResult(error));
  }
}
