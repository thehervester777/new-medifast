import { useRef } from 'react'
import { Bell, Repeat, ScanLine } from 'lucide-react'
import clsx from 'clsx'
import { app } from '../../content'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { scrollToY } from '../../lib/smooth'
import { StoreBadges } from '../Brand'
import { Phone, showShot, type ScreenKey } from '../Screens'
import { wrap } from './Story'

// each feature shows the screen it belongs to
const featureScreens: ScreenKey[] = ['cart', 'search', 'home']
const icons = [Repeat, ScanLine, Bell]

/** On large screens the section pins and scrolling walks through the three features;
    elsewhere it cycles on its own and each feature can be tapped. */
export function TheApp() {
  const root = useRef<HTMLElement>(null)
  const select = useRef<(i: number) => void>(() => {})

  useGSAP(
    () => {
      const el = root.current!
      const phone = el.querySelector('.phone')!
      const items = gsap.utils.toArray<HTMLElement>('[data-feature]', el)
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', el)
      let current = 0

      const setActive = (i: number) => {
        if (i === current) return
        current = i
        items.forEach((it, n) => it.classList.toggle('is-active', n === i))
        showShot(phone, i, 0.8)
      }
      items[0].classList.add('is-active')

      const mm = gsap.matchMedia()
      mm.add({ pin: `${MQ.motion} and (min-width: 1024px) and (min-height: 820px)`, motion: MQ.motion, reduce: MQ.reduce }, (ctx) => {
        const { pin, motion } = ctx.conditions as { pin: boolean; motion: boolean }

        if (motion) {
          gsap.from(el.querySelectorAll('[data-copy] > *'), {
            y: 40, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          })
          gsap.from(el.querySelector('[data-device]'), {
            y: 160, rotationX: 24, scale: 0.85, opacity: 0, duration: 1.6, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          })
        }

        if (pin) {
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: el.querySelector('[data-pin]'),
              start: 'top top',
              end: '+=210%',
              pin: true,
              scrub: true,
              // matchMedia rebuilds this pin after a resize, which puts it after every ScrollTrigger below it.
              // Setting a priority makes GSAP refresh in page order (pin first), so their positions include the pin spacing.
              refreshPriority: 1,
              onUpdate: (self) => setActive(Math.min(2, Math.floor(self.progress * 3 * 0.999))),
            },
          })
          bars.forEach((b, i) => tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: 1 }, i))
          tl.fromTo(el.querySelector('[data-turn]'), { rotationY: -10, rotationZ: 2 }, { rotationY: 10, rotationZ: -2, duration: 3 }, 0)
          select.current = (i) => {
            const st = tl.scrollTrigger!
            const y = st.start + (st.end - st.start) * ((i + 0.5) / 3)
            scrollToY(y)
          }
        } else {
          // cycle on its own; a tap jumps to that feature and restarts the clock
          bars.forEach((b) => gsap.set(b, { scaleX: 0 }))
          let fill: gsap.core.Tween | null = null
          const run = (i: number) => {
            setActive(i)
            bars.forEach((b, n) => n !== i && gsap.set(b, { scaleX: n < i ? 1 : 0 }))
            fill?.kill()
            fill = gsap.fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: motion ? 3.4 : 0.01, ease: 'none', onComplete: () => run((i + 1) % 3), paused: !motion })
            if (!motion) bars.forEach((b, n) => gsap.set(b, { scaleX: n === i ? 1 : 0 }))
          }
          select.current = run
          run(0)
          if (motion) {
            ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? fill?.resume() : fill?.pause()) })
          }
          return () => fill?.kill()
        }

      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="app" className="relative overflow-x-clip">
      <div data-pin data-nav-flush className="flex items-center py-24 lg:min-h-svh lg:pb-[116px] lg:pt-[84px]">
        <div className={clsx(wrap, 'grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:gap-[clamp(36px,5vw,80px)]')}>
          <div data-copy className="flex flex-col items-start gap-5">
            <span className="label">{app.label}</span>
            <h2 className="h2">{app.heading}</h2>
            <p className="max-w-[32em] text-muted-foreground">{app.body}</p>
            <ul className="mt-1 flex w-full max-w-[460px] flex-col gap-1.5">
              {app.features.map((f, i) => {
                const Icon = icons[i]
                return (
                  <li key={f}>
                    <button
                      type="button"
                      data-feature
                      onClick={() => select.current(i)}
                      className="group/f relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent px-4 py-3 text-left text-[17px] text-muted-foreground transition-[background-color,border-color,color] duration-500 ease-calm hover:text-foreground [&.is-active]:border-border [&.is-active]:bg-card [&.is-active]:text-foreground"
                    >
                      <span className="grid size-10 flex-none place-items-center rounded-xl border border-border bg-foreground/[0.04] transition-colors duration-500 group-[.is-active]/f:border-primary/40 group-[.is-active]/f:bg-primary/15 group-[.is-active]/f:text-primary">
                        <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
                      </span>
                      {f}
                      <span aria-hidden className="absolute inset-x-4 bottom-0 h-[2px] overflow-hidden rounded-full">
                        <span data-bar className="block h-full w-full origin-left bg-[image:var(--grad)]" style={{ transform: 'scaleX(0)' }} />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{app.getApp}</p>
            <StoreBadges />
          </div>

          <div className="relative flex justify-center [perspective:1400px]">
            <span aria-hidden className="absolute left-1/2 top-1/2 size-[620px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(357_85%_59%/.26),hsl(226_92%_63%/.2)_45%,transparent)]" />
            <div data-turn style={{ transformStyle: 'preserve-3d' }}>
              <div data-device>
                <Phone screens={featureScreens} className="lg:!w-[min(300px,calc((100svh-230px)*9/19.2))]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
