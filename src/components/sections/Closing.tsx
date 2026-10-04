import { useRef } from 'react'
import { Mail, MapPin, Phone as PhoneIcon } from 'lucide-react'
import clsx from 'clsx'
import { brand, cta, footer } from '../../content'
import { gsap, MQ, revealWords, useGSAP } from '../../lib/gsap'
import { LiveButton, StoreBadges, Wordmark } from '../Brand'
import { Aurora } from '../Effects'
import { section, wrap } from './Story'

/* ---------- Closing call to action: the glow swells as the section scrolls in ---------- */
export function FinalCta() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current!
        const q = gsap.utils.selector(el)
        gsap.fromTo(q('[data-orb]'), { scale: 0.5, opacity: 0 }, {
          scale: 1.15, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true },
        })
        revealWords(q('h2')[0], { duration: 1.2, stagger: 0.06 }, { start: 'top 92%' })
        gsap.from(q('[data-in]'), {
          y: 36, opacity: 0, duration: 1.1, stagger: 0.1, delay: 0.3, ease: 'expo.out',
          scrollTrigger: { trigger: q('[data-in]')[0], start: 'top 94%', once: true },
        })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} className={clsx(section, 'overflow-hidden text-center md:py-40')}>
      {/* the orb sits under the aurora, whose edge fades soften both (no masks over moving layers) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          data-orb
          className="will-change-[transform,opacity] absolute left-1/2 top-1/2 size-[min(900px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(357_85%_59%/.22),hsl(226_92%_63%/.18)_38%,transparent_66%)]"
        />
      </div>
      <Aurora placement="cta" />
      <div className={clsx(wrap, 'relative z-10 flex flex-col items-center gap-7')}>
        <h2 className="h2 max-w-[16em] !text-[clamp(36px,5.2vw,72px)]">{cta.heading}</h2>
        <p data-in className="max-w-[36em] text-muted-foreground">{cta.line}</p>
        <div data-in className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <LiveButton className="w-full sm:w-auto" />
          <StoreBadges />
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer: details, then a giant wordmark that rises into place ---------- */
export function Footer() {
  const root = useRef<HTMLElement>(null)
  const o = footer.office
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current!
        const q = gsap.utils.selector(el)
        gsap.from(q('[data-col]'), { y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } })
        gsap.fromTo(q('[data-giant]'), { yPercent: 60, opacity: 0 }, {
          yPercent: 0, opacity: 1, ease: 'none',
          // measure the untransformed wrapper so the end lands exactly at the bottom of the page
          scrollTrigger: { trigger: q('[data-giant]')[0].parentElement, start: 'top bottom', end: 'bottom bottom', scrub: true },
        })
      })
    },
    { scope: root },
  )
  return (
    <footer ref={root} className="relative overflow-hidden border-t border-border pt-16 text-[15px]">
      <div className={wrap}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-8">
          <div data-col className="sm:col-span-2 md:col-span-1">
            <Wordmark />
            <p className="mt-4 text-muted-foreground">{brand.tagline}</p>
          </div>
          <div data-col>
            <h4 className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{footer.explore.heading}</h4>
            <ul className="flex flex-col gap-2.5">
              {footer.explore.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="group/l inline-flex items-center text-foreground/85 transition-colors duration-300 hover:text-foreground">
                    <span className="h-px w-0 bg-primary transition-[width,margin] duration-300 ease-calm group-hover/l:mr-2 group-hover/l:w-3" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div data-col>
            <h4 className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{o.heading}</h4>
            <ul className="flex flex-col gap-3 text-foreground/85">
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-[5px] size-4 flex-none text-primary" strokeWidth={1.8} aria-hidden />
                <a href={o.phone.href} className="transition-colors duration-300 hover:text-foreground">{o.phone.label}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-[5px] size-4 flex-none text-primary" strokeWidth={1.8} aria-hidden />
                <a href={o.email.href} className="break-all transition-colors duration-300 hover:text-foreground">{o.email.label}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-[5px] size-4 flex-none text-primary" strokeWidth={1.8} aria-hidden />
                <address className="not-italic">{o.address[0]}<br />{o.address[1]}</address>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-1.5 border-t border-border pt-6 text-[13px] text-muted-foreground sm:flex-row sm:justify-between">
          <span>{footer.copyright}</span>
          <span>{footer.note}</span>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none mt-6 select-none overflow-hidden pb-10 sm:pb-24 md:pb-28">
        <div
          data-giant
          className="will-change-[transform,opacity] grad-text pb-[1vw] text-center font-display text-[19vw] font-bold leading-none tracking-[-0.06em] opacity-90 [mask-image:linear-gradient(#000_45%,transparent_95%)]"
        >
          {brand.name}
        </div>
      </div>
    </footer>
  )
}
