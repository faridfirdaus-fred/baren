import { auth } from "@/auth";

export type GuardResult =
  { ok: true; userId: string } | { ok: false; status: 401 | 403 };

// Kontrak E2-1/E3-1: guard identitas admin untuk Route Handler.
// 401 bila tanpa sesi, 403 bila sesi bukan admin.
export async function requireAdmin(): Promise<GuardResult> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false, status: 401 };
  if (user.role !== "admin") return { ok: false, status: 403 };
  return { ok: true, userId: user.id };
}

export async function requireSessionUser(): Promise<GuardResult> {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return { ok: false, status: 401 };
  return { ok: true, userId: user.id };
}
