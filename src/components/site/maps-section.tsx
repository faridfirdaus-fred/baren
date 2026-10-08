import Image from 'next/image'

import { maps } from '@/content/baren'
import { CtaButton } from './cta-button'
import { SectionShell } from './section-shell'

export function MapsSection() {
  return (
    <SectionShell id="arena" tone="light">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-ember-700">{maps.eyebrow}</p>
          <h2 className="display-xl mt-4 text-ink">{maps.title}</h2>
          <p className="mt-5 text-lg font-medium text-ink">{maps.subtitle}</p>
          {maps.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-lg leading-7 text-ink/80">{paragraph}</p>
          ))}
          <div className="mt-10"><CtaButton href={maps.ctaHref} variant="ember">{maps.ctaLabel}</CtaButton></div>
        </div>
        <div className="relative aspect-square overflow-hidden border-2 border-ink bg-ink-700">
          <Image src="/art/maps-art.jpg" alt="Ilustrasi arena BAREN" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </SectionShell>
  )
}
