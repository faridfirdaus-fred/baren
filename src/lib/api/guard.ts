// E3-1: guard admin bersama untuk Route Handler tipis.
// Hanya dipakai runtime Next (impor @/auth); TIDAK diimpor test node:test.

import { auth } from "@/auth";

import { checkAdmin, type SessionLike } from "./auth";
import { forbidden, internalError, unauthorized } from "./response";

/** Petakan sesi Auth.js ke SessionLike murni untuk checkAdmin(). */
export function toSessionLike(
  session: Awaited<ReturnType<typeof auth>>,
): SessionLike {
  const user = session?.user as
    { id?: unknown; role?: unknown } | null | undefined;
  if (!user) return null;
  return {
    user: {
      id: typeof user.id === "string" ? user.id : null,
      role: typeof user.role === "string" ? user.role : null,
    },
  };
}

/**
 * Guard mutasi admin. Kembalikan null bila lolos (lanjut handler),
 * atau Response 401/403/500 bila ditolak.
 */
export async function requireAdminResponse(
  label: string,
): Promise<Response | null> {
  let session: Awaited<ReturnType<typeof auth>>;
  try {
    session = await auth();
  } catch (error) {
    console.error(`${label} auth gagal:`, error);
    return internalError();
  }
  const checked = checkAdmin(toSessionLike(session));
  if (!checked.ok) {
    return checked.status === 401 ? unauthorized() : forbidden();
  }
  return null;
}
