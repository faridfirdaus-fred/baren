// E3-8: GET download links publik + POST (admin).
// Daftar kosong = game belum rilis, UI tampilkan "Segera Hadir" (FR-PUB-25).

import { getDb } from "@/db";
import { downloadLinks } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readDownloadLinks,
  type DownloadCreator,
  type DownloadRow,
} from "@/lib/api/links";
import { downloadCreateSchema } from "@/lib/validation/links";

export const dynamic = "force-dynamic";

function toRow(r: typeof downloadLinks.$inferSelect): DownloadRow {
  return {
    id: r.id,
    platform: r.platform,
    label: r.label,
    url: r.url,
    sortOrder: r.sortOrder,
  };
}

/** Publik: tautan unduhan berurutan. */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    const rows = await db.select().from(downloadLinks);
    const lister = { list: async () => rows.map(toRow) };
    return fromResult({ ok: true, data: await readDownloadLinks(lister) });
  } catch (error) {
    console.error("GET /api/download-links gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah tautan unduhan. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/download-links");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, downloadCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const db = getDb();
    const creator: DownloadCreator = {
      async create(input): Promise<DownloadRow> {
        const rows = await db
          .insert(downloadLinks)
          .values({
            platform: input.platform,
            label: input.label,
            url: input.url,
            sortOrder: input.sortOrder ?? 0,
          })
          .returning();
        const created = rows[0];
        if (!created) throw new Error("Gagal menambah tautan unduhan.");
        return toRow(created);
      },
    };
    return fromResult({
      ok: true,
      data: await creator.create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/download-links gagal:", error);
    return fromResult(toDbResult(error));
  }
}
