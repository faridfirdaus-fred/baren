import type { GalleryItem } from "@/lib/gallery-content";
import { SectionShell } from "@/components/site/section-shell";
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
  if (!title) return null;
  const kosong = items.length === 0;

  if (kosong && !emptyTitle && !emptyMessage) {
    return null;
  }

  return (
    <ScrollRevealWrapper>
      <SectionShell id="galeri" tone="light" className="border-t border-ink/10">
        <div className="flex flex-col items-center text-center">
          {eyebrow && <p className="eyebrow text-ember-700">{eyebrow}</p>}
          <h2 className="display-xl mt-4 text-ink">{title}</h2>
          {description && (
            <p className="mt-4 max-w-2xl text-lg leading-7 text-ink/75">
              {description}
            </p>
          )}
        </div>

        <div className="mt-12">
          {kosong ? (
            <div className="border border-ink/15 bg-ink/5 p-12 text-center">
              {emptyTitle && (
                <p className="font-display text-2xl uppercase tracking-wide text-ink">
                  {emptyTitle}
                </p>
              )}
              {emptyMessage && (
                <p className="mt-2 text-sm text-ink/70">{emptyMessage}</p>
              )}
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </SectionShell>
    </ScrollRevealWrapper>
  );
}
