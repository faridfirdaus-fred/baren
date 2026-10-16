// E6-7: galeri publik untuk Server Component.
// Berhasil query (walau kosong) → rows DB terurut; gagal (tanpa env/DB
// mati) → null sehingga seksi memakai placeholder Indonesia (bukan data
// contoh yang menyamar konten CMS). Kosong dari DB = placeholder juga.

import { getDb } from "@/db";
import { galleryAssets } from "@/db/schema";

import { readGallery, type GalleryRow } from "./api/gallery";

export type GalleryItem = {
  id: number;
  kind: GalleryRow["kind"];
  title: string | null;
  fileUrl: string;
};

export async function getGalleryItems(): Promise<GalleryItem[] | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(galleryAssets);
    const lister = {
      list: async (): Promise<GalleryRow[]> =>
        rows.map((r) => ({
          id: r.id,
          kind: (r.kind ?? "image") as GalleryRow["kind"],
          title: r.title,
          fileUrl: r.fileUrl,
          sortOrder: r.sortOrder,
        })),
    };
    const ordered = await readGallery(lister);
    return ordered.map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      fileUrl: r.fileUrl,
    }));
  } catch {
    return null;
  }
}
