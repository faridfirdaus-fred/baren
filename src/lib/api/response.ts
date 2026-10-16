// E3-1: amplop respons JSON standar seluruh Route Handler konten.
// Sukses: { ok: true, data }. Gagal: { ok: false, error: { code, message, fields? } }.
// Berkas ini tanpa impor relatif agar dapat diuji via node:test (type stripping).

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export type ApiSuccess<T> = { ok: true; data: T };

export type ApiFailureBody = {
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string[]>;
};

export type ApiResult<T> =
  | { ok: true; data: T; status?: number }
  | {
      ok: false;
      status: number;
      code: ApiErrorCode;
      message: string;
      fields?: Record<string, string[]>;
    };

function json(body: unknown, status: number): Response {
  return Response.json(body, { status });
}

/** 200 (atau status kustom) dengan amplop sukses. */
export function ok<T>(data: T, status = 200): Response {
  return json({ ok: true, data } satisfies ApiSuccess<T>, status);
}

/** Respons gagal konsisten; fields hanya ada bila diberikan. */
export function fail(
  code: ApiErrorCode,
  message: string,
  status: number,
  fields?: Record<string, string[]>,
): Response {
  const error: ApiFailureBody =
    fields === undefined ? { code, message } : { code, message, fields };
  return json({ ok: false, error }, status);
}

/** Ubah ApiResult plain (dari parse/auth/service) menjadi Response. */
export function fromResult<T>(result: ApiResult<T>): Response {
  if (result.ok) return ok(result.data, result.status ?? 200);
  return fail(result.code, result.message, result.status, result.fields);
}

/** 401: tanpa sesi admin. */
export function unauthorized(): Response {
  return fail(
    "UNAUTHORIZED",
    "Sesi tidak ditemukan. Silakan masuk kembali.",
    401,
  );
}

/** 403: sesi ada tetapi bukan admin. */
export function forbidden(): Response {
  return fail("FORBIDDEN", "Akun Anda tidak memiliki hak akses admin.", 403);
}

/** 404 generik per resource. */
export function notFound(resource = "Data"): Response {
  return fail("NOT_FOUND", `${resource} tidak ditemukan.`, 404);
}

/** 400 validasi dengan pesan per kolom. */
export function validationFailed(fields: Record<string, string[]>): Response {
  return fail(
    "VALIDATION_ERROR",
    "Validasi gagal. Periksa kembali kolom yang ditandai.",
    400,
    fields,
  );
}

/** 409 konflik unik (mis. slug ganda). */
export function conflict(message: string): Response {
  return fail("CONFLICT", message, 409);
}

/** 500 generik — jangan pernah sertakan detail internal. */
export function internalError(): Response {
  return fail(
    "INTERNAL_ERROR",
    "Terjadi kesalahan pada server. Coba lagi nanti.",
    500,
  );
}
