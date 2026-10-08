import Image from 'next/image'
import Link from 'next/link'

import { cta, news } from '@/content/baren'
import { IconArrowUpRight } from '@/components/site/icon'
import { SectionShell } from '@/components/site/section-shell'

export function LatestNews() {
  return (
    <SectionShell id="berita" tone="light">
      <div className="flex items-end justify-between gap-6 border-b border-ink/15 pb-5">
        <h2 className="display-xl text-[clamp(2rem,4vw,3.25rem)]">ARTIKEL TERBARU</h2>
        <a href="#berita" className="eyebrow inline-flex items-center gap-2 text-ink hover:text-ember-700">
          {cta.newsAll}
          <IconArrowUpRight className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {news.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
          >
            <div className="relative aspect-video overflow-hidden bg-ink-700">
              <Image
                src={`/art/cover-${index + 1}.jpg`}
                fill
                sizes="(min-width:768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                alt={item.title}
              />
            </div>
            <p className="mt-4 flex items-center gap-3 text-sm">
              <span className="font-bold uppercase tracking-wide text-ember-700">{item.category}</span>
              <span className="h-4 w-px bg-ink/25" />
              <span className="text-ink/70">{item.date}</span>
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-snug text-ink group-hover:text-ember-700">{item.title}</h3>
          </Link>
        ))}
      </div>
    </SectionShell>
  )
}
