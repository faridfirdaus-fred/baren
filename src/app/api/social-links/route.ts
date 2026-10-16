// E3-8: GET social links publik + POST (admin).

import { getDb } from "@/db";
import { socialLinks } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readSocialLinks,
  type SocialCreator,
  type SocialRow,
} from "@/lib/api/links";
import { socialCreateSchema } from "@/lib/validation/links";

export const dynamic = "force-dynamic";

function toRow(r: typeof socialLinks.$inferSelect): SocialRow {
  return { id: r.id, platform: r.platform, url: r.url, sortOrder: r.sortOrder };
}

/** Publik: tautan media sosial berurutan. */
export async function GET(): Promise<Response> {
  try {
    const db = getDb();
    const rows = await db.select().from(socialLinks);
    const lister = { list: async () => rows.map(toRow) };
    return fromResult({ ok: true, data: await readSocialLinks(lister) });
  } catch (error) {
    console.error("GET /api/social-links gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah tautan media sosial. */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/social-links");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, socialCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    const db = getDb();
    const creator: SocialCreator = {
      async create(input): Promise<SocialRow> {
        const rows = await db
          .insert(socialLinks)
          .values({
            platform: input.platform,
            url: input.url,
            sortOrder: input.sortOrder ?? 0,
          })
          .returning();
        const created = rows[0];
        if (!created) throw new Error("Gagal menambah tautan.");
        return toRow(created);
      },
    };
    return fromResult({
      ok: true,
      data: await creator.create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/social-links gagal:", error);
    return fromResult(toDbResult(error));
  }
}
