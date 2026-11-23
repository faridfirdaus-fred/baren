"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { LandingCard } from "@/lib/landing-cards-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

export interface CharacterItem {
  id: string | number;
  name: string;
  tag: string;
  tagColor?: string;
  imageUrl: string;
  description?: string;
}

// Data default sesuai mockup BAREN-1
const DEFAULT_CHARACTERS: CharacterItem[] = [
  {
    id: "c1",
    name: "Maskot Oranye",
    tag: "TIM ORANYE",
    tagColor: "bg-[#e4572e] text-white",
    imageUrl: "/art/agents-art.jpg",
    description:
      "Pelari tangguh bermahkota adat oranye yang lincah merebut benteng lawan.",
  },
  {
    id: "c2",
    name: "Maskot Biru",
    tag: "TIM BIRU",
    tagColor: "bg-[#2563eb] text-white",
    imageUrl: "/art/about-art.jpg",
    description:
      "Penjaga benteng setia bertudung biru yang sigap menangkap penyusup.",
  },
  {
    id: "c3",
    name: "Pelari Kampung",
    tag: "SIAP BERLARI",
    tagColor: "bg-[#10b981] text-white",
    imageUrl: "/art/feature-1.jpg",
    description:
      "Anak kampung pemberani berikat kepala batik Nusantara dengan dash cepat.",
  },
];

interface CharacterDeckProps {
  customCards?: LandingCard[];
}

export function CharacterDeck({ customCards }: CharacterDeckProps) {
  // Gunakan data dari CMS jika ada slot karakter/kartu, atau default mockup
  const items: CharacterItem[] =
    customCards && customCards.length > 0
      ? customCards.map((c, idx) => ({
          id: c.id,
          name: c.title,
          tag: c.eyebrow || (idx % 2 === 0 ? "TIM ORANYE" : "TIM BIRU"),
          tagColor:
            c.tone === "ember"
              ? "bg-[#e4572e] text-white"
              : c.tone === "dark"
                ? "bg-[#2563eb] text-white"
                : c.tone === "light"
                  ? "bg-[#10b981] text-white"
                  : idx % 2 === 0
                    ? "bg-[#e4572e] text-white"
                    : "bg-[#2563eb] text-white",
          imageUrl:
            (c.imageUrl && resolvePublicAssetUrl(c.imageUrl)) ||
            (idx === 0
              ? "/art/agents-art.jpg"
              : idx === 1
                ? "/art/about-art.jpg"
                : "/art/feature-1.jpg"),
          description: c.body || c.subtitle || undefined,
        }))
      : DEFAULT_CHARACTERS;

  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reorder / Putar kartu
  const rotateLeft = useCallback(() => {
    setOrder((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, []);

  const rotateRight = useCallback(() => {
    setOrder((prev) => {
      if (prev.length <= 1) return prev;
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
  }, []);

  // Pointer drag handling untuk drag mouse & touch swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startXRef.current;
    // Beri sedikit resistansi saat ditarik jauh
    setDragOffset(diff * 0.75);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Threshold drag untuk reorder/geser kartu
    const threshold = 60;
    if (dragOffset > threshold) {
      rotateRight();
    } else if (dragOffset < -threshold) {
      rotateLeft();
    }
    setDragOffset(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      rotateRight();
    } else if (e.key === "ArrowRight") {
      rotateLeft();
    }
  };

  return (
    <section
      id="karakter"
      className="relative w-full py-16 sm:py-24 bg-[#71c4f5] overflow-hidden select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Seksi Karakter Pilih Jagoanmu"
    >
      {/* Awan Kartun Latar Belakang */}
      <div className="absolute top-8 left-6 w-32 h-12 bg-white/90 rounded-full blur-[0.5px] pointer-events-none" />
      <div className="absolute top-4 left-16 w-20 h-20 bg-white/90 rounded-full blur-[0.5px] pointer-events-none" />
      <div className="absolute top-12 right-12 w-48 h-16 bg-white/85 rounded-full blur-[0.5px] pointer-events-none" />
      <div className="absolute top-6 right-28 w-24 h-24 bg-white/85 rounded-full blur-[0.5px] pointer-events-none" />
      <div className="absolute bottom-8 left-1/3 w-36 h-14 bg-white/70 rounded-full blur-[0.5px] pointer-events-none" />

      <div className="container-baren relative z-10">
        {/* Header Seksi */}
        <div className="text-center flex flex-col items-center gap-3 mb-12 sm:mb-16">
          <span className="pill-eyebrow">
            <Sparkles className="w-3.5 h-3.5" /> KARAKTER
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2f180a] drop-shadow-sm">
            Pilih Jagoanmu
          </h2>
          <p className="text-base sm:text-lg text-[#2f180a]/80 font-medium max-w-xl">
            Maskot menggemaskan dan pelari kampung siap bertanding di arena.
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs font-bold text-[#2f180a]/70 bg-white/60 px-3 py-1 rounded-full shadow-sm">
            <span>💡 Geser / Drag kartu untuk memilih jagoan</span>
          </div>
        </div>

        {/* Draggable Cards Deck Area */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative flex items-center justify-center min-h-[440px] sm:min-h-[480px] touch-pan-y ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            {order.map((itemIdx, stackIndex) => {
              const item = items[itemIdx];
              if (!item) return null;

              // Hitung posisi visual (kartu tengah vs kiri/kanan)
              const total = order.length;
              // offset relatif terhadap kartu tengah (stackIndex 0 atau tengah)
              let relativePos = stackIndex;
              if (total === 3) {
                // Posisi: 0 = kiri, 1 = tengah (fokus), 2 = kanan
                relativePos = stackIndex === 0 ? 0 : stackIndex === 1 ? 1 : 2;
              }

              const isCenter = relativePos === 1 || total === 1;

              // Transform interaktif drag
              const dynamicTranslateX = isDragging ? dragOffset : 0;
              const dynamicRotate = isDragging ? dragOffset * 0.04 : 0;

              return (
                <div
                  key={item.id}
                  style={{
                    transform: `translateX(${dynamicTranslateX}px) rotate(${dynamicRotate}deg)`,
                    transition: isDragging
                      ? "none"
                      : "all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                  className={`relative w-[260px] sm:w-[300px] lg:w-[320px] rounded-3xl bg-white border-4 border-[#2f180a] shadow-2xl overflow-hidden transition-all duration-300 mx-2 sm:mx-4 ${
                    isCenter
                      ? "z-30 scale-100 sm:scale-105 shadow-[0_20px_35px_rgba(47,24,10,0.25)] ring-4 ring-[#f59e0b]/80"
                      : "z-10 scale-90 sm:scale-95 opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Gambar Karakter */}
                  <div className="relative aspect-square w-full bg-[#fdfbf7] p-3 overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#faf6ee] border-2 border-[#2f180a]/10">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 640px) 260px, 320px"
                        draggable={false}
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Info Karakter Bar */}
                  <div className="p-4 sm:p-5 bg-[#2f180a] text-white flex flex-col items-center text-center gap-1.5 border-t-4 border-[#2f180a]">
                    <span
                      className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full ${
                        item.tagColor || "bg-[#e4572e] text-white"
                      }`}
                    >
                      {item.tag}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#faf6ee]/80 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tombol Panah Kiri & Kanan */}
          <button
            type="button"
            onClick={rotateRight}
            aria-label="Geser jagoan sebelumnya"
            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-[#f59e0b] border-2 border-[#2f180a] text-[#2f180a] flex items-center justify-center shadow-lg hover:bg-[#d97706] hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={rotateLeft}
            aria-label="Geser jagoan selanjutnya"
            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-[#f59e0b] border-2 border-[#2f180a] text-[#2f180a] flex items-center justify-center shadow-lg hover:bg-[#d97706] hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Indikator Titik */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                // Putar hingga indeks i berada di tengah
                setOrder((prev) => {
                  const currIdx = prev.indexOf(i);
                  if (currIdx === 1) return prev;
                  if (currIdx === 0) return [prev[2], prev[0], prev[1]];
                  return [prev[1], prev[2], prev[0]];
                });
              }}
              className={`h-3 rounded-full transition-all duration-300 ${
                order[1] === i || items.length <= 1
                  ? "w-8 bg-[#c83820] shadow-sm"
                  : "w-3 bg-white/70 hover:bg-white"
              }`}
              aria-label={`Pilih kartu ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
