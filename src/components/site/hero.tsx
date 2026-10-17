import Image from "next/image";

import { CtaButton } from "@/components/site/cta-button";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { getHeroContent } from "@/lib/hero-content";
import { getHeroBanners } from "@/lib/hero-banners";

// E6-1 & E14-1: hero dinamis dari tabel `hero` (video/poster/judul/CTA).
// Tanpa fallback runtime: jika baris hero tidak terbit atau tidak siap render,
// seluruh seksi disembunyikan (return null).
// E6-2: banner dari tabel `hero_banners` (0 = hilang, 1 = statis,
// >1 = carousel di <HeroCarousel />).
export async function Hero() {
  const [content, banners] = await Promise.all([
    getHeroContent(),
    getHeroBanners(),
  ]);

  if (!content) {
    return <div id="daftar" className="sr-only" />;
  }

  const secondary =
    content.secondaryCtaLabel && content.secondaryCtaUrl
      ? { label: content.secondaryCtaLabel, href: content.secondaryCtaUrl }
      : null;

  return (
    <section className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-ink pt-20">
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={content.poster}
        aria-hidden="true"
      >
        <source src={content.videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/60 to-ink/95" />
      <div className="container-baren flex flex-col items-center py-12 text-center lg:py-16">
        <Image
          src="/brand/baren-wordmark.png"
          width={533}
          height={100}
          priority
          alt="BAREN"
          className="h-auto w-[clamp(140px,18.2vw,210px)]"
        />
        <h1 className="mt-8 max-w-3xl text-lg font-bold uppercase tracking-wider text-sand lg:text-xl">
          {content.title}
        </h1>
        {content.subtitle ? (
          <p className="mt-3 max-w-2xl text-lg leading-7 text-sand/80">
            {content.subtitle}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <CtaButton href={content.primaryCtaUrl} variant="ember">
            {content.primaryCtaLabel}
          </CtaButton>
          {secondary ? (
            <CtaButton href={secondary.href} variant="ghost">
              {secondary.label}
            </CtaButton>
          ) : null}
        </div>
        <div id="daftar" className="mt-14 w-full border-t border-sand/15 pt-6">
          <p className="eyebrow text-sand/50">Tersedia di</p>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <li className="font-display text-lg uppercase tracking-wide text-sand/70">
              PC <span className="text-ember">(Segera Hadir)</span>
            </li>
          </ul>
        </div>
        <HeroCarousel banners={banners} />
      </div>
    </section>
  );
}
