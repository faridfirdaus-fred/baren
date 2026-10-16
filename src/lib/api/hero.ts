// E3-3: logika hero singleton (satu baris id terkecil) + banners CRUD/urut.
// Store diinjeksi (route mengadaptasi Drizzle); tanpa impor runtime
// (hanya `import type`) agar teruji via node:test.

import type {
  BannerCreate,
  BannerUpdate,
  HeroUpdate,
} from "../validation/hero";

export type HeroRow = {
  id: number;
  title: string;
  subtitle: string | null;
  backgroundUrl: string | null;
  videoUrl: string | null;
  primaryCtaLabel: string | null;
  primaryCtaUrl: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
  isPublished: 0 | 1;
};

export type HeroStore = {
  get(): Promise<HeroRow | null>;
  save(input: HeroUpdate): Promise<HeroRow>;
};

export type BannerRow = {
  id: number;
  imageUrl: string;
  sortOrder: number;
};

/** Antarmuka sempit per rute agar tanpa stub. */
export type BannerLister = {
  list(): Promise<BannerRow[]>;
};

export type BannerCreator = {
  create(input: BannerCreate): Promise<BannerRow>;
};

export type BannerById = {
  update(id: number, patch: BannerUpdate): Promise<BannerRow | null>;
  remove(id: number): Promise<BannerRow | null>;
};

export type PublicHero = Omit<HeroRow, "isPublished">;

/** GET publik: hero hanya bila terbit; draf tidak bocor. */
export async function readPublicHero(
  store: HeroStore,
): Promise<{ hero: PublicHero | null }> {
  const row = await store.get();
  if (!row || row.isPublished !== 1) return { hero: null };
  const { isPublished: _hide, ...hero } = row;
  void _hide;
  return { hero };
}

/** GET publik: hero + banners berurutan deterministik. */
export async function readPublicHome(
  heroes: HeroStore,
  banners: BannerLister,
): Promise<{ hero: PublicHero | null; banners: BannerRow[] }> {
  const [{ hero: h }, list] = await Promise.all([
    readPublicHero(heroes),
    banners.list(),
  ]);
  return {
    hero: h,
    banners: [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
  };
}

/** PUT admin: tulis hero singleton. */
export async function writeHero(
  store: HeroStore,
  input: HeroUpdate,
): Promise<PublicHero> {
  const row = await store.save(input);
  const { isPublished: _hide, ...hero } = row;
  void _hide;
  return hero;
}
