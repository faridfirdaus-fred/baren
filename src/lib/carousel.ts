// E6-2/E6-8: logika navigasi murni carousel & lightbox (tanpa impor
// runtime agar teruji via node:test). Dipakai HeroCarousel (banner) dan
// GalleryGrid lightbox (gambar/video).

/** Carousel hanya tampil sebagai geser bila banner lebih dari 1. */
export function shouldShowCarousel(count: number): boolean {
  return Number.isFinite(count) && count > 1;
}

/** Indeks berikutnya (melingkar). Total <= 0 → 0 agar tak NaN. */
export function nextIndex(current: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return (current + 1) % total;
}

/** Indeks sebelumnya (melingkar). Total <= 0 → 0 agar tak NaN. */
export function prevIndex(current: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return (current - 1 + total) % total;
}
