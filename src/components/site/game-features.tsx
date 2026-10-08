import Image from 'next/image'

import { features } from '@/content/baren'
import { SectionShell } from '@/components/site/section-shell'

export function GameFeatures() {
  return (
    <SectionShell id="fitur" tone="light" className="border-t border-ink/10">
      <p className="eyebrow text-ember-700">KEUNGGULAN</p>
      <h2 className="display-xl mt-4 text-ink">FITUR UTAMA</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <article key={feature.index} className="border border-sand-600 bg-sand">
            <div className="relative aspect-square overflow-hidden bg-ink-700">
              <Image
                src={`/art/feature-${index + 1}.jpg`}
                alt={feature.title}
                fill
                sizes="(min-width:768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="font-display text-3xl text-ember-700">{feature.index}</p>
              <h3 className="mt-2 font-display text-xl uppercase text-ink">{feature.title}</h3>
              <p className="mt-3 leading-7 text-ink/75">{feature.description}</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
