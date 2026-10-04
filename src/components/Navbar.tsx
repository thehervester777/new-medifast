import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { links, nav } from '../content'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useMagnetic } from '../lib/hooks'
import { onPageShown } from '../lib/router'
import { Wordmark } from './Brand'

// open width (aligned with the page content) and the compact island it settles into
const openWidth = () => Math.min(1216, window.innerWidth - (window.innerWidth >= 768 ? 64 : 40))
const islandWidth = () => Math.min(400, window.innerWidth - 24)
// how far the logo and the button travel inward to sit inside the island
const inset = () => (openWidth() - islandWidth()) / 2

/**
 * Minimal top bar. At the top of the page it is just the logo and the primary action, sitting on the hero.
 * As you scroll they glide inward (transforms) while a glass island narrows around them; a hairline inside
 * it shows reading progress. Only the empty glass shape changes size, so the work per frame is tiny.
 * Section links live in the dock at the bottom of the screen.
 */
export function Navbar() {
  const root = useRef<HTMLElement>(null)
  const cta = useRef<HTMLAnchorElement>(null)
  useMagnetic(cta, 0.18)

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)

      // reading progress, red → blue, inside the island
      gsap.fromTo(q('[data-progress]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } })

      const mm = gsap.matchMedia()
      mm.add({ motion: MQ.motion, reduce: MQ.reduce }, (ctx) => {
        const { motion } = ctx.conditions as { motion: boolean }

        if (motion) {
          // the morph is tied to the first 160px of scroll, so it moves exactly with your hand
          gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { start: 0, end: 160, scrub: true, invalidateOnRefresh: true },
          })
            .fromTo(q('[data-island]'), { y: 0 }, { y: 6 }, 0)
            .fromTo(q('[data-left]'), { x: 0 }, { x: () => inset() + 18 }, 0)
            .fromTo(q('[data-right]'), { x: 0 }, { x: () => -(inset() + 7) }, 0)
            .fromTo(q('[data-logo]'), { scale: 1 }, { scale: 0.86, transformOrigin: '0% 50%' }, 0)
            // the glass narrows in step with them, so it always wraps the logo and the button
            .fromTo(q('[data-shell]'), { width: openWidth }, { width: islandWidth }, 0)
            .fromTo(q('[data-shell]'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)

          // enter once the page is shown (after the intro or a page curtain): logo and button drop in, softly
          gsap.set(q('[data-in]'), { autoAlpha: 0, y: -18 })
          return onPageShown(() =>
            gsap.to(q('[data-in]'), { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.3 }),
          )
        }

        // reduced motion: snap between the two states, no movement
        ScrollTrigger.create({
          start: 60,
          end: 'max',
          invalidateOnRefresh: true,
          onToggle: (self) => {
            const on = self.isActive
            gsap.set(q('[data-island]'), { y: on ? 6 : 0 })
            gsap.set(q('[data-left]'), { x: on ? inset() + 18 : 0 })
            gsap.set(q('[data-right]'), { x: on ? -(inset() + 7) : 0 })
            gsap.set(q('[data-logo]'), { scale: on ? 0.86 : 1, transformOrigin: '0% 50%' })
            gsap.set(q('[data-shell]'), { opacity: on ? 1 : 0, width: on ? islandWidth() : openWidth() })
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <header ref={root} className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-[10px]">
      <div data-island className="relative flex h-[56px] w-[min(1216px,calc(100vw-40px))] items-center justify-between md:w-[min(1216px,calc(100vw-64px))]">
        {/* the island: glass and progress hairline (an empty shape, cheap to resize) */}
        <div data-shell aria-hidden className="absolute left-1/2 top-0 h-full w-[min(400px,calc(100vw-24px))] -translate-x-1/2 opacity-0">
          <span className="absolute inset-0 rounded-full border border-border bg-[hsl(236_44%_9%/.97)] shadow-[0_14px_36px_-18px_rgb(0_0_0/.9),inset_0_1px_0_hsl(0_0%_100%/.05)]" />
          <span className="absolute inset-x-6 bottom-0 h-px overflow-hidden rounded-full">
            <span data-progress className="block h-full w-full origin-left bg-[image:var(--grad)]" style={{ transform: 'scaleX(0)' }} />
          </span>
        </div>

        <div data-left className="pointer-events-auto relative">
          <a href="#top" aria-label="MediFast home" data-in className="block rounded-full transition-opacity duration-300 hover:opacity-85">
            <span data-logo className="block">
              <Wordmark className="h-[28px]" />
            </span>
          </a>
        </div>

        <div data-right className="pointer-events-auto relative">
          <span data-in className="block">
            <a
              ref={cta}
              href={links.live}
              target="_blank"
              rel="noopener"
              className="btn-red group/cta !min-h-[42px] !gap-1.5 !px-[18px] !text-[14px]"
            >
              {nav.cta}
              <span className="relative grid size-4 place-items-center overflow-hidden" aria-hidden>
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-calm group-hover/cta:-translate-y-4 group-hover/cta:translate-x-4" strokeWidth={2.2} />
                <ArrowUpRight className="absolute size-4 -translate-x-4 translate-y-4 transition-transform duration-500 ease-calm group-hover/cta:translate-x-0 group-hover/cta:translate-y-0" strokeWidth={2.2} />
              </span>
            </a>
          </span>
        </div>
      </div>
    </header>
  )
}
