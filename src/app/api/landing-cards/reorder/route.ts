// E3-11: PUT urutan kartu (admin) via daftar ID berurutan.

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { landingCards } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { landingCardReorderSchema } from "@/lib/validation/landing-cards";

export const dynamic = "force-dynamic";

/** Admin: tulis ulang sortOrder sesuai urutan ID. */
export async function PUT(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/landing-cards/reorder");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, landingCardReorderSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const db = getDb();
    for (const [index, id] of parsed.data.ids.entries()) {
      await db
        .update(landingCards)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(landingCards.id, id));
    }
    return fromResult({ ok: true, data: { updated: parsed.data.ids.length } });
  } catch (error) {
    console.error("PUT /api/landing-cards/reorder gagal:", error);
    return fromResult(toDbResult(error));
  }
}
