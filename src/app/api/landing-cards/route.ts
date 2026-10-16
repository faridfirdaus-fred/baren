// E3-11: GET kartu terbit (publik) + POST kartu (admin).

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

/** Publik: kartu terbit berurutan. */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    const rows = await db.select().from(landingCards);
    const lister = { list: async () => rows.map(toRow) };
    return fromResult({ ok: true, data: await readLandingCards(lister) });
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
    return fromResult({
      ok: true,
      data: await creator(getDb()).create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/landing-cards gagal:", error);
    return fromResult(toDbResult(error));
  }
}
