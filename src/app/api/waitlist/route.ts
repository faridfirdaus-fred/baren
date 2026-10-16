import { count, desc, ilike, or } from "drizzle-orm";

import { getDb, type Db } from "@/db";
import { waitlist } from "@/db/schema";
import { toDbResult } from "@/lib/api/db-errors";
import { requireAdminResponse } from "@/lib/api/guard";
import { fromResult } from "@/lib/api/response";
import { readWaitlistPage, type WaitlistLister } from "@/lib/api/waitlist";
import { parseWaitlistQuery } from "@/lib/api/waitlist-query";

export const dynamic = "force-dynamic";

function lister(db: Db): WaitlistLister {
  return {
    async list(search, page, perPage) {
      const predicate = search
        ? or(
            ilike(waitlist.email, `%${search}%`),
            ilike(waitlist.name, `%${search}%`),
          )
        : undefined;
      const [items, totals] = await Promise.all([
        db
          .select({
            id: waitlist.id,
            email: waitlist.email,
            name: waitlist.name,
            createdAt: waitlist.createdAt,
          })
          .from(waitlist)
          .where(predicate)
          .orderBy(desc(waitlist.createdAt), desc(waitlist.id))
          .limit(perPage)
          .offset((page - 1) * perPage),
        db.select({ total: count() }).from(waitlist).where(predicate),
      ]);
      return {
        items: items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
        total: totals[0]?.total ?? 0,
      };
    },
  };
}

export async function GET(request: Request) {
  const denied = await requireAdminResponse("GET /api/waitlist");
  if (denied) return denied;

  const parsed = parseWaitlistQuery(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.ok) return fromResult(parsed);

  try {
    return fromResult({
      ok: true,
      data: await readWaitlistPage(lister(getDb()), parsed.data),
    });
  } catch (error) {
    console.error("GET /api/waitlist gagal:", error);
    return fromResult(toDbResult(error));
  }
}
