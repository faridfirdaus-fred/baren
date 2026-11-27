import { getDb } from "@/db";
import { hero } from "@/db/schema";

import { toHeroContent, type HeroContent } from "./hero-media";

export type { HeroContent };

const DEFAULT_HERO_CONTENT: HeroContent = {
  title: "Lari, sembunyi, dan rebut benteng lawan!",
  subtitle:
    "Party game lokal 2 vs 2 yang mengadaptasi keseruan permainan tradisional Baren/Bebentengan ke satu layar bersama.",
  videoSrc: "/media/hero-loop.mp4",
  poster: "/media/hero-poster.jpg",
  primaryCtaLabel: "Gabung Wishlist",
  primaryCtaUrl: "#daftar",
  secondaryCtaLabel: "Cara Bermain",
  secondaryCtaUrl: "#cara-main",
};

/**
 * Baca hero dari DB. Bila admin sengaja menonaktifkan (`isPublished === 0`),
 * kembalikan `null` agar tersembunyi. Bila tabel belum diisi / DB tidak aktif,
 * tampilkan hero bawaan game BAREN.
 */
export async function getHeroContent(): Promise<HeroContent | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(hero).limit(1);
    if (rows.length === 0) return DEFAULT_HERO_CONTENT;
    if (rows[0]?.isPublished !== 1) return null;
    return toHeroContent(rows[0]) ?? DEFAULT_HERO_CONTENT;
  } catch {
    return DEFAULT_HERO_CONTENT;
  }
}
