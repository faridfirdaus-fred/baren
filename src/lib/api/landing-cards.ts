// E3-11: logika kartu fleksibel landing (baca publik + reorder).
// Tanpa impor runtime (hanya `import type`).

import type {
  LandingCardCreate,
  LandingCardUpdate,
} from "../validation/landing-cards";

export type LandingCardTone = "dark" | "light" | "ember";

export type LandingCardRow = {
  id: number;
  slot: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  tone: LandingCardTone;
  sortOrder: number;
  isPublished: 0 | 1;
};

export type LandingCardLister = { list(): Promise<LandingCardRow[]> };
export type LandingCardCreator = {
  create(input: LandingCardCreate): Promise<LandingCardRow>;
};
export type LandingCardById = {
  update(id: number, patch: LandingCardUpdate): Promise<LandingCardRow | null>;
  remove(id: number): Promise<LandingCardRow | null>;
};
export type LandingCardReorderer = {
  reorder(ids: number[]): Promise<LandingCardRow[]>;
};

/** GET publik: hanya terbit, urut sortOrder lalu id. */
export async function readLandingCards(
  store: LandingCardLister,
): Promise<LandingCardRow[]> {
  const rows = await store.list();
  return rows
    .filter((r) => r.isPublished === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}
