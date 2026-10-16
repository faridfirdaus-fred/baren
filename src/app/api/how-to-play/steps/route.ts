// E3-4: POST langkah how-to-play (admin).

import { getDb } from "@/db";
import { howToPlaySteps } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import type { StepCreator, StepRow } from "@/lib/api/game";
import { stepCreateSchema } from "@/lib/validation/game";

export const dynamic = "force-dynamic";

function creator(): StepCreator {
  const db = getDb();
  return {
    async create(input): Promise<StepRow> {
      const rows = await db
        .insert(howToPlaySteps)
        .values({
          step: input.step,
          title: input.title,
          description: input.description ?? null,
          mediaUrl: input.mediaUrl ?? null,
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah langkah.");
      return {
        id: created.id,
        step: created.step,
        title: created.title,
        description: created.description,
        mediaUrl: created.mediaUrl,
        sortOrder: created.sortOrder,
      };
    },
  };
}

/** Admin: tambah langkah. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/how-to-play/steps");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, stepCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    return fromResult({
      ok: true,
      data: await creator().create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/how-to-play/steps gagal:", error);
    return fromResult(toDbResult(error));
  }
}
