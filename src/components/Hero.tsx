import { useRef } from 'react'
import { Check } from 'lucide-react'
import { hero } from '../content'
import { gsap, MQ, SplitText, useGSAP } from '../lib/gsap'
import { onIntroDone } from '../lib/intro'
import { movedPointer } from '../lib/hooks'
import { LiveButton, StoreBadges } from './Brand'
import { Aurora, StarField } from './Effects'
import { HeroPhone } from './Screens'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, desktop: '(min-width: 768px)', fine: MQ.fine }, (ctx) => {
        const { motion, desktop, fine } = ctx.conditions as { motion: boolean; desktop: boolean; fine: boolean }
        if (!motion) return

        // ---- intro timeline, played when the loader curtain lifts ----
        const headSplit = SplitText.create(q('[data-split]'), { type: 'chars' })
        const subSplit = SplitText.create(q('[data-sub]'), { type: 'words' })
        const chars = headSplit.chars
        const sub = subSplit.words
        // once everything has landed, put the text back to plain (best kerning, no stray masks)
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onComplete: () => { headSplit.revert(); subSplit.revert() } })
        tl.from(chars, { yPercent: 115, rotate: 10, opacity: 0, duration: 1.2, stagger: 0.018 }, 0)
          .from(q('[data-line-last]'), { yPercent: 115, duration: 1.3 }, 0.35)
          .from(sub, { opacity: 0, y: 14, duration: 0.9, stagger: 0.012, ease: 'power3.out' }, 0.45)
          .from(q('[data-cta] > *'), { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.65)
          .from(q('[data-tick]'), { x: -16, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.85)
          .from(q('[data-enter]'), {
            opacity: 0, y: 140, z: -300, rotationY: desktop ? -38 : 0, rotationX: desktop ? 18 : 0, scale: 0.88,
            duration: 1.8, ease: 'expo.out',
          }, 0.15)
          .from(q('[data-chip]'), { opacity: 0, x: -40, duration: 1 }, 1.1)
          .from(q('[data-stars]'), { opacity: 0, duration: 2, ease: 'none' }, 0)
          .from(q('[data-aurora]'), { opacity: 0, scale: 0.8, duration: 2.4, ease: 'power2.out' }, 0)
        const off = onIntroDone(() => tl.play())

        // floating loop
        gsap.to(q('[data-float]'), { y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' } })

        // ---- scroll: a light parallax as the page sheet slides up over the hero (transforms only, no pin) ----
        if (desktop) {
          gsap.set(q('[data-tilt]'), { rotationY: -14, rotationZ: 3 })
          gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
            .to(q('[data-tilt]'), { rotationY: 0, rotationZ: 0, y: 90 }, 0)
            .to(q('[data-copy]'), { yPercent: 22, opacity: 0.35 }, 0)
            .to(q('[data-aurora]'), { yPercent: 30 }, 0)
            .to(q('[data-chip]'), { y: -40 }, 0)
        }

        // ---- pointer: phone leans toward the cursor, aurora follows softly ----
        if (fine) {
          const px = gsap.quickTo(q('[data-pointer]'), 'rotationY', { duration: 1, ease: 'power3.out' })
          const py = gsap.quickTo(q('[data-pointer]'), 'rotationX', { duration: 1, ease: 'power3.out' })
          const ax = gsap.quickTo(q('[data-aurora]'), 'x', { duration: 2.2, ease: 'power2.out' })
          const ay = gsap.quickTo(q('[data-aurora]'), 'y', { duration: 2.2, ease: 'power2.out' })
          const move = (e: PointerEvent) => {
            if (!movedPointer(e)) return
            const nx = e.clientX / window.innerWidth - 0.5
            const ny = e.clientY / window.innerHeight - 0.5
            px(nx * 14)
            py(-ny * 10)
            ax(nx * 80)
            ay(ny * 60)
          }
          el.addEventListener('pointermove', move)
          return () => { el.removeEventListener('pointermove', move); off() }
        }
        return off
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="relative overflow-hidden">
      <div className="relative flex min-h-svh items-center pb-16 pt-[100px] md:pb-20 md:pt-[120px]">
      <Aurora />
      <StarField />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] md:gap-[clamp(32px,4vw,64px)] md:px-8">
        <div data-copy className="flex flex-col items-start gap-7 will-change-[transform,opacity]">
          <h1 className="h1 hero-h1" aria-label={hero.lines.join(' ')}>
            <span className="line-mask md:whitespace-nowrap" aria-hidden><span data-split className="block">{hero.lines[0]}</span></span>
            <span className="line-mask md:whitespace-nowrap" aria-hidden><span data-split className="block">{hero.lines[1]}</span></span>
            <span className="line-mask md:whitespace-nowrap" aria-hidden><span data-line-last className="grad-text block w-fit pr-[0.06em]">{hero.lines[2]}</span></span>
          </h1>

          <p data-sub className="max-w-[34em] text-muted-foreground">{hero.subline}</p>

          <div data-cta className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <LiveButton />
            <StoreBadges />
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-muted-foreground">
            {hero.ticks.map((t) => (
              <li key={t} data-tick className="flex items-center gap-2">
                <Check className="size-4 text-primary" strokeWidth={2.4} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* floating phone: scroll tilt → pointer lean → entrance → float */}
        <div className="order-first flex justify-center [perspective:1500px] md:order-none">
          <div data-tilt style={{ transformStyle: 'preserve-3d' }}>
            <div data-pointer style={{ transformStyle: 'preserve-3d' }}>
              <div data-enter style={{ transformStyle: 'preserve-3d' }}>
                <div data-float style={{ transformStyle: 'preserve-3d' }}>
                  <HeroPhone />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>
    </section>
  )
}
