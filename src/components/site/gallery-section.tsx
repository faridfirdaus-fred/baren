import type { GalleryItem } from "@/lib/gallery-content";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import { GalleryGrid } from "./gallery-grid";

export type GallerySectionProps = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  emptyTitle?: string | null;
  emptyMessage?: string | null;
  items?: GalleryItem[];
};

export function GallerySection({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyMessage,
  items = [],
}: GallerySectionProps) {
  const resolvedTitle = title?.trim() || "Intip serunya kampung BAREN";
  const resolvedEyebrow = eyebrow?.trim() || "GALERI";
  const resolvedDesc =
    description?.trim() || "Tangkapan layar langsung dari gameplay.";
  const kosong = items.length === 0;

  return (
    <ScrollRevealWrapper>
      <section
        id="galeri"
        className="relative w-full py-16 sm:py-24 bg-[#2f180a] text-[#faf6ee] overflow-hidden"
      >
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <span className="pill-eyebrow">{resolvedEyebrow}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#faf6ee]">
              {resolvedTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#faf6ee]/80 font-medium max-w-xl">
              {resolvedDesc}
            </p>
          </div>

          <div>
            {kosong ? (
              <div className="rounded-3xl border-2 border-[#542d14] bg-[#1f1007]/60 p-12 text-center max-w-xl mx-auto shadow-xl">
                <p className="text-2xl font-black uppercase tracking-wide text-[#f59e0b]">
                  {emptyTitle?.trim() || "Segera Hadir"}
                </p>
                <p className="mt-2 text-sm text-[#faf6ee]/70">
                  {emptyMessage?.trim() ||
                    "Media resmi BAREN sedang disiapkan. Kunjungi kembali saat pembaruan dibuka."}
                </p>
              </div>
            ) : (
              <GalleryGrid items={items} />
            )}
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
