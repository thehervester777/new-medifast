// The page intro (loader curtain) finishes once; the hero waits for it.
let done = false
const waiting: Array<() => void> = []

export function onIntroDone(cb: () => void) {
  if (done) cb()
  else waiting.push(cb)
  return () => {
    const i = waiting.indexOf(cb)
    if (i >= 0) waiting.splice(i, 1)
  }
}

export function finishIntro() {
  if (done) return
  done = true
  document.documentElement.classList.remove('is-loading')
  waiting.splice(0).forEach((cb) => cb())
}
