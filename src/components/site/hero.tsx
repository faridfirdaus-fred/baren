import Image from 'next/image'

import { hero } from '@/content/baren'
import { CtaButton } from '@/components/site/cta-button'

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[560px] items-center justify-center overflow-hidden bg-ink lg:min-h-[720px]">
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/media/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/media/hero-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/60 to-ink/95" />
      <div className="container-baren flex flex-col items-center py-20 text-center lg:py-28">
        <Image
          src="/brand/baren-wordmark.png"
          width={736}
          height={138}
          priority
          alt="BAREN"
          className="h-auto w-[clamp(200px,26vw,300px)]"
        />
        <h1 className="eyebrow mt-8 max-w-3xl text-sand/90 lg:text-base">{hero.tagline}</h1>
        <div className="mt-10">
          <CtaButton href={hero.ctaHref} variant="ember">{hero.ctaLabel}</CtaButton>
        </div>
        <div id="daftar" className="mt-14 w-full border-t border-sand/15 pt-6">
          <p className="eyebrow text-sand/50">Tersedia di</p>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {hero.platforms.map((platform) => (
              <li key={platform} className="font-display text-lg uppercase tracking-wide text-sand/70">
                {platform} <span className="text-ember">{hero.platformsNote}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
