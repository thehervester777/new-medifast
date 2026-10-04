import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import type { Route } from '../lib/router'

export type CurtainHandle = {
  /** First load: the curtain already covers the screen; the page name rises in. */
  intro: () => void
  /** First load: fill the gradient rule under the name (0–1) as the page loads. */
  progress: (p: number) => void
  /** Sweep the curtain up over the screen; resolves once it fully covers it. */
  cover: (to: Route) => Promise<void>
  /** Lift the curtain away; `onLift` fires as it starts to move. Resolves once it is gone. */
  reveal: (onLift?: () => void) => Promise<void>
}

const labels: Record<Route, string> = { home: 'MediFast', 'about-me': 'About me' }

/**
 * The page curtain, used both for the first load and for moving between pages.
 * A red→blue sheet and a navy sheet cover the screen, the page's name rises in the middle over a
 * gradient rule, then both sheets carry on upward to reveal the page. On first load the rule fills
 * with real loading progress. Transforms only, so it stays smooth on any screen.
 */
export const PageCurtain = forwardRef<CurtainHandle, { initial: Route }>(function PageCurtain({ initial }, ref) {
  const root = useRef<HTMLDivElement>(null)
  // with reduced motion there is no intro: the page simply appears
  const introOn = useRef(!prefersReducedMotion()).current

  // starting positions, set through GSAP (before first paint) so its transform cache stays exact
  useLayoutEffect(() => {
    const q = gsap.utils.selector(root.current)
    gsap.set(q('[data-curtain-label]'), { yPercent: 110 })
    gsap.set(q('[data-curtain-rule]'), { scaleX: 0, transformOrigin: '0% 50%' })
  }, [])

  useImperativeHandle(ref, () => ({
    intro: () => {
      const el = root.current!
      if (!introOn) return
      const q = gsap.utils.selector(el)
      gsap.fromTo(q('[data-curtain-label]'), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', delay: 0.1 })
    },
    progress: (p) => {
      const rule = root.current?.querySelector<HTMLElement>('[data-curtain-rule]')
      if (rule) gsap.set(rule, { scaleX: Math.min(1, Math.max(0, p)) })
    },
    cover: (to) =>
      new Promise<void>((resolve) => {
        const el = root.current!
        if (prefersReducedMotion()) return resolve()
        const q = gsap.utils.selector(el)
        q('[data-curtain-label]')[0].textContent = labels[to]
        gsap.set(el, { visibility: 'visible', pointerEvents: 'auto' })
        gsap
          .timeline({ onComplete: () => resolve() })
          .fromTo(q('[data-sheet-a]'), { yPercent: 100 }, { yPercent: 0, duration: 0.62, ease: 'power4.inOut' }, 0)
          .fromTo(q('[data-sheet-b]'), { yPercent: 100 }, { yPercent: 0, duration: 0.72, ease: 'expo.inOut' }, 0.08)
          .fromTo(q('[data-curtain-label]'), { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'expo.out' }, 0.38)
          .fromTo(q('[data-curtain-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'expo.inOut' }, 0.38)
      }),
    reveal: (onLift) =>
      new Promise<void>((resolve) => {
        const el = root.current!
        if (prefersReducedMotion()) {
          gsap.set(el, { visibility: 'hidden', pointerEvents: 'none' })
          onLift?.()
          return resolve()
        }
        const q = gsap.utils.selector(el)
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(el, { visibility: 'hidden', pointerEvents: 'none' })
              resolve()
            },
          })
          .to(q('[data-curtain-label]'), { yPercent: -110, duration: 0.5, ease: 'power3.in' }, 0)
          .to(q('[data-curtain-rule]'), { scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, ease: 'power3.in' }, 0)
          .add(() => onLift?.(), 0.3)
          .to(q('[data-sheet-b]'), { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.2)
          .to(q('[data-sheet-a]'), { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.3)
          .set(q('[data-curtain-rule]'), { transformOrigin: '0% 50%' })
      }),
  }))

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[300] overflow-hidden"
      // on first load the curtain is already down, covering the page while it loads
      style={{ visibility: introOn ? 'visible' : 'hidden', pointerEvents: introOn ? 'auto' : 'none' }}
    >
      <div data-sheet-a className="absolute inset-0 bg-[image:var(--grad)] will-change-transform" />
      <div data-sheet-b className="absolute inset-0 grid place-items-center bg-background will-change-transform">
        <div className="flex flex-col items-center gap-5">
          <div className="overflow-hidden pb-[0.12em]">
            <span data-curtain-label className="block font-display text-[clamp(44px,9vw,128px)] font-semibold leading-none tracking-[-0.05em]">
              {labels[initial]}
            </span>
          </div>
          <span className="block h-[2px] w-[min(240px,50vw)] overflow-hidden rounded-full bg-border">
            <span data-curtain-rule className="block h-full w-full origin-left bg-[image:var(--grad)]" />
          </span>
        </div>
      </div>
    </div>
  )
})
