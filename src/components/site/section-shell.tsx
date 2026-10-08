import type { ReactNode } from 'react'

export type SectionTone = 'dark' | 'light' | 'ember'

export function SectionShell({
  id,
  tone = 'dark',
  className = '',
  children,
}: {
  id?: string
  tone?: SectionTone
  className?: string
  children: ReactNode
}) {
  const toneClass = {
    dark: 'bg-ink text-sand',
    light: 'bg-sand text-ink',
    ember: 'bg-ember text-sand',
  }[tone]

  return (
    <section id={id} className={`relative py-12 lg:py-16 ${toneClass} ${className}`}>
      <div className="container-baren">{children}</div>
    </section>
  )
}
