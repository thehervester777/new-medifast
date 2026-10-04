import { useRef } from 'react'
import { BatteryMedium, CircleCheck } from 'lucide-react'
import clsx from 'clsx'
import { hero, screens } from '../content'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../lib/gsap'

export type ScreenKey = keyof typeof screens

function StatusBar() {
  return (
    <div className="shot-bar" aria-hidden>
      <span>9:41</span>
      <BatteryMedium strokeWidth={1.8} />
    </div>
  )
}

/** Phone frame. With several screens they are stacked; `data-shot` lets a parent crossfade them. */
export function Phone({ screens: keys, className, active = 0 }: { screens: ScreenKey[]; className?: string; active?: number }) {
  return (
    <div className={clsx('phone', className)}>
      <div className="screen shot">
        <span className="notch" />
        <StatusBar />
        <div className="relative min-h-0 flex-1">
          {keys.map((k, i) => (
            <img
              key={k}
              data-shot={i}
              src={screens[k].src}
              alt={screens[k].alt}
              width={560}
              height={1126}
              decoding="async"
              className="absolute inset-0"
              style={{ opacity: i === active ? 1 : 0 }}
              aria-hidden={i !== active}
            />
          ))}
        </div>
        <span className="glare" />
      </div>
    </div>
  )
}

/** Crossfade helper shared by the hero and the app section */
export function showShot(phone: Element, index: number, duration = 0.9) {
  const shots = gsap.utils.toArray<HTMLElement>('[data-shot]', phone)
  shots.forEach((img, i) => {
    img.setAttribute('aria-hidden', String(i !== index))
    if (i === index) {
      gsap.fromTo(img, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration, ease: 'power3.out', overwrite: true })
    } else if (+getComputedStyle(img).opacity > 0) {
      gsap.to(img, { opacity: 0, scale: 0.98, duration: duration * 0.8, ease: 'power2.out', overwrite: true })
    }
  })
}

const ORDER: ScreenKey[] = ['home', 'search', 'product', 'cart']

/** Hero phone: cycles the four app screens while the hero is on screen, with a matching status card */
export function HeroPhone() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const phone = el.querySelector('.phone')!
      const states = gsap.utils.toArray<HTMLElement>('[data-status]', el)
      gsap.set(states.slice(1), { yPercent: 100, opacity: 0 })
      let i = 0
      const step = () => {
        const prev = states[i]
        i = (i + 1) % ORDER.length
        showShot(phone, i)
        gsap.to(prev, { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power3.in' })
        gsap.fromTo(states[i], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, delay: 0.25, ease: 'power3.out' })
        loop.restart(true)
      }
      const loop = gsap.delayedCall(3.6, step).pause()
      if (!prefersReducedMotion()) {
        // run only while the hero is visible
        ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.restart(true) : loop.pause()) })
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative">
      <Phone screens={ORDER} className="hero-phone" />
      <div
        data-chip
        aria-hidden
        className="absolute -left-6 bottom-[16%] hidden items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-[0_24px_60px_-24px_rgb(0_0_0/.8)] sm:flex md:-left-14"
        style={{ transform: 'translateZ(60px)' }}
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <CircleCheck className="size-[18px]" strokeWidth={2} aria-hidden />
        </span>
        <span className="relative block h-[22px] w-[132px] overflow-hidden text-[14px] font-medium leading-[22px]">
          {hero.statuses.map((s) => (
            <span key={s} data-status className="absolute inset-0 whitespace-nowrap">{s}</span>
          ))}
        </span>
      </div>
    </div>
  )
}
