import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Sheet } from './components/Ambient'
import { SiteDock } from './components/SiteDock'
import { PageCurtain, type CurtainHandle } from './components/PageCurtain'
import { AboutMePage } from './components/aboutme/AboutMePage'
import { Categories, HowItWorks, Platform } from './components/sections/Story'
import { TheApp } from './components/sections/AppSection'
import { About, Customers, Faq } from './components/sections/People'
import { FinalCta, Footer } from './components/sections/Closing'
import { gsap, prefersReducedMotion, ScrollTrigger } from './lib/gsap'
import { finishIntro } from './lib/intro'
import { readRoute, setCovered, type Route } from './lib/router'
import { jumpTo, pauseScroll, resumeScroll } from './lib/smooth'

/** Give the new page a moment behind the curtain: decode the images in view, then let two frames
    paint, so the first (heaviest) paint happens while it's covered rather than while the curtain lifts. */
async function settle() {
  const inView = Array.from(document.images).filter((i) => {
    const r = i.getBoundingClientRect()
    return r.bottom > 0 && r.top < window.innerHeight
  })
  await Promise.race([Promise.all(inView.map((i) => i.decode().catch(() => undefined))), new Promise((r) => setTimeout(r, 400))])
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60))))
}

/** The landing page */
function Landing() {
  useEffect(() => {
    // layout settles once fonts arrive; re-measure every trigger
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    // pause decorative CSS loops while they are off screen
    const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-live]')).map((el) =>
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => el.classList.toggle('is-offscreen', !s.isActive) }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Sheet>
          <Categories />
          <HowItWorks />
          <Platform />
          <TheApp />
          <Customers />
          <Faq />
          <About />
          <FinalCta />
        </Sheet>
      </main>
      <Footer />
      <SiteDock />
    </>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const current = useRef(route)
  const curtain = useRef<CurtainHandle>(null)

  // first load: the curtain is already down; the page name rises in, the rule under it fills with real
  // progress (fonts and images), then the curtain lifts exactly like a page switch
  useEffect(() => {
    const c = curtain.current!
    if (prefersReducedMotion()) {
      finishIntro()
      return
    }
    pauseScroll()
    c.intro()
    const shown = { v: 0 }
    let target = 0.08
    let released = false
    const jobs: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve(), ...Array.from(document.images).map((i) => i.decode().catch(() => undefined))]
    let done = 0
    jobs.forEach((j) => j.then(() => { done++; target = Math.max(target, done / jobs.length) }))

    const release = () => {
      if (released) return
      released = true
      gsap.ticker.remove(follow)
      c.progress(1)
      gsap.delayedCall(0.2, () => {
        c.reveal(() => { resumeScroll(); finishIntro() })
      })
    }
    // hold long enough for the name to rise in and be read, even when everything loads instantly
    const t0 = performance.now()
    const minMs = 1300
    const follow = () => {
      shown.v += (target - shown.v) * (1 - Math.pow(0.88, gsap.ticker.deltaRatio(60))) // frame-rate independent
      c.progress(shown.v)
      if (target >= 1 && shown.v > 0.97 && performance.now() - t0 > minMs) release()
    }
    gsap.ticker.add(follow)
    const force = gsap.delayedCall(2, () => { target = 1 }) // never wait longer than this
    const hard = gsap.delayedCall(3.6, release) // absolute failsafe
    return () => {
      gsap.ticker.remove(follow)
      force.kill()
      hard.kill()
    }
  }, [])

  // page switches: curtain up, swap the page behind it, land in the right place, curtain away
  useEffect(() => {
    let busy = false
    const go = async () => {
      const next = readRoute()
      if (busy || next === current.current) return
      busy = true
      const from = current.current
      pauseScroll()
      await curtain.current!.cover(next)
      setCovered(true)
      current.current = next
      flushSync(() => setRoute(next))
      ScrollTrigger.refresh()
      // the About me page opens at its top; coming back lands on the profile you left from
      jumpTo(next === 'home' && from === 'about-me' ? '#about' : 0)
      await settle()
      resumeScroll()
      await curtain.current!.reveal(() => setCovered(false))
      busy = false
      if (readRoute() !== current.current) go() // the address changed again mid-transition
    }
    window.addEventListener('hashchange', go)
    return () => window.removeEventListener('hashchange', go)
  }, [])

  return (
    <>
      {route === 'about-me' ? <AboutMePage /> : <Landing />}
      <PageCurtain ref={curtain} initial={route} />
    </>
  )
}
