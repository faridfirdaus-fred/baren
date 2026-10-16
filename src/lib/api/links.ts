// E3-8: logika social & download links (CRUD + urut deterministik).
// Email kontak dikelola /api/settings (E3-2), bukan di sini.
// Tanpa impor runtime (hanya `import type`).

import type {
  DownloadCreate,
  DownloadUpdate,
  SocialCreate,
  SocialUpdate,
} from "../validation/links";

export type SocialRow = {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
};
export type DownloadRow = {
  id: number;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
};

export type SocialLister = { list(): Promise<SocialRow[]> };
export type SocialCreator = { create(input: SocialCreate): Promise<SocialRow> };
export type SocialById = {
  update(id: number, patch: SocialUpdate): Promise<SocialRow | null>;
  remove(id: number): Promise<SocialRow | null>;
};

export type DownloadLister = { list(): Promise<DownloadRow[]> };
export type DownloadCreator = {
  create(input: DownloadCreate): Promise<DownloadRow>;
};
export type DownloadById = {
  update(id: number, patch: DownloadUpdate): Promise<DownloadRow | null>;
  remove(id: number): Promise<DownloadRow | null>;
};

function byOrder<T extends { sortOrder: number; id: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

/** GET publik: tautan media sosial berurutan. */
export async function readSocialLinks(
  store: SocialLister,
): Promise<SocialRow[]> {
  return byOrder(await store.list());
}

/**
 * GET publik: tautan unduhan berurutan. Daftar kosong = game belum rilis
 * (UI menampilkan "Segera Hadir" — FR-PUB-25); tidak ada kolom status di skema.
 */
export async function readDownloadLinks(
  store: DownloadLister,
): Promise<DownloadRow[]> {
  return byOrder(await store.list());
}
