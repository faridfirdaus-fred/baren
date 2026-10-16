// E6-2: banner hero untuk Server Component.
// `getHeroBanners` baca DB dan tidak pernah melempar — DB kosong/gagal →
// [] sehingga hero tetap tampil tanpa carousel (0 = hilang, 1 = statis,
// >1 = carousel di <HeroCarousel />).

import { getDb } from "@/db";
import { heroBanners } from "@/db/schema";

export type HeroBannerItem = {
  id: number;
  imageUrl: string;
};

/** Daftar banner terurut (sortOrder lalu id), atau [] bila kosong/gagal. */
export async function getHeroBanners(): Promise<HeroBannerItem[]> {
  try {
    const db = getDb();
    const rows = await db.select().from(heroBanners);
    return [...rows]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map((r) => ({ id: r.id, imageUrl: r.imageUrl }));
  } catch {
    return [];
  }
}
