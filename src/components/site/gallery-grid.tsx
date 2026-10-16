"use client";

import { useEffect, useRef, useState } from "react";

import { nextIndex, prevIndex } from "@/lib/carousel";
import type { GalleryItem } from "@/lib/gallery-content";

import { R2Image } from "./r2-image";
import { IconChevronLeft, IconChevronRight, IconClose, IconPlay } from "./icon";

const LABEL_JENIS: Record<GalleryItem["kind"], string> = {
  image: "Gambar",
  screenshot: "Screenshot",
  artwork: "Artwork",
  banner: "Banner",
  video: "Video",
};

function labelItem(item: GalleryItem, posisi: number): string {
  const judul = item.title?.trim();
  if (judul) return judul;
  return item.kind === "video"
    ? `Video galeri BAREN ${posisi + 1}`
    : `Gambar galeri BAREN ${posisi + 1}`;
}

/**
 * E6-7 — Grid galeri responsif (1 kolom 360px → 2 kolom ≥640px →
 * 3 kolom ≥1024px). Tiap jenis media (foto/banner/video) tampil sesuai
 * urutan admin; gambar via R2Image lazy, video berupa pratinjau bisu
 * + lencana Video. Klik/ketuk membuka lightbox (E6-8).
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [terpilih, setTerpilih] = useState<number | null>(null);
  const pemicuRef = useRef<HTMLElement | null>(null);
  const tutupRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const total = items.length;
  const dialogTerbuka = terpilih !== null;

  const buka = (indeks: number) => {
    pemicuRef.current = document.activeElement as HTMLElement | null;
    setTerpilih(indeks);
  };
  const tutup = () => setTerpilih(null);

  // E6-8: Escape menutup, panah pindah media, Tab dikunci di dialog,
  // scroll badan dikunci, fokus kembali ke pemicu saat tutup.
  // Video berhenti karena elemen <video> di-unmount saat dialog tutup
  // atau saat pindah ke item gambar.
  useEffect(() => {
    if (!dialogTerbuka) return;
    const sisaOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tutupRef.current?.focus();

    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setTerpilih(null);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setTerpilih((s) => (s === null ? s : nextIndex(s, total)));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setTerpilih((s) => (s === null ? s : prevIndex(s, total)));
      } else if (e.key === "Tab" && panelRef.current) {
        const fokusabel = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], video[controls], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);
        if (fokusabel.length === 0) return;
        const pertama = fokusabel[0];
        const terakhir = fokusabel[fokusabel.length - 1];
        if (e.shiftKey && document.activeElement === pertama) {
          e.preventDefault();
          terakhir.focus();
        } else if (!e.shiftKey && document.activeElement === terakhir) {
          e.preventDefault();
          pertama.focus();
        }
      }
    };

    document.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("keydown", tombol);
      document.body.style.overflow = sisaOverflow;
      pemicuRef.current?.focus();
    };
  }, [dialogTerbuka, total]);

  const aktif = terpilih === null ? null : items[terpilih];

  return (
    <>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const label = labelItem(item, i);
          const video = item.kind === "video";
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => buka(i)}
                aria-haspopup="dialog"
                aria-label={`Perbesar ${label}`}
                className="block w-full border border-sand-600 bg-sand text-left transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
              >
                <span className="relative block aspect-video overflow-hidden bg-ink-700">
                  {video ? (
                    <>
                      <video
                        src={item.fileUrl}
                        preload="metadata"
                        muted
                        playsInline
                        aria-hidden="true"
                        tabIndex={-1}
                        className="h-full w-full object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-ink/40"
                      >
                        <span className="bg-ember p-4 text-sand">
                          <IconPlay className="h-6 w-6" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <R2Image
                      src={item.fileUrl}
                      alt={label}
                      width={800}
                      height={450}
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="block p-5">
                  <span className="eyebrow text-ember-700">
                    {LABEL_JENIS[item.kind]}
                  </span>
                  <span className="mt-2 block font-display text-lg uppercase leading-snug text-ink">
                    {label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {aktif === null ? null : (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) tutup();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelItem(aktif, terpilih ?? 0)}
            className="w-full max-w-5xl border border-sand/20 bg-ink-800"
          >
            <div className="flex items-center justify-between gap-4 border-b border-sand/15 p-4">
              <p className="min-w-0 flex-1 truncate font-display text-lg uppercase text-sand">
                {labelItem(aktif, terpilih ?? 0)}
              </p>
              <p aria-live="polite" className="shrink-0 text-sm text-sand/70">
                {(terpilih ?? 0) + 1} dari {total}
              </p>
              <button
                ref={tutupRef}
                type="button"
                onClick={tutup}
                aria-label="Tutup pratinjau"
                className="shrink-0 bg-ember p-3 text-sand transition-colors hover:bg-ember-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="relative bg-black">
              {aktif.kind === "video" ? (
                <video
                  key={aktif.id}
                  src={aktif.fileUrl}
                  controls
                  preload="metadata"
                  aria-label={labelItem(aktif, terpilih ?? 0)}
                  className="max-h-[70vh] w-full"
                >
                  Maaf, peramban Anda tidak mendukung pemutaran video.
                </video>
              ) : (
                <R2Image
                  key={aktif.id}
                  src={aktif.fileUrl}
                  alt={labelItem(aktif, terpilih ?? 0)}
                  width={1600}
                  height={900}
                  sizes="100vw"
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
              {total > 1 ? (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center p-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTerpilih((s) =>
                          s === null ? s : prevIndex(s, total),
                        )
                      }
                      aria-label="Tampilkan media sebelumnya"
                      className="bg-ink/70 p-3 text-sand transition-colors hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      <IconChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center p-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTerpilih((s) =>
                          s === null ? s : nextIndex(s, total),
                        )
                      }
                      aria-label="Tampilkan media berikutnya"
                      className="bg-ink/70 p-3 text-sand transition-colors hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      <IconChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
            <p className="p-4 text-sm leading-6 text-sand/70">
              Tekan Escape untuk menutup.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
