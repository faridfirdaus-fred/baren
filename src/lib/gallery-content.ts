// E6-7: daftar galeri untuk Server Component.
// Membaca sumber yang sama dengan GET /api/gallery (tabel `gallery_assets`
// + urutan deterministik `readGallery`) langsung via Drizzle — tanpa
// self-fetch HTTP agar aman di runtime Workers (pola sama seperti
// `getFaqItems`). DB tak tersedia → null sehingga seksi menampilkan pesan
// Indonesia, bukan halaman blank.

import { getDb } from "@/db";
import { galleryAssets } from "@/db/schema";

import { readGallery, type GalleryRow } from "./api/gallery";

export type GalleryItem = GalleryRow;

export async function getGalleryItems(): Promise<GalleryItem[] | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(galleryAssets);
    return readGallery({
      list: async () =>
        rows.map((r) => ({
          id: r.id,
          kind: (r.kind ?? "image") as GalleryItem["kind"],
          title: r.title,
          fileUrl: r.fileUrl,
          sortOrder: r.sortOrder,
        })),
    });
  } catch {
    return null;
  }
}
