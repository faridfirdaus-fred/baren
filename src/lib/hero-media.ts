// E6-1: guard media hero (murni, tanpa impor runtime agar teruji node:test).

export const HERO_VIDEO_FALLBACK = "/media/hero-loop.mp4";
export const HERO_POSTER_FALLBACK = "/media/hero-poster.jpg";

/** URL admin hanya dipakai bila https:// atau path lokal /... */
export function pickHeroMedia(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const v = value.trim();
  if (v.startsWith("https://") || v.startsWith("/")) return v;
  return fallback;
}
