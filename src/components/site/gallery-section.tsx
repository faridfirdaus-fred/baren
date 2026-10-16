// E6-7: seksi galeri publik (Server Component, id="galeri").
// Anchor kontrak nav MEDIA (#galeri). Data = yang disajikan GET
// /api/gallery via `getGalleryItems` (tanpa self-fetch, aman di Workers).
// Selalu dirender (walau DB kosong/gagal) agar anchor tidak mati; keadaan
// kosong memakai pesan Indonesia. Grid + interaksi di `GalleryLightbox`.

import { getGalleryItems } from "@/lib/gallery-content";

import { GalleryLightbox } from "./gallery-lightbox";
import { SectionShell } from "./section-shell";

export async function GallerySection() {
  const items = await getGalleryItems();

  return (
    <SectionShell id="galeri" tone="light">
      <p className="eyebrow text-ember-700">Media</p>
      <h2 className="display-xl mt-4 text-ink">GALERI</h2>
      <p className="mt-5 max-w-2xl text-lg leading-7 text-ink/80">
        Intip dunia BAREN — tangkapan layar, ilustrasi, spanduk, dan video
        terbaru dari arena.
      </p>
      {items === null ? (
        <p
          role="status"
          className="mt-10 border border-ink/15 bg-ink/5 px-6 py-8 text-center text-lg text-ink/70"
        >
          Galeri tidak dapat dimuat saat ini. Silakan coba lagi nanti.
        </p>
      ) : items.length === 0 ? (
        <p
          role="status"
          className="mt-10 border border-ink/15 bg-ink/5 px-6 py-8 text-center text-lg text-ink/70"
        >
          Belum ada media di galeri. Pantau terus kabar terbaru dari BAREN.
        </p>
      ) : (
        <GalleryLightbox items={items} />
      )}
    </SectionShell>
  );
}
