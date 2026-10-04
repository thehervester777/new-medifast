import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, Github, Hospital, Linkedin, Plus, Store, Warehouse } from 'lucide-react'
import clsx from 'clsx'
import { about, customers, faq, links } from '../../content'
import { gsap, MQ, ScrollTrigger, SplitText, prefersReducedMotion, useGSAP } from '../../lib/gsap'
import { movedPointer, useMagnetic, useTilt } from '../../lib/hooks'
import { Head } from '../Head'
import { section, wrap } from './Story'
import { routeHref } from '../../lib/router'
import portrait from '../../assets/rishu-mondal.webp'

/* ---------- Customers: cards fold up into place, then lean toward the pointer ---------- */
const customerIcons = [Store, Hospital, Warehouse]

function CustomerCard({ i, tag, title, body }: { i: number; tag: string; title: string; body: string }) {
  const ref = useRef<HTMLElement>(null)
  useTilt(ref, 6)
  const Icon = customerIcons[i]
  return (
    <div data-card>
      <article
        ref={ref}
        className="spot relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] border border-border bg-card p-7 transition-[border-color] duration-300 hover:border-border-hi md:p-8"
      >
        <span aria-hidden className="pointer-events-none absolute -right-3 -top-6 font-display text-[120px] font-bold leading-none tracking-[-0.06em] text-foreground/[0.05]">0{i + 1}</span>
        <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,hsl(357_85%_59%/.2),hsl(226_92%_63%/.2))] ring-1 ring-white/10">
          <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="mt-2 text-[12px] font-medium tracking-[0.16em] text-primary">{tag}</span>
        <h3 className="-mt-1 text-[22px] tracking-[-0.02em]">{title}</h3>
        <p className="text-base text-muted-foreground">{body}</p>
      </article>
    </div>
  )
}

export function Customers() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        ScrollTrigger.batch(gsap.utils.toArray('[data-card]', root.current), {
          start: 'top 94%',
          once: true,
          onEnter: (b) => gsap.from(b, { y: 110, rotationX: 38, opacity: 0, transformPerspective: 1000, transformOrigin: '50% 100%', duration: 1.4, stagger: 0.13, ease: 'expo.out', clearProps: 'transform' }),
        })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} id="customers" className={section}>
      <div className={wrap}>
        <Head label={customers.label} heading={customers.heading} />
        <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-3 md:gap-5">
          {customers.items.map((c, i) => <CustomerCard key={c.title} i={i} {...c} />)}
        </div>
      </div>
    </section>
  )
}

/* ---------- FAQ: one open at a time, heights tweened ----------
   The list reserves the height of its tallest state, so opening or closing an answer never changes the
   page height. Nothing below it moves, the page background never has to repaint, and no scroll
   positions need re-measuring: only the two answers that swap are redrawn. */
let refreshCall: gsap.core.Tween | null = null
const queueRefresh = () => {
  refreshCall?.kill()
  refreshCall = gsap.delayedCall(0.1, () => ScrollTrigger.refresh())
}

export function Faq() {
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(0)
  const first = useRef(true)

  useLayoutEffect(() => {
    const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', root.current)
    const instant = first.current || prefersReducedMotion()
    first.current = false
    panels.forEach((p, i) => {
      const on = i === open
      gsap.to(p, {
        height: on ? 'auto' : 0,
        duration: instant ? 0 : 0.6,
        ease: 'power3.inOut',
        overwrite: true,
      })
      gsap.to(p.firstElementChild, { opacity: on ? 1 : 0, y: on ? 0 : -8, duration: instant ? 0 : 0.5, delay: on && !instant ? 0.15 : 0, overwrite: true })
    })
  }, [open])

  // reserve room for the tallest answer: closed rows + gaps + the longest answer
  useLayoutEffect(() => {
    const el = list.current
    if (!el) return
    let last = -1
    const fit = () => {
      const cards = Array.from(el.children) as HTMLElement[]
      const panels = cards.map((c) => c.querySelector<HTMLElement>('[data-panel]')!)
      const answers = panels.map((p) => p.firstElementChild as HTMLElement)
      el.style.minHeight = ''
      const cardsH = cards.reduce((sum, c) => sum + c.offsetHeight, 0)
      const gaps = el.offsetHeight - cardsH
      const closed = cards.reduce((sum, c, i) => sum + c.offsetHeight - panels[i].offsetHeight, 0)
      const tallest = Math.max(...answers.map((a) => a.offsetHeight))
      const h = Math.ceil(closed + gaps + tallest)
      el.style.minHeight = `${h}px`
      // only a real reflow (new width, fonts) changes this, and then positions below need re-measuring
      if (last !== -1 && h !== last) queueRefresh()
      last = h
    }
    fit()
    const ro = new ResizeObserver(() => fit())
    Array.from(el.querySelectorAll('[data-panel] > *')).forEach((a) => ro.observe(a))
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        ScrollTrigger.batch(gsap.utils.toArray('[data-q]', root.current), {
          start: 'top 95%',
          once: true,
          onEnter: (b) => gsap.from(b, { y: 50, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }),
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="faq" className={clsx(section, 'pt-0 md:pt-0')}>
      <div className={clsx(wrap, 'grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:gap-[clamp(40px,6vw,96px)]')}>
        <Head label={faq.label} heading={faq.heading} className="md:sticky md:top-[140px]" />
        <div ref={list} className="flex flex-col gap-3">
          {faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                data-q
                className={clsx(
                  'rounded-[20px] border bg-card transition-[border-color] duration-500',
                  isOpen ? 'border-border-hi' : 'border-border hover:border-border-hi',
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[17px] font-medium md:px-7"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {item.q}
                  <span
                    className={clsx(
                      'grid size-8 flex-none place-items-center rounded-full transition-[rotate,background-color,color] duration-500 ease-calm',
                      isOpen ? 'rotate-45 bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                    )}
                  >
                    <Plus className="size-4" strokeWidth={2.2} aria-hidden />
                  </span>
                </button>
                <div id={`faq-${i}`} data-panel className="overflow-hidden" style={{ height: i === 0 ? 'auto' : 0 }} role="region" aria-hidden={!isOpen}>
                  <p className="px-6 pb-6 text-base text-muted-foreground md:px-7">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- About: an editorial profile — monogram portrait, name, pull-quote and what he built ---------- */
function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref, 0.35)
  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="grid size-12 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-border-hi hover:text-foreground"
    >
      {children}
    </a>
  )
}

export function About() {
  const root = useRef<HTMLElement>(null)
  const portfolio = useRef<HTMLAnchorElement>(null)
  useMagnetic(portfolio, 0.25)

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, desktop: '(min-width: 768px)', fine: MQ.fine }, (ctx) => {
        const { motion, desktop, fine } = ctx.conditions as { motion: boolean; desktop: boolean; fine: boolean }
        if (!motion) return

        // ---- one choreographed entrance when the profile scrolls into view ----
        const name = SplitText.create(q('[data-name]'), { type: 'chars', mask: 'chars', charsClass: 'sc' })
        const quote = SplitText.create(q('[data-quote]'), { type: 'words', mask: 'words', wordsClass: 'sw' })
        const tl = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: q('[data-profile]')[0], start: 'top 82%', once: true },
          onComplete: () => { name.revert(); quote.revert() },
        })
        // the portrait wipes up into its frame: the frame slides in while the photo inside counter-slides,
        // so the photo appears to stay put (transforms only, no clip-path repaints)
        tl.fromTo(q('[data-portrait]'), { yPercent: 100 }, { yPercent: 0, duration: 1.5, ease: 'expo.inOut' }, 0)
          .fromTo(q('[data-portrait-inner]'), { yPercent: -100 }, { yPercent: 0, duration: 1.5, ease: 'expo.inOut' }, 0)
          .from(q('[data-portrait-inner]'), { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.15)
          .from(q('[data-layer-glow]'), { opacity: 0, duration: 1.6, ease: 'power2.out' }, 0.9)
          .from(q('[data-corner]'), { opacity: 0, scale: 0.4, duration: 0.8, stagger: 0.06 }, 1.1)
          .from(name.chars, { yPercent: 110, duration: 1.1, stagger: 0.03 }, 0.35)
          .from(q('[data-role]'), { x: -24, opacity: 0, duration: 0.9 }, 0.6)
          .from(q('[data-rule]'), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0.7)
          .from(q('[data-quote-mark]'), { scale: 0, rotate: -20, opacity: 0, duration: 1, ease: 'back.out(2)' }, 0.85)
          .from(quote.words, { yPercent: 105, duration: 1, stagger: 0.035 }, 0.9)
          .from(q('[data-skill]'), { y: 26, opacity: 0, duration: 0.9, stagger: 0.07 }, 1.15)
          .from(q('[data-skill-line]'), { scaleX: 0, duration: 1, stagger: 0.07, ease: 'expo.inOut' }, 1.1)
          .from(q('[data-links] > *'), { y: 18, opacity: 0, duration: 0.8, stagger: 0.07 }, 1.45)

        // ---- depth while scrolling: the portrait drifts slower than the page ----
        if (desktop) {
          gsap.fromTo(q('[data-portrait-wrap]'), { yPercent: 6 }, {
            yPercent: -6, ease: 'none',
            scrollTrigger: { trigger: q('[data-profile]')[0], start: 'top bottom', end: 'bottom top', scrub: true },
          })
        }

        // ---- the photo and the glows shift with the pointer, like layers in glass ----
        if (fine) {
          const portrait = q('[data-portrait]')[0] as HTMLElement
          const mx = gsap.quickTo(q('[data-layer-photo]'), 'x', { duration: 1, ease: 'power3.out' })
          const my = gsap.quickTo(q('[data-layer-photo]'), 'y', { duration: 1, ease: 'power3.out' })
          const gx = gsap.quickTo(q('[data-layer-glow]'), 'x', { duration: 1.6, ease: 'power3.out' })
          const gy = gsap.quickTo(q('[data-layer-glow]'), 'y', { duration: 1.6, ease: 'power3.out' })
          const move = (e: PointerEvent) => {
            if (!movedPointer(e)) return
            const r = portrait.getBoundingClientRect()
            const nx = (e.clientX - r.left) / r.width - 0.5
            const ny = (e.clientY - r.top) / r.height - 0.5
            mx(nx * -12); my(ny * -12); gx(nx * 36); gy(ny * 36)
          }
          const leave = () => { mx(0); my(0); gx(0); gy(0) }
          portrait.addEventListener('pointermove', move)
          portrait.addEventListener('pointerleave', leave)
          return () => { portrait.removeEventListener('pointermove', move); portrait.removeEventListener('pointerleave', leave) }
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className={clsx(section, 'pt-0 md:pt-0')}>
      <div className={wrap}>
        <Head label={about.label} heading={about.heading} />

        <div data-profile className="mt-12 grid grid-cols-1 items-center gap-12 md:mt-16 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-[clamp(40px,6vw,96px)]">
          {/* portrait */}
          <div data-portrait-wrap className="mx-auto w-full max-w-[360px] will-change-transform md:max-w-[440px]">
            <div className="overflow-hidden rounded-[28px] shadow-[0_50px_120px_-50px_rgb(0_0_0/.9)]">
            <div
              data-portrait
              className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-border bg-card"
            >
              <div data-portrait-inner className="absolute inset-0">
                {/* a little larger than the frame, so it can lean with the pointer without showing an edge */}
                <div data-layer-photo className="absolute -inset-4">
                  <img
                    src={portrait}
                    alt={`${about.name}, ${about.role.toLowerCase()}`}
                    width={816}
                    height={1020}
                    decoding="async"
                    className="size-full object-cover object-[50%_30%]"
                  />
                </div>
                {/* MediFast red and blue light falling across the photo */}
                <div data-layer-glow aria-hidden className="pointer-events-none absolute -inset-10">
                  <span className="absolute -left-10 -top-10 size-[70%] rounded-full bg-[radial-gradient(closest-side,hsl(357_85%_59%/.22),transparent)]" />
                  <span className="absolute -bottom-10 -right-10 size-[75%] rounded-full bg-[radial-gradient(closest-side,hsl(226_92%_63%/.24),transparent)]" />
                </div>
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(transparent,hsl(236_52%_6%/.65))]" />
              </div>
              {/* viewfinder corners */}
              {['left-4 top-4 border-l border-t', 'right-4 top-4 border-r border-t', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'].map((c) => (
                <span key={c} data-corner aria-hidden className={clsx('absolute size-5 rounded-[3px] border-foreground/30', c)} />
              ))}
            </div>
            </div>
          </div>

          {/* profile */}
          <div className="flex flex-col items-start">
            <h3 data-name className="text-[clamp(36px,4.2vw,58px)] leading-[1.05] tracking-[-0.04em]">{about.name}</h3>
            <span data-role className="label mt-4">{about.role}</span>
            <span data-rule aria-hidden className="mt-8 block h-px w-full origin-left bg-[linear-gradient(90deg,hsl(357_85%_59%/.7),hsl(226_92%_63%/.5),transparent)]" />

            <figure className="relative mt-8 w-full">
              <span data-quote-mark aria-hidden className="absolute -left-1 -top-7 font-display text-[72px] leading-none text-primary md:-left-2 md:-top-8 md:text-[88px]">“</span>
              <blockquote data-quote className="relative pl-1 pt-6 text-[clamp(20px,2.1vw,28px)] font-medium leading-[1.45] tracking-[-0.015em] text-foreground">
                {about.quote}
              </blockquote>
            </figure>

            <ul className="mt-10 grid w-full grid-cols-2 gap-x-8 lg:grid-cols-3">
              {about.skills.map((skill, i) => (
                <li key={skill} className="relative py-3.5">
                  <span data-skill-line aria-hidden className="absolute inset-x-0 top-0 block h-px origin-left bg-border" />
                  <span data-skill className="flex items-baseline gap-3">
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-primary tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[15px] font-medium text-foreground/90">{skill}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div data-links className="mt-9 flex items-center gap-3">
              {/* opens the About me page (with a page transition) */}
              <a ref={portfolio} href={routeHref['about-me']} className="btn-red group/me !min-h-12 !px-6 !text-[15px]">
                {about.portfolio}
                <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover/me:translate-x-1" strokeWidth={2} aria-hidden />
              </a>
              <IconLink href={links.linkedin} label={`${about.name} on LinkedIn`}><Linkedin className="size-[18px]" strokeWidth={1.8} aria-hidden /></IconLink>
              <IconLink href={links.github} label={`${about.name} on GitHub`}><Github className="size-[18px]" strokeWidth={1.8} aria-hidden /></IconLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
