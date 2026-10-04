import { useLayoutEffect, useRef, useState } from 'react'
import { Boxes, CalendarClock, Truck } from 'lucide-react'
import clsx from 'clsx'
import { categories, how, platform } from '../../content'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useSpotlight } from '../../lib/hooks'
import { Head } from '../Head'
import { Phone } from '../Screens'

export const wrap = 'mx-auto w-full max-w-[1280px] px-5 md:px-8'
export const section = 'relative overflow-x-clip py-24 md:py-32'

/* ---------- Categories: an endless strip that speeds up with scroll velocity, then eases back ---------- */
export function Categories() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current!
        const track = el.querySelector<HTMLElement>('[data-track]')!
        el.classList.add('is-moving')
        const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1, paused: true })
        loop.totalTime(38 * 200) // room to run backwards when you scroll up
        // one cheap ticker callback (only while visible): a scroll "kick" decays smoothly back to cruising speed
        let dir = 1
        let boost = 0
        const tick = (_t: number, dt: number) => {
          boost *= Math.exp(-Math.min(dt, 64) / 420)
          loop.timeScale(dir * (1 + boost))
        }
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            if (self.isActive) { loop.resume(); gsap.ticker.add(tick) }
            else { loop.pause(); gsap.ticker.remove(tick) }
          },
          onUpdate: (self) => {
            const v = self.getVelocity()
            if (v) dir = v < 0 ? -1 : 1
            boost = Math.max(boost, Math.min(4, Math.abs(v) / 400))
          },
        })
        gsap.from(el, { opacity: 0, duration: 1.2, scrollTrigger: { trigger: el, start: 'top 95%', once: true } })
        return () => { gsap.ticker.remove(tick); el.classList.remove('is-moving') }
      })
    },
    { scope: root },
  )

  const Items = ({ copy }: { copy?: boolean }) => (
    <ul className="flex flex-wrap items-center justify-center gap-y-3 group-[.is-moving]:shrink-0 group-[.is-moving]:flex-nowrap" aria-hidden={copy || undefined}>
      {categories.map((c) => (
        <li key={c} className="flex items-center whitespace-nowrap px-6 font-display text-[clamp(18px,2vw,26px)] font-medium tracking-[-0.02em] text-foreground/85">
          {c}
          <span aria-hidden className="ml-12 size-2 rounded-full bg-[image:var(--grad)]" />
        </li>
      ))}
    </ul>
  )

  return (
    <section ref={root} aria-label="Product categories" className="group relative z-10 border-y border-border bg-[hsl(236_48%_7.5%)] py-7">
      {/* edge fades drawn as solid overlays (cheaper than masking a moving layer) */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[10%] bg-[linear-gradient(90deg,hsl(236_48%_7.5%),transparent)] group-[.is-moving]:block" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[10%] bg-[linear-gradient(270deg,hsl(236_48%_7.5%),transparent)] group-[.is-moving]:block" />
      <div className="overflow-hidden">
        <div data-track className="flex justify-center group-[.is-moving]:w-max group-[.is-moving]:justify-start group-[.is-moving]:will-change-transform">
          <Items />
          <span className="hidden group-[.is-moving]:contents"><Items copy /></span>
        </div>
      </div>
    </section>
  )
}

/* ---------- How it works: the line scrubs with scroll and lights each step as it passes ---------- */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const [trackH, setTrackH] = useState(0)

  // the line runs from the first dot to the last one
  useLayoutEffect(() => {
    const el = stepsRef.current
    if (!el) return
    const fit = () => setTrackH((el.lastElementChild as HTMLElement).offsetTop)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current!
        const list = el.querySelector<HTMLElement>('[data-steps]')!
        const steps = gsap.utils.toArray<HTMLElement>('.step', el)
        list.classList.add('armed')
        gsap.fromTo(
          '[data-line]',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 72%', end: 'bottom 72%', scrub: true } },
        )
        steps.forEach((s) => {
          ScrollTrigger.create({ trigger: s, start: 'top 74%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') })
          gsap.from(s.querySelectorAll('[data-in]'), {
            x: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
            scrollTrigger: { trigger: s, start: 'top 92%', once: true },
          })
        })
        return () => list.classList.remove('armed')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="how" className={section}>
      <div className={clsx(wrap, 'grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:gap-[clamp(40px,6vw,96px)]')}>
        <Head label={how.label} heading={how.heading} className="md:sticky md:top-[140px]" />
        <div className="relative pl-[40px]">
          <div aria-hidden className="absolute left-[11px] top-4 w-0.5 rounded-sm bg-border" style={{ height: trackH }}>
            <span data-line className="absolute inset-0 origin-top rounded-sm bg-[linear-gradient(180deg,var(--primary),var(--blue))] shadow-[0_0_14px_hsl(357_85%_59%/.6)]" />
          </div>
          <div ref={stepsRef} data-steps className="flex flex-col gap-16 md:gap-24">
            {how.steps.map((s) => (
              <div key={s.step} className="step relative">
                <span data-in className="block text-[13px] font-bold tracking-[0.18em] text-primary tabular-nums">{s.step}</span>
                <h3 data-in className="mt-2 text-[clamp(24px,2.4vw,32px)] leading-[1.15] tracking-[-0.025em]">{s.title}</h3>
                <p data-in className="mt-3 max-w-[32em] text-[17px] text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Platform: rows with phones that rise in 3D and drift at their own depth, then spotlight tiles ---------- */
function Tile({ title, body, Icon }: { title: string; body: string; Icon: typeof Boxes }) {
  const ref = useRef<HTMLDivElement>(null)
  useSpotlight(ref)
  return (
    <div data-tile>
      <div
        ref={ref}
        className="spot group/tile flex h-full flex-col gap-5 rounded-[22px] border border-border bg-card p-6 transition-[border-color,transform] duration-300 ease-calm hover:-translate-y-1 hover:border-border-hi md:p-7"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,hsl(357_85%_59%/.18),hsl(226_92%_63%/.18))] text-foreground ring-1 ring-white/10 transition-transform duration-500 ease-calm group-hover/tile:rotate-[-8deg] group-hover/tile:scale-110">
          <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
        </span>
        <div>
          <b className="block text-[18px] font-medium">{title}</b>
          <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  )
}

const tileIcons = [Boxes, CalendarClock, Truck]

export function Platform() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: MQ.motion, desktop: '(min-width: 768px)' }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        if (!motion) return
        gsap.utils.toArray<HTMLElement>('[data-row]', root.current).forEach((row, i) => {
          const side = i % 2 === 0 ? 1 : -1
          const device = row.querySelector('[data-device]')
          const glow = row.querySelector('[data-glow]')
          gsap.from(device, {
            y: 160, rotationX: 28, rotationY: desktop ? -22 * side : 0, scale: 0.86, opacity: 0, transformPerspective: 1400, duration: 1.6, ease: 'expo.out', clearProps: 'transform',
            scrollTrigger: { trigger: row, start: 'top 88%', once: true },
          })
          gsap.from(glow, { scale: 0.4, opacity: 0, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 80%', once: true } })
          gsap.from(row.querySelectorAll('[data-copy] > *'), {
            y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: row.querySelector('[data-copy]'), start: 'top 92%', once: true },
          })
          if (desktop) {
            // depth: the phone drifts at its own pace as it passes (a plain 2D move, cheap and steady)
            gsap.fromTo(row.querySelector('[data-parallax]'), { yPercent: 10 }, {
              yPercent: -10, ease: 'none',
              scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
            })
          }
        })
        gsap.utils.toArray<HTMLElement>('[data-float]', root.current).forEach((f, i) => {
          gsap.to(f, { y: -12, duration: 3 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.6, scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' } })
        })
        ScrollTrigger.batch(gsap.utils.toArray('[data-tile]', root.current), {
          start: 'top 94%',
          once: true,
          onEnter: (b) => gsap.from(b, { y: 70, rotationX: -30, opacity: 0, transformPerspective: 1000, transformOrigin: '50% 100%', duration: 1.2, stagger: 0.12, ease: 'expo.out', clearProps: 'transform' }),
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="platform" className={clsx(section, 'overflow-x-clip')}>
      <div className={wrap}>
        <Head label={platform.label} heading={platform.heading} intro={platform.intro} />

        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-[clamp(96px,10vw,150px)]">
          {platform.rows.map((r, i) => (
            <div key={r.title} data-row className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-[clamp(36px,6vw,96px)]">
              <div data-copy className={clsx('flex max-w-[30em] flex-col gap-5', i === 1 && 'md:order-2')}>
                <span className="text-[13px] font-bold tracking-[0.18em] text-muted-foreground tabular-nums">0{i + 1} <span className="text-muted-foreground/70">/ 03</span></span>
                <h3 className="text-[clamp(28px,3vw,42px)] leading-[1.1] tracking-[-0.03em]">{r.title}</h3>
                <p className="text-muted-foreground">{r.body}</p>
              </div>
              <div className="relative flex justify-center">
                <span
                  data-glow
                  aria-hidden
                  className={clsx(
                    'absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                    i === 1 ? 'bg-[radial-gradient(circle,hsl(357_85%_59%/.45),transparent_65%)]' : 'bg-[radial-gradient(circle,hsl(226_92%_63%/.45),transparent_65%)]',
                  )}
                />
                <div data-parallax>
                  <div data-device>
                    <div data-float>
                      <Phone screens={[r.screen]} className="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-1 gap-3.5 sm:grid-cols-3 md:mt-32 md:gap-5">
          {platform.tiles.map((t, i) => (
            <Tile key={t.title} title={t.title} body={t.body} Icon={tileIcons[i]} />
          ))}
        </div>
      </div>
    </section>
  )
}
