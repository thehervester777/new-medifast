import { onIntroDone } from './intro'

/** Two pages, addressed by the URL hash: the landing page and the About me page (#/about-me). */
export type Route = 'home' | 'about-me'

export const routeHref: Record<Route, string> = { home: '#/', 'about-me': '#/about-me' }

export function readRoute(): Route {
  return window.location.hash.startsWith('#/about-me') ? 'about-me' : 'home'
}

// While the page curtain covers the screen, a freshly mounted page holds its entrance
// animation until the curtain starts to lift.
let covered = false
const waiting: Array<() => void> = []

export function setCovered(v: boolean) {
  covered = v
  if (!v) waiting.splice(0).forEach((cb) => cb())
}

/** Run `cb` once the page is actually visible: after the intro loader, and after any page curtain. */
export function onPageShown(cb: () => void) {
  let cancelled = false
  const run = () => !cancelled && cb()
  const offIntro = onIntroDone(() => {
    if (covered) waiting.push(run)
    else run()
  })
  return () => {
    cancelled = true
    offIntro()
    const i = waiting.indexOf(run)
    if (i >= 0) waiting.splice(i, 1)
  }
}
