// E3-3: POST banner hero (admin).

import { getDb } from "@/db";
import { heroBanners } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import type { BannerCreator, BannerRow } from "@/lib/api/hero";
import { bannerCreateSchema } from "@/lib/validation/hero";

export const dynamic = "force-dynamic";

function creator(): BannerCreator {
  const db = getDb();
  return {
    async create(input) {
      const rows = await db
        .insert(heroBanners)
        .values({ imageUrl: input.imageUrl, sortOrder: input.sortOrder ?? 0 })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah banner.");
      const row: BannerRow = {
        id: created.id,
        imageUrl: created.imageUrl,
        sortOrder: created.sortOrder,
      };
      return row;
    },
  };
}

/** Admin: tambah banner. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/hero/banners");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, bannerCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    return fromResult({
      ok: true,
      data: await creator().create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/hero/banners gagal:", error);
    return fromResult(toDbResult(error));
  }
}
