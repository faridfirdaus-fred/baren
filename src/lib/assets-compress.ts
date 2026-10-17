/**
 * Kompresi gambar client-side (E4-7, best practice BAREN).
 *
 * - Dipanggil SEBELUM `requestPresign()` agar MIME + bytes yang
 *   ditandatangani = hasil kompres (presigned URL mengikat Content-Type).
 * - Raster JPEG/PNG/WebP -> WebP + resize sisi terpanjang per purpose.
 * - SVG/video/favicon/tak dikenal -> kembalikan file asli (skip aman).
 * - Kegagalan apapun (decode/canvas/memory) -> file asli, tak pernah blokir.
 */

import {
  compressPresetFor,
  scaledDimensions,
  shouldUseCompressed,
  webpFileName,
} from "./assets-compress-core";

export type CompressOutcome =
  | { compressed: false; file: File; reason: string }
  | {
      compressed: true;
      file: File;
      originalBytes: number;
      compressedBytes: number;
      savedBytes: number;
    };

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Kompres satu File gambar bila purpose+MIME memenuhi preset.
 * Selalu resolve (tak pernah throw): gagal -> `{compressed:false}`.
 */
export async function compressImageIfNeeded(
  file: File,
  purpose: string,
): Promise<CompressOutcome> {
  const preset = compressPresetFor(purpose, file.type);
  if (!preset) {
    return { compressed: false, file, reason: "skip" };
  }
  try {
    if (typeof createImageBitmap !== "function") {
      return { compressed: false, file, reason: "no-bitmap" };
    }
    const bitmap = await createImageBitmap(file);
    try {
      const { width, height } = scaledDimensions(
        bitmap.width,
        bitmap.height,
        preset.maxSide,
      );
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { compressed: false, file, reason: "no-ctx" };
      }
      ctx.drawImage(bitmap, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, preset.mimeType, preset.quality);
      if (!blob || blob.size <= 0) {
        return { compressed: false, file, reason: "encode-gagal" };
      }
      if (!shouldUseCompressed(file.size, blob.size)) {
        return { compressed: false, file, reason: "tidak-hemat" };
      }
      const out = new File([blob], webpFileName(file.name), {
        type: preset.mimeType,
        lastModified: Date.now(),
      });
      return {
        compressed: true,
        file: out,
        originalBytes: file.size,
        compressedBytes: out.size,
        savedBytes: file.size - out.size,
      };
    } finally {
      bitmap.close();
    }
  } catch {
    return { compressed: false, file, reason: "gagal" };
  }
}
