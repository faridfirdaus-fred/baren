/**
 * Loader `next/image` untuk aset publik R2 (E4-4, NFR-PRF-03).
 *
 * - Hanya untuk URL publik permanen (R2_PUBLIC_URL / key `assets/...`).
 * - MENOLAK signed URL (`X-Amz-*`) agar gambar tidak kedaluwarsa.
 * - Lebar/quality di-clamp agar aman; fallback memakai `/icon.svg`.
 * - Konsumen memakai `loading="lazy"` untuk gambar di bawah fold.
 */

export const R2_IMAGE_FALLBACK_SRC = "/icon.svg";
const MIN_WIDTH = 16;
const MAX_WIDTH = 3840;

export type R2ImageLoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

function publicBaseHost(): string | null {
  const base =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;
  if (!base) return null;
  try {
    return new URL(base).host;
  } catch {
    return null;
  }
}

function clampInt(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Bentuk URL final untuk next/image. Melempar error untuk signed URL
 * atau host di luar R2 publik sehingga tidak ada gambar kedaluwarsa.
 */
export function buildR2ImageUrl({
  src,
  width,
  quality,
}: R2ImageLoaderParams): string {
  const trimmed = src.trim();
  if (!trimmed) return R2_IMAGE_FALLBACK_SRC;

  let url: URL;
  try {
    url =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? new URL(trimmed)
        : new URL(trimmed, "https://r2.local");
  } catch {
    return R2_IMAGE_FALLBACK_SRC;
  }

  const params = url.searchParams;
  if (
    params.has("X-Amz-Signature") ||
    params.has("X-Amz-Expires") ||
    params.has("X-Amz-Credential")
  ) {
    throw new Error("Signed URL tidak boleh dipakai untuk next/image.");
  }

  const safeWidth = clampInt(width, MIN_WIDTH, MAX_WIDTH, 800);
  const safeQuality = clampInt(quality ?? 75, 1, 100, 75);

  const isRelative =
    !trimmed.startsWith("http://") && !trimmed.startsWith("https://");
  if (isRelative) {
    if (!trimmed.startsWith("/assets/") && !trimmed.startsWith("assets/")) {
      return R2_IMAGE_FALLBACK_SRC;
    }
    params.set("w", String(safeWidth));
    params.set("q", String(safeQuality));
    return `${url.pathname}?${params.toString()}`;
  }

  const allowedHost = publicBaseHost();
  if (allowedHost && url.host !== allowedHost) {
    return R2_IMAGE_FALLBACK_SRC;
  }
  if (url.protocol !== "https:") {
    return R2_IMAGE_FALLBACK_SRC;
  }
  url.searchParams.set("w", String(safeWidth));
  url.searchParams.set("q", String(safeQuality));
  return url.toString();
}

/** Loader default yang bisa dipasang ke prop `loader` next/image. */
export default function r2ImageLoader(params: R2ImageLoaderParams): string {
  return buildR2ImageUrl(params);
}
