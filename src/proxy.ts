import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";

// E2-4: proteksi semua /admin kecuali /admin/login. Konvensi proxy Next.js 16.
// Guard role admin server-side juga ditegakkan di tiap handler/page.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (role !== "admin") {
    return NextResponse.redirect(
      new URL("/admin/login?error=AksesDitolak", request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
