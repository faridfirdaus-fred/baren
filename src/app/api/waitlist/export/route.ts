import { desc, ilike, or } from "drizzle-orm";

import { getDb } from "@/db";
import { waitlist } from "@/db/schema";
import { toDbResult } from "@/lib/api/db-errors";
import { requireAdminResponse } from "@/lib/api/guard";
import { fromResult } from "@/lib/api/response";
import { formatWaitlistCsv } from "@/lib/api/waitlist-csv";
import { parseWaitlistQuery } from "@/lib/api/waitlist-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminResponse("GET /api/waitlist/export");
  if (denied) return denied;

  const parsed = parseWaitlistQuery(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.ok) return fromResult(parsed);

  try {
    const db = getDb();
    const search = parsed.data.search;
    const predicate = search
      ? or(
          ilike(waitlist.email, `%${search}%`),
          ilike(waitlist.name, `%${search}%`),
        )
      : undefined;

    const rows = await db
      .select({
        id: waitlist.id,
        email: waitlist.email,
        name: waitlist.name,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .where(predicate)
      .orderBy(desc(waitlist.createdAt), desc(waitlist.id));

    const csv = formatWaitlistCsv(rows);
    const dateStamp = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="waitlist-${dateStamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/waitlist/export gagal:", error);
    return fromResult(toDbResult(error));
  }
}
