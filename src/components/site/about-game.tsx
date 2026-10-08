import Image from 'next/image'

import { about } from '@/content/baren'
import { CtaButton } from '@/components/site/cta-button'
import { SectionShell } from '@/components/site/section-shell'

export function AboutGame() {
  return (
    <SectionShell id="tentang" tone="light">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-ember-700">{about.eyebrow}</p>
          <h2 className="display-xl mt-4 text-ink">{about.title}</h2>
          <p className="mt-5 font-sans text-lg font-medium text-ink">{about.subtitle}</p>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-4 text-lg leading-7 text-ink/80">{paragraph}</p>
          ))}
          <div className="mt-10">
            <CtaButton href={about.ctaHref} variant="ink">{about.ctaLabel}</CtaButton>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden border-2 border-ink bg-ink-700">
          <Image src="/art/about-art.jpg" alt="Cuplikan arena BAREN" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </SectionShell>
  )
}
