import type { ReactNode } from 'react'

export function CtaButton({
  href,
  children,
  variant = 'ember',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'ember' | 'ink' | 'ghost'
  className?: string
}) {
  const variantClass = {
    ember: 'bg-ember-700 text-sand hover:bg-ember-800',
    ink: 'bg-ink text-sand hover:bg-ink-800',
    ghost: 'border border-current bg-transparent hover:bg-sand/10',
  }[variant]

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-none px-8 py-4 text-[1.125rem] font-medium uppercase leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClass} ${className}`}
    >
      {children}
    </a>
  )
}
