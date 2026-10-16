// E3-1: pemetaan error DB ke ApiResult tanpa membocorkan detail sensitif.
// Pesan 500 selalu generik; pesan 409 berasal dari pemanggil (aman).
// Tanpa impor runtime (hanya `import type`) agar teruji via node:test.

import type { ApiResult } from "./response";

/** Deteksi pelanggaran unique constraint Postgres (Neon/Drizzle: code 23505). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "23505"
  );
}

/**
 * Ubah error DB menjadi ApiResult. `conflictMessage` dipakai untuk 409
 * (mis. "Slug sudah dipakai."); selain itu selalu 500 generik.
 */
export function toDbResult(
  error: unknown,
  conflictMessage?: string,
): ApiResult<never> {
  if (isUniqueViolation(error) && conflictMessage !== undefined) {
    return {
      ok: false,
      status: 409,
      code: "CONFLICT",
      message: conflictMessage,
    };
  }
  return {
    ok: false,
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Terjadi kesalahan pada server. Coba lagi nanti.",
  };
}
