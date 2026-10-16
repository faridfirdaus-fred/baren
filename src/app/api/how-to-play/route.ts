// E3-4: GET how-to-play publik (langkah berurutan + video demo).

import { getDb } from "@/db";
import { howToPlaySteps, howToPlayVideo } from "@/db/schema";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { readHowToPlay, type StepLister, type StepRow } from "@/lib/api/game";

export const dynamic = "force-dynamic";

function steps(db: ReturnType<typeof getDb>): StepLister {
  return {
    async list(): Promise<StepRow[]> {
      const rows = await db.select().from(howToPlaySteps);
      return rows.map((r) => ({
        id: r.id,
        step: r.step,
        title: r.title,
        description: r.description,
        mediaUrl: r.mediaUrl,
        sortOrder: r.sortOrder,
      }));
    },
  };
}

function video(db: ReturnType<typeof getDb>): {
  get(): Promise<string | null>;
} {
  return {
    async get(): Promise<string | null> {
      const rows = await db.select().from(howToPlayVideo).limit(1);
      return rows[0]?.videoUrl ?? null;
    },
  };
}

/** Publik: langkah bernomor berurutan + video demo (bisa null). */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    return fromResult({
      ok: true,
      data: await readHowToPlay(steps(db), video(db)),
    });
  } catch (error) {
    console.error("GET /api/how-to-play gagal:", error);
    return fromResult(toDbResult(error));
  }
}
