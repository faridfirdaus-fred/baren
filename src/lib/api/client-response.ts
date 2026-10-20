// Helper parser amplop API di sisi klien.
// Sukses: { ok: true, data: T }
// Gagal: { ok: false, message: string, code?: string, fields?: Record<string, string[]> }

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      code?: string;
      fields?: Record<string, string[]>;
    };

export function parseApiEnvelope<T>(value: unknown): ApiEnvelope<T> {
  if (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === true &&
    "data" in value
  ) {
    return { ok: true, data: value.data as T };
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false
  ) {
    if (
      "error" in value &&
      typeof value.error === "object" &&
      value.error !== null
    ) {
      const err = value.error as Record<string, unknown>;
      const message =
        typeof err.message === "string" ? err.message : "Terjadi kesalahan.";
      const code = typeof err.code === "string" ? err.code : undefined;
      const fields =
        typeof err.fields === "object" && err.fields !== null
          ? (err.fields as Record<string, string[]>)
          : undefined;
      return { ok: false, message, code, fields };
    }

    if ("error" in value && typeof value.error === "string") {
      return { ok: false, message: value.error };
    }

    if ("message" in value && typeof value.message === "string") {
      return { ok: false, message: value.message };
    }

    return { ok: false, message: "Terjadi kesalahan pada server." };
  }

  return { ok: false, message: "Respons server tidak valid." };
}

export function apiErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === "object" && value !== null) {
    if (
      "error" in value &&
      typeof value.error === "object" &&
      value.error !== null &&
      "message" in value.error &&
      typeof value.error.message === "string"
    ) {
      return value.error.message;
    }
    if ("error" in value && typeof value.error === "string") {
      return value.error;
    }
    if ("message" in value && typeof value.message === "string") {
      return value.message;
    }
  }
  return fallback;
}
