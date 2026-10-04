/**
 * MagnificationDock — macOS-style dock with magnification and tooltips.
 *
 * Lightweight version: no animation library on the React side and no re-renders while you hover.
 *  - resting item centres are measured once when the pointer enters (no layout reads per frame)
 *  - sizes ease toward their targets on the GSAP ticker and the loop stops itself when settled
 *  - tooltips and the active-section dot are plain CSS
 *  - items are real links, so they work with the keyboard, screen readers and smooth scrolling
 *  - `magnify` can be switched off (touch, reduced motion) and the dock stays a tidy icon bar
 */
import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import clsx from 'clsx'
import { gsap } from '../lib/gsap'
import { movedPointer } from '../lib/hooks'

export type DockItemData = {
  icon: ReactNode
  label: string
  href: string
  external?: boolean
  /** 'accent' renders the item in MediFast red (used for the primary action) */
  tone?: 'default' | 'accent'
  /** draw a thin divider before this item, like the macOS dock separator */
  separatorBefore?: boolean
  className?: string
}

export type DockProps = {
  items: DockItemData[]
  className?: string
  /** pointer distance (px) over which neighbours grow */
  distance?: number
  /** size (px) of the item right under the pointer */
  magnification?: number
  magnify?: boolean
  ariaLabel?: string
}

export function MagnificationDock({ items, className, magnification = 76, distance = 180, magnify = true, ariaLabel = 'Sections' }: DockProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = ref.current
    if (!nav || !magnify) return

    let els: HTMLElement[] = []
    let icons: HTMLElement[] = []
    let centers: number[] = []
    let sizes: number[] = []
    let base = 48
    let pointerX = -1e6
    let running = false

    const measure = () => {
      els = Array.from(nav.querySelectorAll<HTMLElement>('[data-dock-item]')).filter((e) => e.offsetParent !== null)
      icons = els.map((e) => e.querySelector<HTMLElement>('[data-dock-icon]')!)
      els.forEach((e) => { e.style.width = ''; e.style.height = '' })
      icons.forEach((i) => { i.style.transform = '' })
      base = els[0]?.offsetWidth || 48
      centers = els.map((e) => { const r = e.getBoundingClientRect(); return r.left + r.width / 2 })
      sizes = els.map(() => base)
    }

    const tick = (_t: number, dt: number) => {
      const k = 1 - Math.exp(-Math.min(dt, 64) / 70)
      let settled = true
      for (let i = 0; i < els.length; i++) {
        const d = Math.abs(pointerX - centers[i])
        const target = d >= distance ? base : base + (magnification - base) * Math.cos((d / distance) * (Math.PI / 2))
        const next = sizes[i] + (target - sizes[i]) * k
        if (Math.abs(target - next) > 0.15) settled = false
        sizes[i] = next
        const px = `${next.toFixed(2)}px`
        els[i].style.width = px
        els[i].style.height = px
        icons[i].style.transform = `scale(${(1 + ((next - base) / (magnification - base)) * 0.28).toFixed(4)})`
      }
      if (settled && pointerX < -1e5) stop()
    }

    const start = () => {
      if (running) return
      running = true
      gsap.ticker.add(tick)
    }
    const stop = () => {
      if (!running) return
      running = false
      gsap.ticker.remove(tick)
      els.forEach((e) => { e.style.width = ''; e.style.height = '' })
      icons.forEach((i) => { i.style.transform = '' })
    }

    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!running) measure()
      pointerX = e.clientX
      start()
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !movedPointer(e)) return
      pointerX = e.clientX
      if (!running) { measure(); start() }
    }
    const leave = () => { pointerX = -1e6 }
    const resize = () => { stop(); pointerX = -1e6 }

    nav.addEventListener('pointerenter', enter)
    nav.addEventListener('pointermove', move)
    nav.addEventListener('pointerleave', leave)
    window.addEventListener('resize', resize)
    return () => {
      stop()
      nav.removeEventListener('pointerenter', enter)
      nav.removeEventListener('pointermove', move)
      nav.removeEventListener('pointerleave', leave)
      window.removeEventListener('resize', resize)
    }
  }, [magnify, magnification, distance, items.length])

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={clsx(
        'relative flex h-[52px] w-fit max-w-full items-end gap-1.5 rounded-[22px] border border-border bg-[hsl(236_44%_9%/.97)] px-2 pb-[7px] [contain:layout_style] sm:h-16 sm:gap-2.5 sm:rounded-[24px] sm:px-3 sm:pb-2',
        'shadow-[0_20px_50px_-24px_rgb(0_0_0/.95),inset_0_1px_0_hsl(0_0%_100%/.05)]',
        // red → blue hairline along the top edge
        'before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,hsl(357_85%_59%/.8),hsl(226_92%_63%/.8),transparent)]',
        className,
      )}
    >
      {items.map((item) => {
        const accent = item.tone === 'accent'
        return (
          <Fragment key={item.href + item.label}>
            {item.separatorBefore && <span aria-hidden className={clsx('mx-0.5 mb-1.5 h-7 w-px shrink-0 self-end bg-border-hi/70 sm:mb-2 sm:h-8', item.className)} />}
            <a
              data-dock-item
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener' : undefined}
              aria-label={item.label}
              className={clsx(
                'group/di relative grid size-[38px] shrink-0 place-items-center rounded-full border outline-none sm:size-12',
                'transition-[border-color,color] duration-300',
                'focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                accent
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-10px_hsl(357_85%_59%/.9),inset_0_1px_0_hsl(0_0%_100%/.25)]'
                  : 'border-border bg-[linear-gradient(160deg,hsl(236_32%_20%),hsl(236_46%_10%))] text-foreground/90 shadow-[inset_0_1px_0_hsl(0_0%_100%/.08)] hover:border-border-hi hover:text-foreground [&.is-active]:border-primary/60 [&.is-active]:text-primary',
                item.className,
              )}
            >
              <span data-dock-icon className="grid place-items-center">
                {item.icon}
              </span>

              {/* tooltip */}
              <span
                role="tooltip"
                className="pointer-events-none absolute -top-9 left-1/2 w-max -translate-x-1/2 translate-y-1 whitespace-pre rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold leading-normal text-foreground opacity-0 shadow-[0_10px_30px_-10px_rgb(0_0_0/.9)] transition-[opacity,translate] duration-200 group-hover/di:-translate-y-1 group-hover/di:opacity-100 group-focus-visible/di:-translate-y-1 group-focus-visible/di:opacity-100"
              >
                {item.label}
              </span>

              {/* active-section dot */}
              {!accent && (
                <span
                  aria-hidden
                  className="absolute -bottom-[6px] left-1/2 size-[5px] -translate-x-1/2 scale-0 rounded-full bg-[image:var(--grad)] opacity-0 transition-[opacity,scale] duration-300 group-[.is-active]/di:scale-100 group-[.is-active]/di:opacity-100"
                />
              )}
            </a>
          </Fragment>
        )
      })}
    </nav>
  )
}

export default MagnificationDock
