import clsx from 'clsx'

/**
 * Red + blue aurora: two soft glows drifting in opposite directions.
 * The edges fade with plain gradient overlays rather than a CSS mask: a mask over moving layers
 * has to be recomposited every frame, an overlay costs nothing.
 */
export function Aurora({ placement = 'hero', className }: { placement?: 'hero' | 'cta'; className?: string }) {
  const hero = placement === 'hero'
  return (
    <div aria-hidden data-live className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div data-aurora className="absolute inset-0">
        <span className={clsx('blob red h-80 w-80 md:h-[560px] md:w-[560px]', hero ? '-top-40 left-1/4' : '-bottom-40 left-[18%]')} />
        <span className={clsx('blob blue h-80 w-80 md:h-[560px] md:w-[560px]', hero ? 'right-[5%] top-1/4' : '-bottom-32 right-[14%]')} />
      </div>
      {hero ? (
        <span className="absolute inset-x-0 bottom-0 h-[32%] bg-[linear-gradient(transparent,var(--background))]" />
      ) : (
        <>
          <span className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(var(--background),transparent)]" />
          <span className="absolute inset-x-0 bottom-0 h-[25%] bg-[linear-gradient(transparent,var(--background))]" />
        </>
      )}
    </div>
  )
}

/** ~40 tiny static stars (no animation: they cost nothing per frame) */
let seed = 7
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280)
const STARS = Array.from({ length: 40 }, (_, i) => {
  const size = rnd() < 0.7 ? 1 : 2
  const o = +(0.1 + rnd() * 0.2).toFixed(2)
  return { i, size, o, left: rnd() * 100, top: rnd() * 100, d: 3 + rnd() * 2, dl: rnd() * 4 }
})

export function StarField() {
  return (
    <div aria-hidden data-stars data-live className="pointer-events-none absolute inset-0">
      {STARS.map((s) => (
        <span
          key={s.i}
          className="star"
          style={{
            width: s.size, height: s.size, left: `${s.left}%`, top: `${s.top}%`, opacity: s.o,
            ['--o' as string]: s.o, ['--d' as string]: `${s.d.toFixed(2)}s`, ['--dl' as string]: `-${s.dl.toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  )
}
