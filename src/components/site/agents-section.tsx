import Image from 'next/image'

import { agents } from '@/content/baren'
import { CtaButton } from './cta-button'
import { SectionShell } from './section-shell'

export function AgentsSection() {
  return (
    <SectionShell id="pemain" tone="ember" className="pattern-grid">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden border-2 border-ink/20 bg-ink-800">
          <Image src="/art/agents-art.jpg" alt="Ilustrasi pemain BAREN" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow text-ink/80">{agents.eyebrow}</p>
          <h2 className="display-xl mt-4 text-sand">{agents.title}</h2>
          <p className="mt-5 text-lg font-medium text-ink">{agents.subtitle}</p>
          {agents.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-lg leading-7 text-ink/85">{paragraph}</p>
          ))}
          <div className="mt-10"><CtaButton href={agents.ctaHref} variant="ink">{agents.ctaLabel}</CtaButton></div>
        </div>
      </div>
    </SectionShell>
  )
}
