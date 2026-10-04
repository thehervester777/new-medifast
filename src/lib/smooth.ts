import Lenis from 'lenis'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
const NAV = 76

/** Smooth wheel scrolling (desktop pointers only), driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (!prefersReducedMotion() && hasFinePointer()) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick, false, true) // before GSAP renders, so the scroll lands on a clean layout (no forced reflow)
    gsap.ticker.lagSmoothing(0) // keep scroll and animation clocks in lockstep
  }
  document.addEventListener('click', onAnchorClick)
  return () => {
    document.removeEventListener('click', onAnchorClick)
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

export function scrollToHash(hash: string) {
  const el = hash === '#top' ? 0 : (document.querySelector(hash) as HTMLElement | null)
  if (el === null) return
  // Lenis already honours the page's scroll-padding-top (the nav height). Sections that pin
  // (marked data-nav-flush) should land flush with the top instead, so the pinned view is complete.
  const flush = el !== 0 && !!el.querySelector('[data-nav-flush]')
  if (lenis) lenis.scrollTo(el, { offset: flush ? NAV : 0, duration: 1.6, easing: expoOut })
  else {
    const y = el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY - (flush ? 0 : NAV)
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

function onAnchorClick(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!a) return
  const hash = a.getAttribute('href')!
  if (hash.length < 2) return
  // "#/..." links switch pages: let the hash change and the app's router take it from there
  if (hash.startsWith('#/')) return
  e.preventDefault()
  scrollToHash(hash)
}

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4, easing: expoOut })
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Jump straight to a position or element (no animation), e.g. behind the page curtain. */
export function jumpTo(target: number | string) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : null
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(el ?? (typeof target === 'number' ? target : 0), { immediate: true, force: true })
  } else {
    const y = el ? el.getBoundingClientRect().top + window.scrollY - NAV : typeof target === 'number' ? target : 0
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
  }
}

export const pauseScroll = () => lenis?.stop()
export const resumeScroll = () => lenis?.start()
