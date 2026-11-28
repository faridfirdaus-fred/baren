import Image from "next/image";

import { auth } from "@/auth";
import { CtaButton } from "@/components/site/cta-button";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { joinWishlistAction } from "@/components/site/actions";
import { getHeroContent } from "@/lib/hero-content";
import { getHeroBanners } from "@/lib/hero-banners";
import { HERO_VIDEO_FALLBACK } from "@/lib/hero-media";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

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
      : { label: "Cara Bermain", href: "#cara-main" };

  const posterSrc =
    resolvePublicAssetUrl(content.poster) ||
    content.poster ||
    "/media/hero-poster.jpg";
  const hasCustomVideo =
    Boolean(content.videoSrc) && content.videoSrc !== HERO_VIDEO_FALLBACK;

  return (
    <section className="pattern-grid relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-white pt-20 pb-12 sm:pt-24 sm:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-2xl -translate-x-1/2 rounded-full bg-[#c83820]/6 blur-3xl"
      />

      <div className="container-baren w-full">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Kolom Kiri: Copy & CTA */}
          <div className="flex flex-col items-start text-left lg:col-span-5">
            <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.35rem]">
              {content.title}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              {content.subtitle ||
                "Lari, sembunyi, dan rebut benteng lawan bersama sahabatmu dalam satu layar penuh tawa."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {isWishlistCta ? (
                isLoggedIn ? (
                  <CtaButton href="#unduh" variant="ink">
                    ✓ Sudah Terdaftar di Wishlist
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

            <div
              id="daftar"
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-200/80 pt-5 text-xs font-medium text-zinc-500"
            >
              <span>4 Pemain Sekaligus</span>
              <span aria-hidden="true" className="text-zinc-300">
                •
              </span>
              <span>Layar Bersama (Couch Co-op)</span>
              <span aria-hidden="true" className="text-zinc-300">
                •
              </span>
              <span>PC via Steam (Segera Hadir)</span>
            </div>
          </div>

          {/* Kolom Kanan: Showcase Visual Game BAREN */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 p-2 shadow-xl shadow-zinc-900/5">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900">
                {hasCustomVideo ? (
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={posterSrc}
                  >
                    <source
                      src={
                        resolvePublicAssetUrl(content.videoSrc) ||
                        content.videoSrc
                      }
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <Image
                    src={posterSrc}
                    alt="Cuplikan permainan BAREN 2 vs 2"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <HeroCarousel banners={banners} />
      </div>
    </section>
  );
}
