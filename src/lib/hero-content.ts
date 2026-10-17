// E6-1 & E14-1: konten hero dinamis untuk Server Component.
// `getHeroContent` baca DB dan tidak pernah melempar — DB kosong/gagal/tidak terbit → null.
// Tanpa fallback runtime ke konten statis; Hero terbit wajib ada untuk tampil.

import { getDb } from "@/db";
import { hero } from "@/db/schema";

import { toHeroContent, type HeroContent } from "./hero-media";

export type { HeroContent };

/** Baris hero terbit dari DB, atau null bila kosong/gagal/tidak valid. */
export async function getHeroContent(): Promise<HeroContent | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(hero).limit(1);
    return toHeroContent(rows[0]);
  } catch {
    return null;
  }
}
