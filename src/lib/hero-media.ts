// E6-1: guard media hero (murni, tanpa impor runtime agar teruji node:test).

export const HERO_VIDEO_FALLBACK = "/media/hero-loop.mp4";
export const HERO_POSTER_FALLBACK = "/media/hero-poster.jpg";

export type HeroRow = {
  title?: string | null;
  subtitle?: string | null;
  backgroundUrl?: string | null;
  videoUrl?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaUrl?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
  isPublished?: number | null;
};

export type HeroContent = {
  title: string;
  subtitle: string | null;
  videoSrc: string;
  poster: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
};

/** URL admin hanya dipakai bila https:// atau path lokal /... */
export function isValidMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const v = url.trim();
  return v.startsWith("https://") || v.startsWith("/");
}

/**
 * Validasi dan pemetaan baris hero DB tanpa fallback aset/slogan statis.
 * Mengembalikan null jika baris tidak ada, belum terbit, atau data esensial tidak lengkap.
 */
export function toHeroContent(
  row: HeroRow | null | undefined,
): HeroContent | null {
  if (!row || row.isPublished !== 1) return null;

  const title = row.title?.trim();
  if (!title) return null;

  const videoUrl = row.videoUrl?.trim();
  const backgroundUrl = row.backgroundUrl?.trim();
  if (!isValidMediaUrl(videoUrl) || !isValidMediaUrl(backgroundUrl))
    return null;

  const primaryCtaLabel = row.primaryCtaLabel?.trim();
  const primaryCtaUrl = row.primaryCtaUrl?.trim();
  if (!primaryCtaLabel || !primaryCtaUrl) return null;

  const secondaryCtaLabel = row.secondaryCtaLabel?.trim() || null;
  const secondaryCtaUrl = row.secondaryCtaUrl?.trim() || null;
  const hasSecondary = Boolean(secondaryCtaLabel && secondaryCtaUrl);

  return {
    title,
    subtitle: row.subtitle?.trim() || null,
    videoSrc: videoUrl!,
    poster: backgroundUrl!,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel: hasSecondary ? secondaryCtaLabel : null,
    secondaryCtaUrl: hasSecondary ? secondaryCtaUrl : null,
  };
}
