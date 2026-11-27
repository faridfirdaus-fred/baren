"use client";

import { useEffect, useRef, useState } from "react";

import { nextIndex, prevIndex } from "@/lib/carousel";
import type { GalleryItem } from "@/lib/gallery-content";

import { R2Image } from "./r2-image";
import { resolvePublicAssetUrl } from "@/lib/assets-url";
import { IconChevronLeft, IconChevronRight, IconClose, IconPlay } from "./icon";

const LABEL_JENIS: Record<GalleryItem["kind"], string> = {
  image: "Foto",
  screenshot: "Gameplay",
  artwork: "Dokumentasi",
  banner: "Banner",
  video: "Video",
};

function labelItem(item: GalleryItem, posisi: number): string {
  const judul = item.title?.trim();
  if (judul) return judul;
  return item.kind === "video"
    ? `Video BAREN ${posisi + 1}`
    : `Dokumentasi BAREN ${posisi + 1}`;
}

export function GalleryGrid({
  items,
  showCaptions = true,
}: {
  items: GalleryItem[];
  showCaptions?: boolean;
}) {
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
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <span className="relative block aspect-video overflow-hidden bg-zinc-100">
                  {video ? (
                    <>
                      <video
                        src={
                          resolvePublicAssetUrl(item.fileUrl) || item.fileUrl
                        }
                        preload="metadata"
                        muted
                        playsInline
                        aria-hidden="true"
                        tabIndex={-1}
                        className="h-full w-full object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-zinc-950/30 transition-colors group-hover:bg-zinc-950/20"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-900 shadow-md transition-transform group-hover:scale-105">
                          <IconPlay className="ml-0.5 h-5 w-5" />
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
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </span>
                {showCaptions && (
                  <span className="block p-4">
                    <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                      {LABEL_JENIS[item.kind]}
                    </span>
                    <span className="mt-1.5 line-clamp-1 block text-sm font-semibold text-zinc-900">
                      {label}
                    </span>
                  </span>
                )}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-xs"
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelItem(aktif, terpilih ?? 0)}
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3.5">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-900">
                {labelItem(aktif, terpilih ?? 0)}
              </p>
              <p aria-live="polite" className="shrink-0 text-xs text-zinc-500">
                {(terpilih ?? 0) + 1} / {total}
              </p>
              <button
                ref={tutupRef}
                type="button"
                onClick={tutup}
                aria-label="Tutup pratinjau"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-950"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="relative bg-zinc-950">
              {aktif.kind === "video" ? (
                <video
                  key={aktif.id}
                  src={resolvePublicAssetUrl(aktif.fileUrl) || aktif.fileUrl}
                  controls
                  preload="metadata"
                  aria-label={labelItem(aktif, terpilih ?? 0)}
                  className="max-h-[72vh] w-full"
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
                  className="max-h-[72vh] w-full object-contain"
                />
              )}
              {total > 1 ? (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setTerpilih((s) =>
                          s === null ? s : prevIndex(s, total),
                        )
                      }
                      aria-label="Tampilkan media sebelumnya"
                      className="cursor-pointer rounded-full bg-white/90 p-2.5 text-zinc-900 shadow-md transition-colors hover:bg-white"
                    >
                      <IconChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setTerpilih((s) =>
                          s === null ? s : nextIndex(s, total),
                        )
                      }
                      aria-label="Tampilkan media berikutnya"
                      className="cursor-pointer rounded-full bg-white/90 p-2.5 text-zinc-900 shadow-md transition-colors hover:bg-white"
                    >
                      <IconChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
