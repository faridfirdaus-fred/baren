import { getCloudflareContext } from "@opennextjs/cloudflare";
import { decode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// E2-4: proteksi semua /admin kecuali /admin/login. Konvensi proxy Next.js 16.
// Guard role admin server-side juga ditegakkan di tiap handler/page.
//
// Catatan: Auth.js v5 beta `auth(request)` di konteks proxy TIDAK
// mengembalikan sesi — ia menjalankan pipeline middleware dan mengembalikan
// Response (terbukti: cookie valid + secret benar, sesi tetap null). Karena
// itu proxy memverifikasi JWT sesi secara langsung dengan `next-auth/jwt`.
// Klaim `role` ditulis saat login (lihat `callbacks.jwt` di `src/auth.ts`);
// handler/route tetap wajib cek role ke DB (`requireAdmin`) karena klaim
// token bisa basi bila role diubah setelah login.
const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

function getRequestSecret(): string | undefined {
  try {
    const { env } = getCloudflareContext();
    const fromBinding = (env as { AUTH_SECRET?: string }).AUTH_SECRET;
    if (fromBinding) return fromBinding;
  } catch {
    // Di luar runtime Workers: pakai process.env.
  }
  return process.env.AUTH_SECRET;
}

function readSessionCookie(
  request: NextRequest,
): { name: string; value: string } | null {
  const direct =
    request.cookies.get(SECURE_SESSION_COOKIE) ??
    request.cookies.get(SESSION_COOKIE);
  if (direct?.value) return { name: direct.name, value: direct.value };
  // Fallback cookie ter-chunk (`<nama>.0`, `<nama>.1`, ...) bila token besar.
  for (const name of [SECURE_SESSION_COOKIE, SESSION_COOKIE]) {
    const first = request.cookies.get(`${name}.0`);
    if (!first?.value) continue;
    let value = first.value;
    for (let i = 1; ; i += 1) {
      const part = request.cookies.get(`${name}.${i}`);
      if (!part?.value) break;
      value += part.value;
    }
    return { name, value };
  }
  return null;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const loginUrl = new URL("/admin/login", request.url);
  const found = readSessionCookie(request);
  const secret = getRequestSecret();
  if (!found || !secret) {
    return NextResponse.redirect(loginUrl);
  }
  let role: unknown = null;
  try {
    // Salt = nama cookie, sama seperti yang dipakai Auth.js saat sign/verify.
    // `decode` menolak token kedaluwarsa (E2-3: maxAge 60 menit).
    const payload = await decode({
      token: found.value,
      secret,
      salt: found.name,
    });
    role = (payload as { role?: unknown } | null)?.role ?? null;
  } catch {
    return NextResponse.redirect(loginUrl);
  }
  if (role !== "admin") {
    // Termasuk sesi tanpa klaim role (mis. pengunjung Google): tolak dengan
    // sinyal yang sama seperti halaman (lihat `src/app/admin/page.tsx`).
    loginUrl.searchParams.set("error", "AksesDitolak");
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
