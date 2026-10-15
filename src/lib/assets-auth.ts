/**
 * Guard admin sementara untuk rute aset (E4-2/E4-5 menunggu E2-4).
 *
 * Kontrak dari jalur Data/Identitas (E2-1/E2-4) belum terbit di main,
 * sehingga belum ada `auth()`/guard role yang bisa dipakai. Agar stub lama
 * yang merespons sukses palsu tidak terekspos, rute aset fail-closed:
 * kembalikan 401 sampai guard admin asli tersedia.
 *
 * Ketika E2-4 Done, ganti isi fungsi ini dengan pemanggilan guard asli,
 * mis. `auth()` + cek role admin (401 anonim, 403 non-admin).
 */
export type AdminGuardResult =
  { ok: true } | { ok: false; status: 401 | 403; message: string };

declare global {
  // Hook opsional yang dipasang jalur Data/Identitas setelah E2-4 Done.
  var __barenRequireAdmin: (() => Promise<AdminGuardResult>) | undefined;
}

export async function requireAdminForAssets(): Promise<AdminGuardResult> {
  try {
    if (typeof globalThis.__barenRequireAdmin === "function") {
      return await globalThis.__barenRequireAdmin();
    }
  } catch {
    // Abaikan dan fallback ke 401 di bawah.
  }
  return {
    ok: false,
    status: 401,
    message: "Autentikasi admin belum tersedia (E2-4).",
  };
}
