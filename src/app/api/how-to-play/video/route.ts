// E3-4: PUT video demo how-to-play (admin, singleton baris pertama).

import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { howToPlayVideo } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import type { VideoStore } from "@/lib/api/game";
import { videoUpdateSchema } from "@/lib/validation/game";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function store(db: Db): VideoStore {
  return {
    async get(): Promise<string | null> {
      const rows = await db
        .select()
        .from(howToPlayVideo)
        .orderBy(asc(howToPlayVideo.id))
        .limit(1);
      return rows[0]?.videoUrl ?? null;
    },
    async save(videoUrl: string): Promise<string> {
      const existing = await db
        .select({ id: howToPlayVideo.id })
        .from(howToPlayVideo)
        .orderBy(asc(howToPlayVideo.id))
        .limit(1);
      const rows =
        existing[0] === undefined
          ? await db.insert(howToPlayVideo).values({ videoUrl }).returning()
          : await db
              .update(howToPlayVideo)
              .set({ videoUrl, updatedAt: new Date() })
              .where(eq(howToPlayVideo.id, existing[0].id))
              .returning();
      const saved = rows[0];
      if (!saved) throw new Error("Gagal menyimpan video.");
      return saved.videoUrl;
    },
  };
}

/** Admin: ubah video demo. */
export async function PUT(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("PUT /api/how-to-play/video");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, videoUpdateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const videoUrl = await store(getDb()).save(parsed.data.videoUrl);
    return fromResult({ ok: true, data: { videoUrl } });
  } catch (error) {
    console.error("PUT /api/how-to-play/video gagal:", error);
    return fromResult(toDbResult(error));
  }
}
