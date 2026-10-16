// E3-4: GET features publik berurutan, POST fitur admin.

import { getDb } from "@/db";
import { features } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readFeatures,
  type FeatureCreator,
  type FeatureRow,
} from "@/lib/api/game";
import { featureCreateSchema } from "@/lib/validation/game";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof features.$inferSelect): FeatureRow {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    iconUrl: r.iconUrl,
    sortOrder: r.sortOrder,
  };
}

function creator(db: Db): FeatureCreator {
  return {
    async create(input) {
      const rows = await db
        .insert(features)
        .values({
          title: input.title,
          description: input.description ?? null,
          iconUrl: input.iconUrl ?? null,
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah fitur.");
      return toRow(created);
    },
  };
}

/** Publik: daftar fitur berurutan. */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    const rows = await db.select().from(features);
    const lister = { list: async () => rows.map(toRow) };
    return fromResult({ ok: true, data: await readFeatures(lister) });
  } catch (error) {
    console.error("GET /api/features gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah fitur. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/features");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, featureCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    return fromResult({
      ok: true,
      data: await creator(getDb()).create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/features gagal:", error);
    return fromResult(toDbResult(error));
  }
}
