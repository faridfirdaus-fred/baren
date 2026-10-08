'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { cta, nav } from '@/content/baren'
import { IconArrowUpRight, IconChevronDown, IconClose, IconMenu, IconSearch } from './icon'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    const keyHandler = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('keydown', keyHandler)
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('keydown', keyHandler) }
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-300 ${scrolled ? 'border-b border-ink-700 bg-ink/95 backdrop-blur' : 'bg-transparent'}`}>
      <div className="container-baren flex h-full items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3"><Image src="/brand/baren-mark.svg" alt="" width={32} height={32} /><span className="font-display text-xl uppercase tracking-wide text-sand">BAREN</span></a>
        <nav aria-label="Navigasi utama" className="hidden lg:block"><ul className="flex items-center gap-1">{nav.map((n) => { const cls = 'flex items-center gap-1 px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember'; return <li key={n.label}>{n.hasMenu ? <button type="button" aria-expanded={false} aria-haspopup="true" className={cls}>{n.label}<IconChevronDown className="h-3 w-3" /></button> : <a href={n.href} className={cls} target={n.external ? '_blank' : undefined} rel={n.external ? 'noopener noreferrer' : undefined}>{n.label}{n.external && <IconArrowUpRight className="h-3 w-3" />}</a>}</li> })}</ul></nav>
        <div className="flex items-center gap-3"><button type="button" aria-label="Cari" className="hidden h-10 w-10 items-center justify-center rounded-none text-sand transition-colors hover:bg-ink-700 hover:text-ember lg:flex"><IconSearch className="h-5 w-5" /></button><a href="#daftar" className="hidden rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 lg:inline-flex">{cta.login}</a><button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} className="flex h-10 w-10 items-center justify-center rounded-none text-sand hover:bg-ink-700 lg:hidden">{menuOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}</button></div>
      </div>
      {menuOpen && <div id="mobile-menu" className="border-t border-ink-700 bg-ink lg:hidden"><div className="container-baren py-6"><ul className="flex flex-col gap-1">{nav.map((n) => <li key={n.label}><a href={n.href} onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand hover:text-ember">{n.label}</a></li>)}</ul><a href="#daftar" onClick={() => setMenuOpen(false)} className="mt-4 inline-flex w-full items-center justify-center rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand">{cta.login}</a></div></div>}
    </header>
  )
}
