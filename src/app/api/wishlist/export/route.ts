import { desc, ilike, or } from "drizzle-orm";

import { getDb } from "@/db";
import { wishlist } from "@/db/schema";
import { toDbResult } from "@/lib/api/db-errors";
import { requireAdminResponse } from "@/lib/api/guard";
import { fromResult } from "@/lib/api/response";
import { formatWishlistCsv } from "@/lib/api/wishlist-csv";
import { parseWishlistQuery } from "@/lib/api/wishlist-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminResponse("GET /api/wishlist/export");
  if (denied) return denied;

  const parsed = parseWishlistQuery(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.ok) return fromResult(parsed);

  try {
    const db = getDb();
    const search = parsed.data.search;
    const predicate = search
      ? or(
          ilike(wishlist.email, `%${search}%`),
          ilike(wishlist.name, `%${search}%`),
        )
      : undefined;

    const rows = await db
      .select({
        id: wishlist.id,
        email: wishlist.email,
        name: wishlist.name,
        createdAt: wishlist.createdAt,
      })
      .from(wishlist)
      .where(predicate)
      .orderBy(desc(wishlist.createdAt), desc(wishlist.id));

    const csv = formatWishlistCsv(rows);
    const dateStamp = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wishlist-${dateStamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/wishlist/export gagal:", error);
    return fromResult(toDbResult(error));
  }
}
