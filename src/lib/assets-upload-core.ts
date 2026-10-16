// E4-6: inti keputusan upload tanpa impor runtime (teruji node:test).
// Pola E3: tanpa impor relatif agar type-stripping Node bisa memuatnya.
// Fungsi yang butuh fetch/XHR tetap di `assets-client.ts` dan memakai
// helper di sini untuk pemetaan pesan + keputusan retry.

/** Triple presign dari `PUT /api/assets` — diganti atomik saat retry. */
export type PresignTriple = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
};

/** Hasil unggah satu file ke R2 (belum termasuk simpan metadata CMS). */
export type UploadedAsset = {
  key: string;
  publicUrl: string;
  name: string;
  size: number;
  mimeType: string;
};

export type UploadProgress = (loaded: number, total: number) => void;

export type PresignErrorKind =
  "unauthorized" | "forbidden" | "validation" | "server" | "network";

export type PresignError = { kind: PresignErrorKind; message: string };

export type PutErrorKind = "aborted" | "signature" | "ambiguous";

export type PutError =
  | { kind: "aborted" }
  | { kind: "signature"; message: string }
  | { kind: "ambiguous"; message: string };

/** Pesan Indonesia per status presign (401/403 tetap, sisanya dari server). */
export function presignErrorForStatus(
  status: number,
  serverMessage?: string,
): PresignError {
  if (status === 401)
    return {
      kind: "unauthorized",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  if (status === 403)
    return {
      kind: "forbidden",
      message: "Akun Anda tidak memiliki hak akses admin.",
    };
  if (status === 400)
    return {
      kind: "validation",
      message: serverMessage ?? "Validasi gagal. Coba lagi.",
    };
  return {
    kind: "server",
    message: serverMessage ?? "Gagal meminta URL unggah. Coba lagi.",
  };
}

/** Validasi bentuk triple presign (key/uploadUrl/publicUrl wajib ada). */
export function isPresignTriple(value: unknown): value is PresignTriple {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" &&
    v.key.length > 0 &&
    typeof v.uploadUrl === "string" &&
    v.uploadUrl.length > 0 &&
    typeof v.publicUrl === "string" &&
    v.publicUrl.length > 0
  );
}

/** Keputusan error PUT XHR berdasarkan status HTTP. */
export function putErrorForStatus(status: number): PutError {
  if (status === 403)
    return {
      kind: "signature",
      message:
        "Unggahan ditolak R2 (kemungkinan tipe konten berubah atau URL rusak). Minta URL baru lalu coba lagi.",
    };
  return {
    kind: "ambiguous",
    message: `Unggahan gagal (status ${status || "jaringan"}). Coba lagi.`,
  };
}

/**
 * Retry PUT-ambigu mengganti triple secara atomik: pemanggil WAJIB memanggil
 * `requestPresign` ulang dan memakai ketiga nilai baru sekaligus. Helper ini
 * menegaskan kontrak: triple lama tak boleh dipakai ulang.
 */
export function nextRetryTriple(fresh: PresignTriple): PresignTriple {
  return {
    key: fresh.key,
    uploadUrl: fresh.uploadUrl,
    publicUrl: fresh.publicUrl,
  };
}
