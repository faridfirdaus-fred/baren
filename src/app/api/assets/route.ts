import { NextResponse } from "next/server";

import { requireAdminForAssets } from "@/lib/assets-auth";

/**
 * Rute aset (E4-2/E4-5 menunggu E2-4 + E3-5).
 *
 * Perubahan keamanan: stub lama merespons `{ ok: true }` untuk siapa pun
 * tanpa auth. Sekarang fail-closed 401 sampai:
 * - E2-4 menerbitkan guard admin (`auth()`/role) dan
 * - E3-5/API + Data menyepakati tipe record/ownership untuk delete.
 *
 * PUT penerbit presigned URL dan DELETE aman diimplementasikan penuh
 * pada E4-2/E4-5 setelah dependensi tersebut Done di main.
 */

export async function PUT() {
  const guard = await requireAdminForAssets();
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.message },
      { status: guard.status },
    );
  }
  return NextResponse.json(
    { error: "Penerbitan presigned URL belum tersedia (E4-2 menunggu E2-4)." },
    { status: 501 },
  );
}

export async function DELETE() {
  const guard = await requireAdminForAssets();
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.message },
      { status: guard.status },
    );
  }
  return NextResponse.json(
    { error: "Hapus aset belum tersedia (E4-5 menunggu E2-4 dan E3-5)." },
    { status: 501 },
  );
}
