import { count, desc, ilike, or } from "drizzle-orm";

import { getDb } from "@/db";
import { waitlist } from "@/db/schema";
import { toDbResult } from "@/lib/api/db-errors";
import { requireAdminResponse } from "@/lib/api/guard";
import { fromResult } from "@/lib/api/response";
import { WAITLIST_PER_PAGE, readWaitlistPage } from "@/lib/api/waitlist";
import { waitlistQuerySchema } from "@/lib/validation/waitlist";

export const dynamic = "force-dynamic";

/**
 * GET /api/waitlist - Daftar waitlist dengan pagination dan search
 *
 * Query params:
 * - page: nomor halaman (default 1)
 * - search: pencarian email atau nama (optional, case-insensitive)
 *
 * Auth: admin only
 */
export async function GET(request: Request) {
  // Guard: admin only
  const denied = await requireAdminResponse("GET /api/waitlist");
  if (denied) return denied;

  // Parse dan validasi query parameters
  const searchParams = new URL(request.url).searchParams;
  const rawQuery = {
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };

  const parsed = waitlistQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return fromResult({
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali parameter query.",
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  const { page, search } = parsed.data;

  try {
    const db = getDb();

    // Buat kondisi filter: tanpa search = tanpa WHERE, dengan search = ilike email OR name
    const filterCondition = search
      ? or(
          ilike(waitlist.email, `%${search}%`),
          ilike(waitlist.name, `%${search}%`),
        )
      : undefined;

    // Query count dan rows dengan kondisi yang sama
    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: waitlist.id,
          email: waitlist.email,
          name: waitlist.name,
          createdAt: waitlist.createdAt,
        })
        .from(waitlist)
        .where(filterCondition)
        .orderBy(desc(waitlist.createdAt), desc(waitlist.id))
        .limit(WAITLIST_PER_PAGE)
        .offset((page - 1) * WAITLIST_PER_PAGE),
      db.select({ count: count() }).from(waitlist).where(filterCondition),
    ]);

    // Serialisasi createdAt ke ISO string
    const items = rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
    }));

    const total = totalResult[0]?.count ?? 0;

    // Masukkan ke readWaitlistPage untuk pagination metadata
    const result = readWaitlistPage({ items, total }, { page, search });

    return fromResult({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error("GET /api/waitlist gagal:", error);
    return fromResult(toDbResult(error));
  }
}
