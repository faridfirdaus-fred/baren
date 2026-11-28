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

const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 9101,
    kind: "screenshot",
    title: "Duel 2 vs 2 di Lapang Kampung",
    fileUrl: "/art/feature-1.jpg",
    sortOrder: 0,
  },
  {
    id: 9102,
    kind: "screenshot",
    title: "Aksi Tag & Zona Tahanan",
    fileUrl: "/art/about-art.jpg",
    sortOrder: 1,
  },
  {
    id: 9103,
    kind: "artwork",
    title: "Suasana Booth BAREN di Event",
    fileUrl: "/art/event-art.jpg",
    sortOrder: 2,
  },
  {
    id: 9104,
    kind: "screenshot",
    title: "Arena Pasar Ramai",
    fileUrl: "/art/feature-3.jpg",
    sortOrder: 3,
  },
  {
    id: 9105,
    kind: "artwork",
    title: "Keseruan Mabar 4 Pemain",
    fileUrl: "/art/event-players.jpg",
    sortOrder: 4,
  },
  {
    id: 9106,
    kind: "screenshot",
    title: "Selebrasi Perebutan Benteng",
    fileUrl: "/art/event-match.jpg",
    sortOrder: 5,
  },
];

export function GallerySection({
  title,
  description,
  items = [],
}: GallerySectionProps) {
  const resolvedTitle = title?.trim() || "Intip serunya kampung BAREN";
  const resolvedDesc =
    description?.trim() ||
    "Tangkapan layar langsung dari arena permainan dan dokumentasi acara komunitas BAREN.";
  const displayItems = items.length > 0 ? items : DEFAULT_GALLERY_ITEMS;

  return (
    <ScrollRevealWrapper>
      <section
        id="galeri"
        className="w-full border-y border-zinc-100 bg-zinc-50/70 py-16 sm:py-24"
      >
        <div className="container-baren">
          <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              {resolvedTitle}
            </h2>
            <p className="max-w-xl text-sm text-zinc-600 sm:text-base">
              {resolvedDesc}
            </p>
          </div>

          <GalleryGrid items={displayItems} />
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
