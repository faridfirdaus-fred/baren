// E3-1: parse body JSON + validasi Zod server-side (NFR-SEC-02).
// Mengembalikan ApiResult plain (tanpa Response) agar teruji via node:test;
// route mengubahnya menjadi Response lewat fromResult().
// Impor runtime hanya `zod`; tipe dari "./response" via `import type`.

import { z } from "zod";

import type { ApiResult } from "./response";

/** Petakan Zod issues ke { "path.kolom": [pesan] }; root memakai "(data)". */
export function zodFields(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "(data)";
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

/**
 * Baca request.json() lalu validasi dengan skema.
 * - Body bukan JSON valid / kosong -> 400 "Isi permintaan bukan JSON yang valid."
 * - Gagal skema -> 400 + fields per kolom.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ApiResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Isi permintaan bukan JSON yang valid.",
    };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: zodFields(parsed.error),
    };
  }
  return { ok: true, data: parsed.data };
}
