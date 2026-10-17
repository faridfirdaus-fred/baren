import { getGalleryItems } from "@/lib/gallery-content";
import { SectionShell } from "@/components/site/section-shell";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";

import { GalleryGrid } from "./gallery-grid";

export async function GallerySection() {
  const items = await getGalleryItems();
  const kosong = !items || items.length === 0;

  return (
    <ScrollRevealWrapper>
      <SectionShell id="galeri" tone="light" className="border-t border-ink/10">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow text-ember-700">MEDIA RESMI</p>
          <h2 className="display-xl mt-4 text-ink">GALERI & AKSI</h2>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-ink/75">
            Tangkapan layar, ilustrasi konsep, dan video cuplikan arena
            pertempuran BAREN langsung dari studio pengembangan.
          </p>
        </div>

        <div className="mt-12">
          {kosong ? (
            <div className="border border-ink/15 bg-ink/5 p-12 text-center">
              <p className="font-display text-2xl uppercase tracking-wide text-ink">
                Segera Hadir
              </p>
              <p className="mt-2 text-sm text-ink/70">
                Media resmi BAREN sedang disiapkan. Kunjungi kembali saat
                pembaruan dibuka.
              </p>
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </SectionShell>
    </ScrollRevealWrapper>
  );
}
