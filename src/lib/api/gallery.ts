// E3-5: logika galeri (CRUD/urut + filter kind).
// DELETE mengembalikan fileUrl agar E4-5 dapat menghapus objek R2.
// Tanpa impor runtime (hanya `import type`).

import type {
  GalleryCreate,
  GalleryKind,
  GalleryUpdate,
} from "../validation/gallery";

export type GalleryRow = {
  id: number;
  kind: GalleryKind;
  title: string | null;
  fileUrl: string;
  sortOrder: number;
};

export type GalleryLister = {
  list(kind?: GalleryKind): Promise<GalleryRow[]>;
};

export type GalleryCreator = {
  create(input: GalleryCreate): Promise<GalleryRow>;
};

export type GalleryById = {
  update(id: number, patch: GalleryUpdate): Promise<GalleryRow | null>;
  remove(id: number): Promise<GalleryRow | null>;
};

/** GET publik: saring kind bila diminta, urut deterministik. */
export async function readGallery(
  store: GalleryLister,
  kind?: GalleryKind,
): Promise<GalleryRow[]> {
  const rows = await store.list(kind);
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}
