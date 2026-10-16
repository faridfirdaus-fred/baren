// E6-7: galeri publik untuk Server Component.
// Berhasil query (walau kosong) → rows DB terurut; gagal (tanpa env/DB
// mati) → null sehingga seksi memakai pesan status Indonesia.
// Membaca tabel `gallery_assets` lewat Drizzle dan diurutkan via `readGallery`.

import { getDb } from "@/db";
import { galleryAssets } from "@/db/schema";

import { readGallery, type GalleryRow } from "./api/gallery";

export type GalleryItem = GalleryRow;

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
    return await readGallery(lister);
  } catch {
    return null;
  }
}
