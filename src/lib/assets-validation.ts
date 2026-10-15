import { z } from "zod";

/**
 * Aturan validasi aset server (E4-3, SRS EI-05/06 + FR-ADM-17/24).
 * - Gambar JPG/PNG/WebP dan MP4: semua purpose, kecuali dibatasi purpose.
 * - SVG HANYA untuk purpose logo/ikon (bukan gallery/news/hero).
 * - Batas: gambar 5 MB, video 50 MB.
 * - Jangan percaya ekstensi/nama file saja: MIME deklarasi harus cocok
 *   dengan pemetaan ekstensi bila nama file tersedia, dan metadata objek
 *   diverifikasi ulang via `verifyStoredAsset` pada tahap commit.
 */

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const SVG_MIME_TYPE = "image/svg+xml" as const;
export const VIDEO_MIME_TYPE = "video/mp4" as const;

/** Purpose yang boleh memakai SVG (logo/ikon saja). */
export const SVG_ALLOWED_PURPOSES = [
  "logo",
  "ikon",
  "icon",
  "favicon",
] as const;

export type SvgAllowedPurpose = (typeof SVG_ALLOWED_PURPOSES)[number];

export function isSvgPurpose(purpose: string): boolean {
  return (SVG_ALLOWED_PURPOSES as readonly string[]).includes(
    purpose.trim().toLowerCase(),
  );
}

export function maxBytesForMime(mimeType: string): number | null {
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return IMAGE_MAX_BYTES;
  }
  if (mimeType === SVG_MIME_TYPE) {
    return IMAGE_MAX_BYTES;
  }
  if (mimeType === VIDEO_MIME_TYPE) {
    return VIDEO_MAX_BYTES;
  }
  return null;
}

/** Cek MIME + purpose + ukuran; kembalikan pesan error Indonesia atau null. */
export function validateAssetRequest(input: {
  purpose: string;
  mimeType: string;
  bytes: number;
}): string | null {
  const purpose = input.purpose.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,32}$/.test(purpose)) {
    return "Tujuan unggahan (purpose) tidak valid.";
  }
  const limit = maxBytesForMime(input.mimeType);
  if (limit === null) {
    return "Tipe berkas tidak didukung. Gunakan JPG, PNG, WebP, SVG (logo/ikon), atau MP4.";
  }
  if (input.mimeType === SVG_MIME_TYPE && !isSvgPurpose(purpose)) {
    return "SVG hanya diizinkan untuk logo atau ikon.";
  }
  if (!Number.isInteger(input.bytes) || input.bytes <= 0) {
    return "Ukuran berkas tidak valid.";
  }
  if (input.bytes > limit) {
    return input.mimeType === VIDEO_MIME_TYPE
      ? "Video melebihi batas 50 MB."
      : "Gambar melebihi batas 5 MB.";
  }
  return null;
}

export const assetPurposeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{1,32}$/, "Tujuan unggahan (purpose) tidak valid.");

export const assetPresignRequestSchema = z
  .object({
    purpose: assetPurposeSchema,
    mimeType: z.string().trim().min(1, "Tipe berkas wajib diisi."),
    bytes: z
      .number()
      .int("Ukuran berkas tidak valid.")
      .positive("Ukuran berkas tidak valid."),
    fileName: z.string().trim().max(255).optional(),
  })
  .superRefine((value, ctx) => {
    const error = validateAssetRequest(value);
    if (error) {
      ctx.addIssue({ code: "custom", message: error });
    }
  });

export type AssetPresignRequest = z.infer<typeof assetPresignRequestSchema>;

export const assetKeySchema = z
  .string()
  .trim()
  .min(1, "Key aset wajib diisi.")
  .max(1024, "Key aset tidak valid.")
  .regex(/^assets\/[A-Za-z0-9/_.-]+$/, "Key aset tidak valid.")
  .refine((key) => !key.includes(".."), "Key aset tidak valid.");

export const assetDeleteRequestSchema = z.object({
  key: assetKeySchema,
});

export type AssetDeleteRequest = z.infer<typeof assetDeleteRequestSchema>;
