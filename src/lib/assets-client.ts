/**
 * Validasi klien untuk uploader admin (E4-6; hanya UX, keputusan akhir di
 * server). Aturan disamakan dengan `src/lib/assets-validation.ts`.
 * Mendukung drag/drop + fallback pilih file, progress via XHR, preview,
 * status error, dan keyboard.
 *
 * Alur upload E4-6 (direct-to-R2, tanpa byte via Worker):
 * 1. `requestPresign()` minta `{key,uploadUrl,publicUrl}` sesaat sebelum
 *    tiap file diunggah (just-in-time; jangan antrekan URL sejak awal).
 * 2. `putToR2()` PUT langsung ke `uploadUrl` dengan header `Content-Type`
 *    persis (ikut ditandatangani; beda -> 403 SignatureDoesNotMatch).
 * 3. Retry mengganti triple `(key,uploadUrl,publicUrl)` secara ATOMIK —
 *    jangan pernah pakai key lama + URL baru atau sebaliknya.
 * 4. `onUploaded` = "objek terunggah ke R2", BUKAN "record CMS tersimpan"
 *    (pemisahan E4 vs E8-6). Tanpa callback -> status akhir "Terunggah ke
 *    R2"; callback async -> "Menyimpan metadata…"; gagal -> retry simpan
 *    tanpa reupload.
 *
 * Kegagalan ambigu (mis. error jaringan tanpa CORS header dari R2, sehingga
 * ExpiredRequest tak terbaca JS) -> tombol "Coba Lagi" manual, bukan
 * retry-buta. Retry otomatis hanya untuk kedaluwarsa yang yakin.
 */

import {
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  isSvgPurpose,
  maxBytesForMime,
} from "./assets-validation";
import {
  isPresignTriple,
  presignErrorForStatus,
  putErrorForStatus,
  type PresignTriple,
  type PresignError,
  type PutError,
  type UploadedAsset,
  type UploadProgress,
} from "./assets-upload-core";

export type {
  PresignTriple,
  PresignError,
  PutError,
  UploadedAsset,
  UploadProgress,
};

export type ClientFileCheck = { ok: true } | { ok: false; message: string };

const ACCEPT_BY_PURPOSE: Record<string, string[]> = {
  gallery: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
  hero: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
  news: ["image/jpeg", "image/png", "image/webp"],
  logo: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  ikon: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  icon: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  favicon: ["image/svg+xml", "image/png"],
  default: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
};

export function acceptedMimeTypes(purpose: string): string[] {
  return (
    ACCEPT_BY_PURPOSE[purpose.trim().toLowerCase()] ?? ACCEPT_BY_PURPOSE.default
  );
}

export function acceptedAttr(purpose: string): string {
  return acceptedMimeTypes(purpose).join(",");
}

/** Validasi cepat di browser sebelum meminta presigned URL. */
export function checkClientFile(
  file: { type: string; size: number; name: string },
  purpose: string,
): ClientFileCheck {
  const mimeType = file.type.trim();
  const limit = maxBytesForMime(mimeType);
  if (limit === null) {
    return {
      ok: false,
      message:
        "Tipe berkas tidak didukung. Gunakan JPG, PNG, WebP, SVG (logo/ikon), atau MP4.",
    };
  }
  if (!acceptedMimeTypes(purpose).includes(mimeType)) {
    return {
      ok: false,
      message: "Tipe berkas tidak diizinkan untuk tujuan ini.",
    };
  }
  if (mimeType === "image/svg+xml" && !isSvgPurpose(purpose)) {
    return { ok: false, message: "SVG hanya diizinkan untuk logo atau ikon." };
  }
  if (!Number.isInteger(file.size) || file.size <= 0) {
    return { ok: false, message: "Ukuran berkas tidak valid." };
  }
  if (file.size > limit) {
    return {
      ok: false,
      message:
        mimeType === "video/mp4"
          ? `Video melebihi batas 50 MB (${formatBytes(file.size)}).`
          : `Gambar melebihi batas 5 MB (${formatBytes(file.size)}).`,
    };
  }
  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export { IMAGE_MAX_BYTES, VIDEO_MAX_BYTES };

/**
 * Minta presign just-in-time untuk satu file. Kembalikan triple atau
 * PresignError yang sudah berpesan Indonesia (lihat assets-upload-core).
 */
export async function requestPresign(
  file: File,
  purpose: string,
): Promise<
  { ok: true; triple: PresignTriple } | { ok: false; error: PresignError }
> {
  let res: Response;
  try {
    res = await fetch("/api/assets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose,
        mimeType: file.type,
        bytes: file.size,
        fileName: file.name,
      }),
    });
  } catch {
    return {
      ok: false,
      error: {
        kind: "network",
        message: "Jaringan gagal. Periksa koneksi lalu coba lagi.",
      },
    };
  }
  if (res.status === 401 || res.status === 403) {
    const mapped = presignErrorForStatus(res.status);
    return { ok: false, error: mapped };
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg =
      (body as { error?: { message?: string } } | null)?.error?.message ??
      "Gagal meminta URL unggah. Coba lagi.";
    return { ok: false, error: presignErrorForStatus(res.status, msg) };
  }
  const data = (body as { data?: PresignTriple } | null)?.data;
  if (!isPresignTriple(data)) {
    return {
      ok: false,
      error: {
        kind: "server",
        message: "Respons server tidak lengkap. Coba lagi.",
      },
    };
  }
  return { ok: true, triple: data };
}

/**
 * PUT langsung ke `uploadUrl` via XHR (progress + AbortSignal).
 * `Content-Type` harus persis MIME yang ditandatangani.
 * - aborted: pengguna membatalkan (bukan error).
 * - signature: kemungkinan Content-Type berubah / URL rusak -> 403.
 * - ambiguous: status 0 / gagal jaringan (header CORS R2 tak terbaca JS,
 *   ExpiredRequest tak bisa dipastikan) -> tombol "Coba Lagi" manual.
 */
export function putToR2(
  file: File,
  triple: PresignTriple,
  onProgress: UploadProgress,
  signal: AbortSignal,
): Promise<{ ok: true } | { ok: false; error: PutError }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    if (signal.aborted) {
      resolve({ ok: false, error: { kind: "aborted" } });
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
      else onProgress(event.loaded, file.size);
    });
    xhr.addEventListener("load", () => {
      signal.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(file.size, file.size);
        resolve({ ok: true });
        return;
      }
      if (xhr.status === 403) {
        resolve({ ok: false, error: putErrorForStatus(403) });
        return;
      }
      resolve({ ok: false, error: putErrorForStatus(xhr.status) });
    });
    xhr.addEventListener("error", () => {
      signal.removeEventListener("abort", onAbort);
      if (signal.aborted) {
        resolve({ ok: false, error: { kind: "aborted" } });
        return;
      }
      resolve({
        ok: false,
        error: {
          kind: "ambiguous",
          message:
            "Jaringan gagal saat mengunggah (penyebab pasti tak terbaca browser). Coba lagi.",
        },
      });
    });
    xhr.addEventListener("abort", () => {
      signal.removeEventListener("abort", onAbort);
      resolve({ ok: false, error: { kind: "aborted" } });
    });
    xhr.open("PUT", triple.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * Alur lengkap satu file: presign just-in-time -> PUT R2.
 * Retry (bila diminta pemanggil) mengganti triple secara atomik:
 * `requestPresign` selalu dipanggil ulang, tak pernah pakai key/URL lama.
 */
export async function uploadOneFile(
  file: File,
  purpose: string,
  onProgress: UploadProgress,
  signal: AbortSignal,
): Promise<
  | { ok: true; asset: UploadedAsset }
  | { ok: false; error: PresignError | PutError }
> {
  const presigned = await requestPresign(file, purpose);
  if (!presigned.ok) return presigned;
  const put = await putToR2(file, presigned.triple, onProgress, signal);
  if (!put.ok) return put;
  return {
    ok: true,
    asset: {
      key: presigned.triple.key,
      publicUrl: presigned.triple.publicUrl,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    },
  };
}
