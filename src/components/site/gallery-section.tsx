import { getGalleryItems } from "@/lib/gallery-content";
import { SectionShell } from "@/components/site/section-shell";

import { GalleryGrid } from "./gallery-grid";

/**
 * E6-7 — Seksi galeri (FR-PUB-08).
 * Daftar dari `gallery_assets` terurut; kosong (atau DB gagal/build
 * tanpa env) → placeholder Indonesia, bukan data contoh.
 */
export async function GallerySection() {
  const hasil = await getGalleryItems();
  const items = hasil ?? [];

  return (
    <SectionShell id="galeri" tone="light" className="border-t border-ink/10">
      <p className="eyebrow text-ember-700">MEDIA</p>
      <h2 className="display-xl mt-4 text-ink">GALERI BAREN</h2>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-ink/75">
        Cuplikan screenshot, artwork, banner, dan video dari dunia BAREN.
      </p>
      {items.length === 0 ? (
        <div className="mt-10 border border-sand-600 bg-sand p-8 text-center">
          <p className="font-display text-xl uppercase text-ink">
            Belum ada galeri
          </p>
          <p className="mt-2 leading-7 text-ink/70">
            Foto dan video akan tampil di sini setelah admin menambahkannya.
          </p>
        </div>
      ) : (
        <GalleryGrid items={items} />
      )}
    </SectionShell>
  );
}
