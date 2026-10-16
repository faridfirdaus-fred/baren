// E3-1: guard admin untuk Route Handler (401 anonim, 403 non-admin).
// Murni sinkron dan tanpa impor runtime: sesi diteruskan pemanggil
// (route memetakan hasil auth() ke SessionLike), sehingga mudah diuji
// via node:test tanpa memalsukan Auth.js. Hanya `import type`.

export type SessionLike = {
  user?: { id?: string | null; role?: string | null } | null;
} | null;

export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; code: "UNAUTHORIZED" | "FORBIDDEN" };

/**
 * Cek identitas admin; samakan dengan kontrak E2-4 (role persis "admin").
 * Pesan Indonesia terpusat di response.ts (unauthorized()/forbidden());
 * di sini hanya status + code agar satu sumber kebenaran.
 */
export function checkAdmin(session: SessionLike | undefined): AdminCheck {
  const user = session?.user;
  if (!user?.id) {
    return { ok: false, status: 401, code: "UNAUTHORIZED" };
  }
  if (user.role !== "admin") {
    return { ok: false, status: 403, code: "FORBIDDEN" };
  }
  return { ok: true, userId: user.id };
}
