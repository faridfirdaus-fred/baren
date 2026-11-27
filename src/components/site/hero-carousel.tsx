"use client";

import { useCallback, useEffect, useState } from "react";

import { nextIndex, prevIndex, shouldShowCarousel } from "@/lib/carousel";
import type { HeroBannerItem } from "@/lib/hero-banners";

import { R2Image } from "./r2-image";
import { IconChevronLeft, IconChevronRight } from "./icon";

const PUTAR_OTOMATIS_MS = 6000;

export function HeroCarousel({ banners }: { banners: HeroBannerItem[] }) {
  const total = banners.length;
  const geser = shouldShowCarousel(total);
  const [aktif, setAktif] = useState(0);
  const [jeda, setJeda] = useState(false);
  const [interaksi, setInteraksi] = useState(false);
  const [kurangiGerak, setKurangiGerak] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const kini = total === 0 ? 0 : aktif % total;

  const keBanner = useCallback(
    (indeks: number) => {
      if (total > 0) setAktif(((indeks % total) + total) % total);
    },
    [total],
  );
  const berikutnya = useCallback(() => {
    setAktif((a) => nextIndex(a, total));
  }, [total]);
  const sebelumnya = useCallback(() => {
    setAktif((a) => prevIndex(a, total));
  }, [total]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ubah = (e: MediaQueryListEvent) => setKurangiGerak(e.matches);
    mq.addEventListener("change", ubah);
    return () => mq.removeEventListener("change", ubah);
  }, []);

  const putarOtomatis = geser && !jeda && !interaksi && !kurangiGerak;
  useEffect(() => {
    if (!putarOtomatis) return;
    const id = window.setInterval(() => {
      setAktif((a) => nextIndex(a, total));
    }, PUTAR_OTOMATIS_MS);
    return () => window.clearInterval(id);
  }, [putarOtomatis, total]);

  if (total === 0) return null;

  const altBanner = (i: number) => `Banner promosi BAREN ${i + 1}`;

  if (!geser) {
    return (
      <figure className="mx-auto mt-10 w-full max-w-5xl">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          <R2Image
            src={banners[0].imageUrl}
            alt={altBanner(0)}
            width={1600}
            height={900}
            sizes="(min-width:1024px) 1024px, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </figure>
    );
  }

  const item = banners[kini];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner promosi BAREN"
      tabIndex={0}
      onMouseEnter={() => setInteraksi(true)}
      onMouseLeave={() => setInteraksi(false)}
      onFocus={() => setInteraksi(true)}
      onBlur={() => setInteraksi(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          berikutnya();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          sebelumnya();
        }
      }}
      className="mx-auto mt-10 w-full max-w-5xl"
    >
      <p className="sr-only">
        Gunakan tombol panah kiri dan kanan untuk berpindah banner.
      </p>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <R2Image
          key={item.id}
          src={item.imageUrl}
          alt={altBanner(kini)}
          width={1600}
          height={900}
          sizes="(min-width:1024px) 1024px, 100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-y-0 left-0 flex items-center p-3">
          <button
            type="button"
            onClick={sebelumnya}
            aria-label="Tampilkan banner sebelumnya"
            className="rounded-full border border-zinc-200 bg-white/90 p-2.5 text-zinc-800 shadow-sm transition-colors hover:bg-white"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center p-3">
          <button
            type="button"
            onClick={berikutnya}
            aria-label="Tampilkan banner berikutnya"
            className="rounded-full border border-zinc-200 bg-white/90 p-2.5 text-zinc-800 shadow-sm transition-colors hover:bg-white"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <div
          role="group"
          aria-label="Pilih banner"
          className="flex items-center gap-2"
        >
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => keBanner(i)}
              aria-label={`Tampilkan banner ${i + 1} dari ${total}`}
              aria-current={i === kini}
              className={`h-2 rounded-full transition-all ${
                i === kini
                  ? "w-8 bg-[#c83820]"
                  : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
        <p aria-live="polite" className="text-xs text-zinc-500">
          Banner {kini + 1} dari {total}
        </p>
        {kurangiGerak ? null : (
          <button
            type="button"
            onClick={() => setJeda((j) => !j)}
            aria-label={
              jeda ? "Putar otomatis banner" : "Jeda putar otomatis banner"
            }
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {jeda ? "Putar" : "Jeda"}
          </button>
        )}
      </div>
    </div>
  );
}
