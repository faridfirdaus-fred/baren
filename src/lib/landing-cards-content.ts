// Fetch published landing cards for public page

import { getDb } from "@/db";
import { landingCards } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type LandingCard = {
  id: number;
  slot: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  tone: string;
  sortOrder: number;
};

export async function getLandingCards(): Promise<LandingCard[] | null> {
  try {
    const db = getDb();
    const cards = await db
      .select({
        id: landingCards.id,
        slot: landingCards.slot,
        eyebrow: landingCards.eyebrow,
        title: landingCards.title,
        subtitle: landingCards.subtitle,
        body: landingCards.body,
        imageUrl: landingCards.imageUrl,
        ctaLabel: landingCards.ctaLabel,
        ctaUrl: landingCards.ctaUrl,
        tone: landingCards.tone,
        sortOrder: landingCards.sortOrder,
      })
      .from(landingCards)
      .where(eq(landingCards.isPublished, 1))
      .orderBy(asc(landingCards.sortOrder), asc(landingCards.id));

    return cards.length > 0 ? cards : null;
  } catch (error) {
    console.error("getLandingCards error:", error);
    return null;
  }
}
