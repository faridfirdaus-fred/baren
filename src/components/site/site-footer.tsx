import Image from 'next/image'

import { legalLinks, nav, site, social } from '@/content/baren'
import { IconDiscord, IconInstagram, IconMail, IconTiktok, IconYoutube } from './icon'

export function SiteFooter() {
  const icons = { instagram: IconInstagram, youtube: IconYoutube, discord: IconDiscord, tiktok: IconTiktok }

  return (
    <footer className="bg-ink text-sand">
      <div className="container-baren py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Image src="/brand/baren-mark.svg" alt="" width={40} height={40} />
            <p className="mt-4 font-display text-2xl uppercase">{site.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-sand/60">{site.description}</p>
          </div>
          <div>
            <p className="eyebrow text-sand/50">Navigasi</p>
            <ul className="mt-4 space-y-2">{nav.filter((n) => n.href.startsWith('#')).map((n) => <li key={n.label}><a href={n.href} className="text-sm text-sand/75 hover:text-ember">{n.label}</a></li>)}</ul>
          </div>
          <div>
            <p className="eyebrow text-sand/50">Kontak</p>
            <a href={`mailto:${site.email}`} className="mt-4 inline-flex items-center gap-2 text-sm text-sand/75 hover:text-ember"><IconMail className="h-4 w-4" />{site.email}</a>
          </div>
        </div>
        <ul className="mt-8 flex items-center gap-3">{social.map((s) => { const Icon = icons[s.icon]; return <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center rounded-none bg-ink-700 text-sand transition-colors hover:bg-ember"><Icon className="h-5 w-5" /></a></li> })}</ul>
        <div className="mt-12 border-t border-sand/15 pt-8">
          <p className="text-xs leading-6 text-sand/55">{'\u00a9'} 2026 {site.name}. Seluruh merek dagang adalah milik pemegangnya.</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">{legalLinks.map((l) => <li key={l.label}><a href={l.href} className="eyebrow text-sand/60 hover:text-ember">{l.label}</a></li>)}</ul>
        </div>
      </div>
    </footer>
  )
}
