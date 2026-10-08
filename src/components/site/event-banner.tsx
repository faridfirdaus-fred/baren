import Image from 'next/image'

import { event } from '@/content/baren'
import { CtaButton } from '@/components/site/cta-button'

export function EventBanner() {
  return (
    <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-ink lg:min-h-[640px]">
      <Image src="/art/event-art.jpg" fill priority={false} sizes="100vw" className="-z-10 object-cover" alt="Ilustrasi turnamen benteng BAREN" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="container-baren py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-ember">{event.eyebrow}</p>
          <h2 className="display-xl mt-4 text-sand">{event.title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-7 text-sand/85">{event.paragraphs[0]}</p>
          <div className="mt-10">
            <CtaButton href={event.ctaHref} variant="ember">{event.ctaLabel}</CtaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
