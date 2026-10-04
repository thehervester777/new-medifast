import { useRef } from 'react'
import clsx from 'clsx'
import { gsap, MQ, revealWords, useGSAP } from '../lib/gsap'

/** Section heading: label slides in, heading rises word by word, intro fades up */
export function Head({ label, heading, intro, center, className }: { label: string; heading: string; intro?: string; center?: boolean; className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current!
        const q = gsap.utils.selector(el)
        const st = { trigger: el, start: 'top 92%', once: true }
        gsap.from(q('.label'), { x: -24, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: st })
        revealWords(q('h2')[0], { delay: 0.08 })
        if (intro) gsap.from(q('p'), { y: 24, opacity: 0, duration: 1, delay: 0.3, scrollTrigger: st })
      })
    },
    { scope: root },
  )
  return (
    <div ref={root} className={clsx('flex max-w-[720px] flex-col gap-4', center && 'mx-auto items-center text-center', className)}>
      <span className="label">{label}</span>
      <h2 className="h2">{heading}</h2>
      {intro && <p className="text-muted-foreground">{intro}</p>}
    </div>
  )
}
