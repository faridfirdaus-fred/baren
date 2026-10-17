// E4-7: keputusan kompresi murni tanpa impor runtime (teruji node:test).
// Pola E3/E4-6: tanpa impor relatif agar type-stripping Node bisa memuatnya.
// API browser (createImageBitmap/canvas) tetap di `assets-compress.ts`.

export type CompressPurpose =
  "hero" | "gallery" | "news" | "logo" | "ikon" | "icon" | "favicon";

/** MIME raster yang layak dikompres di browser. */
export const COMPRESSIBLE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type CompressibleMime = (typeof COMPRESSIBLE_MIME_TYPES)[number];

export type CompressPreset = {
  maxSide: number;
  quality: number;
  mimeType: "image/webp";
};

/**
 * Preset per purpose (best practice BAREN E4-7):
 * - hero/gallery/banner: 1920px q0.80 (LCP & layar penuh).
 * - news/thumbnail: 1200px q0.75 (kartu kecil).
 * - logo/ikon: 512px q0.85 (pertahankan ketajaman, alpha WebP).
 * - favicon: skip (biarkan asli, biasanya sudah kecil/SVG).
 */
const PRESETS: Record<CompressPurpose, CompressPreset | null> = {
  hero: { maxSide: 1920, quality: 0.8, mimeType: "image/webp" },
  gallery: { maxSide: 1920, quality: 0.8, mimeType: "image/webp" },
  news: { maxSide: 1200, quality: 0.75, mimeType: "image/webp" },
  logo: { maxSide: 512, quality: 0.85, mimeType: "image/webp" },
  ikon: { maxSide: 512, quality: 0.85, mimeType: "image/webp" },
  icon: { maxSide: 512, quality: 0.85, mimeType: "image/webp" },
  favicon: null,
};

export function normalizeCompressPurpose(
  purpose: string,
): CompressPurpose | null {
  const p = purpose.trim().toLowerCase();
  if (p === "hero") return "hero";
  if (p === "gallery") return "gallery";
  if (p === "news") return "news";
  if (p === "logo") return "logo";
  if (p === "ikon" || p === "icon") return p as CompressPurpose;
  if (p === "favicon") return "favicon";
  return null;
}

/** True bila MIME raster kandidat kompres (SVG/video/MP4 selalu false). */
export function isCompressibleMime(mimeType: string): boolean {
  return (COMPRESSIBLE_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Preset untuk purpose; null = skip kompres (favicon, purpose tak dikenal,
 * SVG, video). Purpose tak dikenal -> null agar aman (upload asli).
 */
export function compressPresetFor(
  purpose: string,
  mimeType: string,
): CompressPreset | null {
  if (!isCompressibleMime(mimeType)) return null;
  const normalized = normalizeCompressPurpose(purpose);
  if (!normalized) return null;
  return PRESETS[normalized];
}

/**
 * Hitung dimensi skala agar sisi terpanjang = maxSide; tanpa upscale.
 * Kembalikan {width,height} integer >= 1.
 */
export function scaledDimensions(
  width: number,
  height: number,
  maxSide: number,
): { width: number; height: number } {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(maxSide) ||
    width <= 0 ||
    height <= 0 ||
    maxSide <= 0
  ) {
    return { width: 1, height: 1 };
  }
  const longest = Math.max(width, height);
  if (longest <= maxSide) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Ganti ekstensi nama file menjadi .webp (untuk key/metadata presign). */
export function webpFileName(fileName: string): string {
  const base = fileName.split("/").pop() ?? fileName;
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base || "gambar";
  return `${stem}.webp`;
}

/**
 * True bila hasil kompres layak dipakai: ukuran > 0 dan LEBIH KECIL dari
 * asli. Bila hasil >= asli (mis. WebP kecil di-upscale), pakai file asli.
 */
export function shouldUseCompressed(
  originalBytes: number,
  compressedBytes: number,
): boolean {
  return (
    Number.isInteger(originalBytes) &&
    Number.isInteger(compressedBytes) &&
    compressedBytes > 0 &&
    compressedBytes < originalBytes
  );
}
