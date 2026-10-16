// E6-1: konten hero dinamis untuk Server Component.
// `getHeroContent` baca DB dan tidak pernah melempar — DB kosong/gagal →
// null sehingga komponen memakai fallback lokal.

import { getDb } from "@/db";
import { hero } from "@/db/schema";

import {
  HERO_POSTER_FALLBACK,
  HERO_VIDEO_FALLBACK,
  pickHeroMedia,
} from "./hero-media";

export type HeroContent = {
  title: string;
  subtitle: string | null;
  videoSrc: string;
  poster: string;
  primaryCtaLabel: string | null;
  primaryCtaUrl: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
};

/** Baris hero terbit dari DB, atau null bila kosong/gagal. */
export async function getHeroContent(): Promise<HeroContent | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(hero).limit(1);
    const row = rows[0];
    if (!row || row.isPublished !== 1) return null;
    return {
      title: row.title,
      subtitle: row.subtitle,
      videoSrc: pickHeroMedia(row.videoUrl, HERO_VIDEO_FALLBACK),
      poster: pickHeroMedia(row.backgroundUrl, HERO_POSTER_FALLBACK),
      primaryCtaLabel: row.primaryCtaLabel,
      primaryCtaUrl: row.primaryCtaUrl,
      secondaryCtaLabel: row.secondaryCtaLabel,
      secondaryCtaUrl: row.secondaryCtaUrl,
    };
  } catch {
    return null;
  }
}
