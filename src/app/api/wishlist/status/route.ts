import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth, normalizeEmail } from "@/auth";
import { getDb } from "@/db";
import { wishlist } from "@/db/schema";

export const dynamic = "force-dynamic";

// E11-3: status dibatasi identitas sesi pemilik.
export async function GET() {
  let session = null;
  try {
    session = await auth();
  } catch {
    return NextResponse.json({ registered: false }, { status: 401 });
  }
  const email = session?.user?.email ? normalizeEmail(session.user.email) : "";
  if (!email) return NextResponse.json({ registered: false }, { status: 401 });
  const rows = await getDb()
    .select()
    .from(wishlist)
    .where(eq(wishlist.email, email))
    .limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ registered: false, email });
  return NextResponse.json({
    registered: true,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
  });
}
