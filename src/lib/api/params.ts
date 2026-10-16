// E3-1: parse parameter ID path menjadi integer positif.
// Tanpa impor runtime (hanya `import type`) agar teruji via node:test.

import type { ApiResult } from "./response";

/** "12" -> 12; "0", "-1", "1.5", "abc", "" -> 400 ID tidak valid. */
export function parseIdParam(raw: string): ApiResult<number> {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: { id: ["ID tidak valid."] },
    };
  }
  return { ok: true, data: id };
}

/** Parse ?page= menjadi integer >= 1 untuk paginasi. */
export function parsePageParam(raw: string | null): ApiResult<number> {
  if (raw === null) return { ok: true, data: 1 };
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: { page: ["Halaman tidak valid."] },
    };
  }
  return { ok: true, data: page };
}

/** Parse ?limit= menjadi integer 1..maks (default 9). */
export function parseLimitParam(
  raw: string | null,
  def = 9,
  maks = 9,
): ApiResult<number> {
  if (raw === null) return { ok: true, data: def };
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: { limit: ["Batas tidak valid."] },
    };
  }
  return { ok: true, data: Math.min(limit, maks) };
}
