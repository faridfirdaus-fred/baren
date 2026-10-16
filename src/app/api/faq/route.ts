// E3-7: GET FAQ publik berurutan + POST FAQ (admin).

import { getDb } from "@/db";
import { faq } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import { readFaq, type FaqCreator, type FaqRow } from "@/lib/api/faq";
import { faqCreateSchema } from "@/lib/validation/faq";

export const dynamic = "force-dynamic";

function toRow(r: typeof faq.$inferSelect): FaqRow {
  return {
    id: r.id,
    question: r.question,
    answer: r.answer,
    sortOrder: r.sortOrder,
  };
}

function creator(): FaqCreator {
  const db = getDb();
  return {
    async create(input): Promise<FaqRow> {
      const rows = await db
        .insert(faq)
        .values({
          question: input.question,
          answer: input.answer,
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah FAQ.");
      return toRow(created);
    },
  };
}

/** Publik: FAQ berurutan. */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    const rows = await db.select().from(faq);
    const lister = { list: async () => rows.map(toRow) };
    return fromResult({ ok: true, data: await readFaq(lister) });
  } catch (error) {
    console.error("GET /api/faq gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah FAQ. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/faq");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, faqCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    return fromResult({
      ok: true,
      data: await creator().create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/faq gagal:", error);
    return fromResult(toDbResult(error));
  }
}
