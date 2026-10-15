/**
 * Validasi klien untuk uploader admin (E4-6 menunggu E4-2; hanya UX).
 * Aturan disamakan dengan `src/lib/assets-validation.ts`, tetapi keputusan
 * akhir tetap di server. Mendukung drag/drop + fallback pilih file,
 * progress via XHR, preview, status error, dan keyboard.
 */

import {
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  isSvgPurpose,
  maxBytesForMime,
} from "./assets-validation";

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
