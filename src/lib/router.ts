import { onIntroDone } from './intro'

/** Pages, addressed by the URL hash: the landing page, About me (#/about-me) and Careers (#/careers,
    or #/careers/<job id> to open one job). */
export type Route = 'home' | 'about-me' | 'careers'

export const routeHref: Record<Route, string> = { home: '#/', 'about-me': '#/about-me', careers: '#/careers' }

export function readRoute(): Route {
  const h = window.location.hash
  return h.startsWith('#/about-me') ? 'about-me' : h.startsWith('#/careers') ? 'careers' : 'home'
}

/** The job named in the address (#/careers/<job id>), if any. */
export function jobIdFromHash(): string | undefined {
  return /^#\/careers\/([a-z0-9-]+)/i.exec(window.location.hash)?.[1]
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
