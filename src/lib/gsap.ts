import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
gsap.defaults({ ease: 'power3.out', duration: 0.9 })
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, useGSAP }

/** matchMedia conditions shared by every section */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 1024px)',
  fine: '(hover: hover) and (pointer: fine)',
}

export const prefersReducedMotion = () => window.matchMedia(MQ.reduce).matches
export const hasFinePointer = () => window.matchMedia(MQ.fine).matches

/**
 * Headings rise into place line by line, each line out of its own mask. (Lines rather than words:
 * a handful of moving pieces per heading instead of one per word keeps scrolling light.)
 * Re-splits if the layout changes before it plays; reverts to plain text once it has landed.
 */
export function revealWords(el: Element, vars: gsap.TweenVars = {}, trigger?: ScrollTrigger.Vars | false) {
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'sl', // its masks get .sl-mask, which leaves room for descenders
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        rotate: 1.5,
        transformOrigin: '0% 100%',
        duration: 1.15,
        ease: 'expo.out',
        ...vars,
        stagger: 0.1,
        onComplete: () => self.revert(), // back to plain text once it has landed
        ...(trigger === false ? {} : { scrollTrigger: { trigger: el, start: 'top 92%', once: true, ...(trigger || {}) } }),
      }),
  })
}
