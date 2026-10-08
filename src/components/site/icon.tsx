interface IconProps {
  className?: string
}

const iconProps = {
  'aria-hidden': true,
  focusable: false,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
}

export function IconSearch({ className }: IconProps) {
  return <svg {...iconProps} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
}

export function IconChevronDown({ className }: IconProps) {
  return <svg {...iconProps} className={className}><path d="m6 9 6 6 6-6" /></svg>
}

export function IconArrowUpRight({ className }: IconProps) {
  return <svg {...iconProps} className={className}><path d="M7 17 17 7M7 7h10v10" /></svg>
}

export function IconPlus({ className }: IconProps) {
  return <svg {...iconProps} className={className}><path d="M12 5v14M5 12h14" /></svg>
}

export function IconMinus({ className }: IconProps) {
  return <svg {...iconProps} className={className}><path d="M5 12h14" /></svg>
}

export function IconMenu({ className }: IconProps) {
  return <svg {...iconProps} className={className}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
}

export function IconClose({ className }: IconProps) {
  return <svg {...iconProps} className={className}><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export function IconInstagram({ className }: IconProps) {
  return <svg {...iconProps} fill="currentColor" stroke="none" className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" fill="currentColor" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
}

export function IconYoutube({ className }: IconProps) {
  return <svg {...iconProps} fill="currentColor" stroke="none" className={className}><path d="M23 12s0-3.5-.45-5.17a2.93 2.93 0 0 0-2.06-2.06C18.82 4.32 12 4.32 12 4.32s-6.82 0-8.49.45A2.93 2.93 0 0 0 1.45 6.83C1 8.5 1 12 1 12s0 3.5.45 5.17a2.93 2.93 0 0 0 2.06 2.06c1.67.45 8.49.45 8.49.45s6.82 0 8.49-.45a2.93 2.93 0 0 0 2.06-2.06C23 15.5 23 12 23 12Z" /><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="currentColor" /></svg>
}

export function IconDiscord({ className }: IconProps) {
  return <svg {...iconProps} fill="currentColor" stroke="none" className={className}><path d="M19.54 5.32A16.2 16.2 0 0 0 15.5 4l-.5 1.02a14.7 14.7 0 0 0-6 0L8.5 4a16.2 16.2 0 0 0-4.04 1.32C1.9 9.17 1.2 12.92 1.55 16.62a16.3 16.3 0 0 0 4.96 2.5l1.2-1.65a10.3 10.3 0 0 1-1.88-.9l.46-.35c3.62 1.68 7.54 1.68 11.12 0l.47.35c-.6.35-1.23.65-1.89.9l1.2 1.65a16.3 16.3 0 0 0 4.96-2.5c.42-4.3-.72-8.02-2.61-11.3ZM8.48 14.43c-1.09 0-1.98-1-1.98-2.23s.87-2.23 1.98-2.23 2 .99 1.99 2.23c0 1.23-.88 2.23-1.99 2.23Zm7.04 0c-1.09 0-1.98-1-1.98-2.23s.87-2.23 1.98-2.23 2 .99 1.99 2.23c0 1.23-.88 2.23-1.99 2.23Z" /></svg>
}

export function IconTiktok({ className }: IconProps) {
  return <svg {...iconProps} fill="currentColor" stroke="none" className={className}><path d="M16.6 3c.3 2.7 1.8 4.3 4.4 4.5v3.1a10.5 10.5 0 0 1-4.4-1.3v6.2a6.5 6.5 0 1 1-5.6-6.4v3.3a3.2 3.2 0 1 0 2.5 3.1V3h3.1Z" /></svg>
}

export function IconMail({ className }: IconProps) {
  return <svg {...iconProps} className={className}><rect x="3" y="5" width="18" height="14" /><path d="m3 7 9 6 9-6" /></svg>
}
