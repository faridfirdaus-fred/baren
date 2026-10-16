// E3-4: GET about publik, PUT about admin (singleton baris pertama).

import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { about } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { readAbout, type AboutRow, type AboutStore } from "@/lib/api/game";
import { aboutUpdateSchema } from "@/lib/validation/game";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof about.$inferSelect): AboutRow {
  return { id: r.id, title: r.title, body: r.body, imageUrl: r.imageUrl };
}

function store(db: Db): AboutStore {
  return {
    async get(): Promise<AboutRow | null> {
      const rows = await db
        .select()
        .from(about)
        .orderBy(asc(about.id))
        .limit(1);
      return rows[0] ? toRow(rows[0]) : null;
    },
    async save(input): Promise<AboutRow> {
      const now = new Date();
      const values = {
        title: input.title,
        body: input.body,
        imageUrl: input.imageUrl ?? null,
        updatedAt: now,
      };
      const existing = await db
        .select({ id: about.id })
        .from(about)
        .orderBy(asc(about.id))
        .limit(1);
      const rows =
        existing[0] === undefined
          ? await db.insert(about).values(values).returning()
          : await db
              .update(about)
              .set(values)
              .where(eq(about.id, existing[0].id))
              .returning();
      const saved = rows[0];
      if (!saved) throw new Error("Gagal menyimpan about.");
      return toRow(saved);
    },
  };
}

/** Publik: about game. */
export async function GET(): Promise<Response> {
  try {
    return fromResult({ ok: true, data: await readAbout(store(getDb())) });
  } catch (error) {
    console.error("GET /api/about gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tulis about. */
export async function PUT(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/about");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, aboutUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const row = await store(getDb()).save(parsed.data);
    return fromResult({ ok: true, data: row });
  } catch (error) {
    console.error("PUT /api/about gagal:", error);
    return fromResult(toDbResult(error));
  }
}
