"use client";

// E6-7/E6-8 — Grid galeri responsif + lightbox (client component).
// - Grid: 1 kolom (360px) → 2 (sm) → 3 (lg); gambar via R2Image (lazy di
//   bawah fold); video tanpa autoplay, tanpa suara, `preload="metadata"`
//   sebagai bingkai pratinjau.
// - Lightbox: klik/sentuh/Enter membuka; Escape/menutup; fokus kembali ke
//   pemicu; scroll-lock; video dilepas saat tutup sehingga berhenti.
// - Seluruh label Indonesia; hormati prefers-reduced-motion (global +
//   `motion-safe:`); tanpa dependency baru.

import { useEffect, useRef, useState } from "react";

import type { GalleryItem } from "@/lib/gallery-content";

import { IconClose } from "./icon";
import { R2Image } from "./r2-image";

export type GalleryLightboxProps = {
  items: GalleryItem[];
};

const KIND_LABEL: Record<GalleryItem["kind"], string> = {
  image: "Gambar",
  screenshot: "Tangkapan layar",
  artwork: "Ilustrasi",
  banner: "Spanduk",
  video: "Video",
};

/** Alt/label bermakna: judul kurator, atau "<jenis> BAREN <nomor>". */
function itemLabel(item: GalleryItem, index: number): string {
  const title = item.title?.trim();
  if (title) return title;
  return `${KIND_LABEL[item.kind]} BAREN ${index + 1}`;
}

export function GalleryLightbox({ items }: GalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const active = openIndex === null ? null : items[openIndex];

  // E6-8 — Saat lightbox terbuka: kunci scroll, fokus ke tombol tutup,
  // Escape menutup, Tab terjebak di dalam dialog, tutup → fokus kembali
  // ke pemicu.
  useEffect(() => {
    if (openIndex === null) return;
    const trigger = triggerRefs.current[openIndex];
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenIndex(null);
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], video[controls], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.getClientRects().length > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [openIndex]);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const label = itemLabel(item, index);
          const isVideo = item.kind === "video";
          return (
            <button
              key={item.id}
              ref={(el) => {
                triggerRefs.current[index] = el;
              }}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-haspopup="dialog"
              aria-label={
                isVideo ? `Putar video: ${label}` : `Perbesar gambar: ${label}`
              }
              className="group block w-full min-w-0 overflow-hidden border border-ink/15 bg-sand text-left transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember-700"
            >
              <span className="relative block aspect-video w-full overflow-hidden bg-ink-700">
                {isVideo ? (
                  <video
                    className="h-full w-full object-cover"
                    src={item.fileUrl}
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  />
                ) : (
                  <R2Image
                    src={item.fileUrl}
                    alt={label}
                    width={800}
                    height={450}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                  />
                )}
                {isVideo ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/70 text-sand motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-110">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        focusable="false"
                        className="h-6 w-6 translate-x-[1px]"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                ) : null}
              </span>
              <span className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="truncate text-sm font-semibold text-ink">
                  {label}
                </span>
                <span className="shrink-0 bg-ink px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sand">
                  {KIND_LABEL[item.kind]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau: ${itemLabel(active, openIndex ?? 0)}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpenIndex(null);
          }}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ink/90 p-4 sm:p-8"
        >
          <figure className="w-full min-w-0 max-w-4xl border border-sand/15 bg-ink-800 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <figcaption className="min-w-0">
                <p className="truncate font-display text-lg uppercase tracking-wide text-sand">
                  {itemLabel(active, openIndex ?? 0)}
                </p>
                <p className="mt-1 text-sm text-sand/70">
                  {KIND_LABEL[active.kind]} · Media {(openIndex ?? 0) + 1} dari{" "}
                  {items.length}
                </p>
              </figcaption>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Tutup pratinjau"
                className="inline-flex shrink-0 items-center gap-2 bg-ember-700 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <IconClose className="h-5 w-5" />
                <span>Tutup</span>
              </button>
            </div>
            <div className="mt-4">
              {active.kind === "video" ? (
                <video
                  key={active.fileUrl}
                  className="max-h-[70dvh] w-full bg-ink"
                  src={active.fileUrl}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={itemLabel(active, openIndex ?? 0)}
                />
              ) : (
                <R2Image
                  src={active.fileUrl}
                  alt={itemLabel(active, openIndex ?? 0)}
                  width={1600}
                  height={900}
                  priority
                  sizes="100vw"
                  className="h-auto max-h-[70dvh] w-full object-contain bg-ink"
                />
              )}
            </div>
          </figure>
        </div>
      ) : null}
    </>
  );
}
