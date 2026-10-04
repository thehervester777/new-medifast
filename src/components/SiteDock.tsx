import { useRef } from 'react'
import { CircleHelp, House, Layers, Route, ShoppingCart, Smartphone, UserRound, Users } from 'lucide-react'
import { links, nav } from '../content'
import { gsap, hasFinePointer, MQ, prefersReducedMotion, ScrollTrigger, useGSAP } from '../lib/gsap'
import { onPageShown } from '../lib/router'
import { MagnificationDock, type DockItemData } from './MagnificationDock'

const sectionIcons = [Route, Layers, Smartphone, Users, CircleHelp]
const ico = 'size-[19px] sm:size-[22px]'

/** The site's main navigation: a dock fixed to the bottom of the screen. */
export function SiteDock() {
  const root = useRef<HTMLDivElement>(null)

  const items: DockItemData[] = [
    { icon: <House className={ico} strokeWidth={1.8} />, label: nav.home.label, href: nav.home.href },
    ...nav.links.map((l, i) => {
      const Icon = sectionIcons[i]
      return { icon: <Icon className={ico} strokeWidth={1.8} />, label: l.label, href: l.href }
    }),
    { icon: <UserRound className={ico} strokeWidth={1.8} />, label: nav.about.label, href: nav.about.href },
    // the primary action joins the dock from small tablets up; on phones it stays in the top bar
    { icon: <ShoppingCart className={ico} strokeWidth={2} />, label: nav.cta, href: links.live, external: true, tone: 'accent', separatorBefore: true, className: 'max-sm:hidden' },
  ]

  useGSAP(
    () => {
      const el = root.current!
      const anchors = gsap.utils.toArray<HTMLAnchorElement>('[data-dock-item]', el)

      // light up the section in view (direct class changes, no re-render)
      const setActive = (href: string) =>
        anchors.forEach((a) => {
          const on = a.getAttribute('href') === href
          a.classList.toggle('is-active', on)
          if (on) a.setAttribute('aria-current', 'location')
          else a.removeAttribute('aria-current')
        })
      ;['#top', ...nav.links.map((l) => l.href), nav.about.href].forEach((href) => {
        const target = document.querySelector(href)
        if (target) ScrollTrigger.create({ trigger: target, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => s.isActive && setActive(href) })
      })
      setActive('#top')

      // slide up once the page is shown (after the intro or a page curtain)
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.set(el, { yPercent: 160, autoAlpha: 0 })
        return onPageShown(() =>
          gsap.timeline({ delay: 0.5 })
            .to(el, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' })
            .from(anchors, { scale: 0.6, opacity: 0, duration: 0.7, stagger: 0.04, ease: 'back.out(2)' }, 0.15),
        )
      })
    },
    { scope: root },
  )

  const magnify = typeof window !== 'undefined' && hasFinePointer() && !prefersReducedMotion() && window.matchMedia('(min-width: 640px)').matches

  return (
    <div ref={root} className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 md:bottom-5">
      <div className="pointer-events-auto max-w-full">
        <MagnificationDock items={items} magnify={magnify} magnification={78} distance={190} />
      </div>
    </div>
  )
}
