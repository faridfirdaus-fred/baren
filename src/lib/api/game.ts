// E3-4: logika about singleton + features/steps CRUD/urut + video demo.
// Store diinjeksi; tanpa impor runtime (hanya `import type`).

import type {
  AboutUpdate,
  FeatureCreate,
  FeatureUpdate,
  StepCreate,
  StepUpdate,
} from "../validation/game";

export type AboutRow = {
  id: number;
  title: string;
  body: string;
  imageUrl: string | null;
};

export type AboutStore = {
  get(): Promise<AboutRow | null>;
  save(input: AboutUpdate): Promise<AboutRow>;
};

export type FeatureRow = {
  id: number;
  title: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
};

export type FeatureLister = { list(): Promise<FeatureRow[]> };
export type FeatureCreator = {
  create(input: FeatureCreate): Promise<FeatureRow>;
};
export type FeatureById = {
  update(id: number, patch: FeatureUpdate): Promise<FeatureRow | null>;
  remove(id: number): Promise<FeatureRow | null>;
};

export type StepRow = {
  id: number;
  step: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  sortOrder: number;
};

export type StepLister = { list(): Promise<StepRow[]> };
export type StepCreator = { create(input: StepCreate): Promise<StepRow> };
export type StepById = {
  update(id: number, patch: StepUpdate): Promise<StepRow | null>;
  remove(id: number): Promise<StepRow | null>;
};

export type VideoStore = {
  get(): Promise<string | null>;
  save(videoUrl: string): Promise<string>;
};

function byOrder<T extends { sortOrder: number; id: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

/** GET publik about (null bila belum diisi). */
export async function readAbout(store: AboutStore): Promise<AboutRow | null> {
  return store.get();
}

/** GET publik features berurutan deterministik. */
export async function readFeatures(
  store: FeatureLister,
): Promise<FeatureRow[]> {
  return byOrder(await store.list());
}

/** GET publik how-to-play: langkah berurutan + video demo (bisa null). */
export async function readHowToPlay(
  steps: StepLister,
  video: { get(): Promise<string | null> },
): Promise<{ steps: StepRow[]; videoUrl: string | null }> {
  const [list, url] = await Promise.all([steps.list(), video.get()]);
  return { steps: byOrder(list), videoUrl: url };
}
