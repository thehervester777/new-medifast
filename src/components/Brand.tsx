import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import logo from '../assets/logo-dark.webp'
import { brand, buttons, links } from '../content'
import { useMagnetic } from '../lib/hooks'

export function Wordmark({ className }: { className?: string }) {
  return <img src={logo} alt={brand.name} width={265} height={96} className={clsx('h-[30px] w-auto', className)} />
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-1-2.4-4.2zM14 5.3c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" />
    </svg>
  )
}

function PlayLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" aria-hidden>
      <path d="M4 2.8v18.4c0 .5.5.8.9.6l16-9.2c.4-.2.4-.8 0-1L4.9 2.2c-.4-.2-.9.1-.9.6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4.4 2.6 14.8 13M4.4 21.4 14.8 11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function LiveButton({ className }: { className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref, 0.25)
  return (
    <a ref={ref} href={links.live} target="_blank" rel="noopener" className={clsx('btn-red', className)}>
      {buttons.live}
      <ArrowUpRight className="size-[18px]" strokeWidth={2} aria-hidden />
    </a>
  )
}

function PlayBadge() {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref, 0.2)
  return (
    <a ref={ref} className="badge" href={links.googlePlay} target="_blank" rel="noopener" aria-label={`${buttons.playSmall} ${buttons.play}`}>
      <PlayLogo />
      <span className="flex flex-col text-left leading-[1.15]">
        <small className="text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground">{buttons.playSmall}</small>
        <b className="whitespace-nowrap text-base font-medium">{buttons.play}</b>
      </span>
    </a>
  )
}

/** Google Play is a link; the App Store badge reads "Coming soon" and is not a link. */
export function StoreBadges() {
  return (
    <div className="flex w-full flex-wrap gap-3 sm:w-auto">
      <PlayBadge />
      <span className="badge cursor-default border-dashed" role="note" aria-label={`${buttons.appSmall} ${buttons.app}`}>
        <AppleLogo />
        <span className="flex flex-col text-left leading-[1.15]">
          <small className="text-[11px] font-medium text-muted-foreground">{buttons.appSmall}</small>
          <b className="whitespace-nowrap text-base font-medium">{buttons.app}</b>
        </span>
      </span>
    </div>
  )
}
