import Image from "next/image";

import { auth } from "@/auth";
import { CtaButton } from "@/components/site/cta-button";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { joinWishlistAction } from "@/components/site/actions";
import { getHeroContent } from "@/lib/hero-content";
import { getHeroBanners } from "@/lib/hero-banners";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

// E6-1 & E14-1: hero dinamis dari tabel `hero` (video/poster/judul/CTA).
// Tanpa fallback runtime: jika baris hero tidak terbit atau tidak siap render,
// seluruh seksi disembunyikan (return null).
// E6-2: banner dari tabel `hero_banners` (0 = hilang, 1 = statis,
// >1 = carousel di <HeroCarousel />).
export async function Hero() {
  const [content, banners, session] = await Promise.all([
    getHeroContent(),
    getHeroBanners(),
    auth().catch(() => null),
  ]);

  if (!content) {
    return <div id="daftar" className="sr-only" />;
  }

  const isLoggedIn = Boolean(session?.user?.email);
  const isWishlistCta =
    content.primaryCtaUrl === "#daftar" ||
    content.primaryCtaUrl === "#wishlist";

  const secondary =
    content.secondaryCtaLabel &&
    content.secondaryCtaUrl &&
    content.secondaryCtaUrl !== "#"
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
        poster={
          resolvePublicAssetUrl(content.poster) ||
          content.poster ||
          "/media/baren-village-keyart.jpg"
        }
        aria-hidden="true"
      >
        <source
          src={resolvePublicAssetUrl(content.videoSrc) || content.videoSrc}
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#2f180a]/90 via-[#2f180a]/65 to-[#2f180a]/95" />
      <div className="container-baren flex flex-col items-center py-14 text-center lg:py-20">
        {/* Eyebrow Badge Pill */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1f1007]/80 backdrop-blur-md border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold uppercase tracking-wider shadow-md">
          <span className="text-[#c83820]">●</span> PARTY GAME LOKAL 2 VS 2 •
          SEGERA DI STEAM
        </div>

        {/* 3D BAREN Wordmark */}
        <Image
          src="/brand/baren-wordmark.png"
          width={533}
          height={100}
          priority
          alt="BAREN"
          className="h-auto w-[clamp(180px,26vw,340px)] drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
        />

        <h1 className="mt-6 max-w-3xl text-xl sm:text-2xl font-black uppercase tracking-wide text-[#faf6ee] drop-shadow-sm">
          {content.title}
        </h1>
        {content.subtitle ? (
          <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-[#faf6ee]/90 font-medium">
            {content.subtitle}
          </p>
        ) : (
          <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-[#faf6ee]/90 font-medium">
            Lari, sembunyi, dan rebut benteng lawan bersama sahabatmu!
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isWishlistCta ? (
            isLoggedIn ? (
              <CtaButton href="#unduh" variant="ember">
                SUDAH TERDAFTAR
              </CtaButton>
            ) : (
              <form action={joinWishlistAction} className="inline-flex">
                <CtaButton type="submit" variant="ember">
                  {content.primaryCtaLabel}
                </CtaButton>
              </form>
            )
          ) : (
            <CtaButton href={content.primaryCtaUrl} variant="ember">
              {content.primaryCtaLabel}
            </CtaButton>
          )}
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
