"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingCard } from "@/lib/landing-cards-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

export interface CharacterItem {
  id: string | number;
  name: string;
  tag: string;
  imageUrl: string;
  description?: string;
}

const FALLBACK_CHAR_IMAGES = [
  "/art/char-biru.jpg",
  "/art/char-merah.jpg",
  "/art/char-hijau.jpg",
  "/art/char-kuning.jpg",
];

const DEFAULT_CHARACTERS: CharacterItem[] = [
  {
    id: "c1",
    name: "Raka — Pelari Biru",
    tag: "TIM BIRU",
    imageUrl: "/art/char-biru.jpg",
    description:
      "Pelari gesit berikat kepala batik yang andal memancing lawan dan merebut benteng.",
  },
  {
    id: "c2",
    name: "Bima — Penjaga Merah",
    tag: "TIM MERAH",
    imageUrl: "/art/char-merah.jpg",
    description:
      "Penjaga benteng tangguh yang sigap menangkap penyusup sebelum menyentuh markas.",
  },
  {
    id: "c3",
    name: "Damar — Penyelamat Hijau",
    tag: "SPESIALIS RESCUE",
    imageUrl: "/art/char-hijau.jpg",
    description:
      "Cerdik mencari celah untuk membebaskan rekan setim dari zona tahanan.",
  },
  {
    id: "c4",
    name: "Sari — Penyerbu Kuning",
    tag: "PENYERBU CEPAT",
    imageUrl: "/art/char-kuning.jpg",
    description:
      "Lincah melakukan dash mengejutkan ke benteng lawan di detik-detik penentuan.",
  },
];

interface CharacterDeckProps {
  customCards?: LandingCard[];
}

export function CharacterDeck({ customCards }: CharacterDeckProps) {
  const items: CharacterItem[] =
    customCards && customCards.length > 0
      ? customCards.map((c, idx) => ({
          id: c.id,
          name: c.title,
          tag: c.eyebrow || `JAGOAN 0${idx + 1}`,
          imageUrl:
            (c.imageUrl && resolvePublicAssetUrl(c.imageUrl)) ||
            c.imageUrl ||
            FALLBACK_CHAR_IMAGES[idx % FALLBACK_CHAR_IMAGES.length],
          description: c.body || c.subtitle || undefined,
        }))
      : DEFAULT_CHARACTERS;

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const total = items.length;
  const safeActive = total === 0 ? 0 : ((activeIndex % total) + total) % total;

  const nextChar = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevChar = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset((e.clientX - startXRef.current) * 0.6);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (dragOffset > 55) prevChar();
    else if (dragOffset < -55) nextChar();
    setDragOffset(0);
  };

  const visibleIndices =
    total <= 3
      ? items.map((_, i) => i)
      : [
          (safeActive - 1 + total) % total,
          safeActive,
          (safeActive + 1) % total,
        ];

  return (
    <section
      id="karakter"
      className="w-full border-y border-zinc-100 bg-zinc-50/80 py-16 select-none sm:py-24"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prevChar();
        if (e.key === "ArrowRight") nextChar();
      }}
      tabIndex={0}
      aria-label="Seksi Karakter Pilih Jagoanmu"
    >
      <div className="container-baren">
        <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-14">
          <span className="pill-eyebrow">JAGOAN</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Pilih Jagoanmu
          </h2>
          <p className="max-w-xl text-sm text-zinc-600 sm:text-base">
            Empat karakter kampung dengan gaya bermain unik siap beradu cepat di
            arena. Geser kartu untuk melihat profil jagoan.
          </p>
        </div>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative flex min-h-[420px] items-center justify-center touch-pan-y ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="flex w-full max-w-4xl items-center justify-center gap-4 sm:gap-6">
            {visibleIndices.map((idx) => {
              const item = items[idx];
              if (!item) return null;
              const isCenter = idx === safeActive;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    transform: isCenter
                      ? `translateX(${isDragging ? dragOffset : 0}px)`
                      : undefined,
                    transition: isDragging ? "none" : "all 0.3s ease",
                  }}
                  className={`overflow-hidden rounded-3xl border bg-white transition-all ${
                    isCenter
                      ? "z-20 w-[270px] shrink-0 border-zinc-300 shadow-xl shadow-zinc-900/8 sm:w-[300px]"
                      : "hidden w-[240px] shrink-0 scale-95 border-zinc-200 opacity-65 hover:opacity-95 md:block"
                  }`}
                >
                  <div className="relative aspect-4/4 w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                      draggable={false}
                      unoptimized
                    />
                  </div>
                  <div className="p-5 text-center">
                    <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700">
                      {item.tag}
                    </span>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-zinc-950">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prevChar}
                aria-label="Geser jagoan sebelumnya"
                className="absolute top-1/2 left-1 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-md transition-all hover:bg-zinc-50 sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextChar}
                aria-label="Geser jagoan selanjutnya"
                className="absolute top-1/2 right-1 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-md transition-all hover:bg-zinc-50 sm:right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${
                safeActive === i
                  ? "w-7 bg-[#c83820]"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Pilih ${item.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
