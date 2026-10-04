import type { ReactNode } from 'react'

// Soft red and blue light placed along the length of the sheet, so colour flows from section to section
// as you scroll. Each glow is its own small box (not one page-tall layer of overlapping gradients), so when
// anything on the page redraws, the browser only repaints the one or two glows actually behind it.
const glows = [
  { x: '0%', y: '6%', w: '56vmax', h: '56vmax', c: 'hsl(357 85% 55% / .11)' },
  { x: '100%', y: '22%', w: '60vmax', h: '60vmax', c: 'hsl(226 92% 58% / .11)' },
  { x: '0%', y: '44%', w: '56vmax', h: '56vmax', c: 'hsl(226 92% 58% / .09)' },
  { x: '100%', y: '63%', w: '60vmax', h: '60vmax', c: 'hsl(357 85% 55% / .09)' },
  { x: '50%', y: '90%', w: '64vmax', h: '50vmax', c: 'hsl(290 70% 55% / .08)' },
]

/**
 * The page "sheet": everything after the hero rides on it. Its rounded top slides up
 * over the hero (which drifts a little slower), and the ambient light keeps sections feeling connected.
 */
export function Sheet({ children }: { children: ReactNode }) {
  return (
    <div data-sheet className="relative z-10 pt-10 md:pt-14">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-t-[32px] bg-background shadow-[0_-24px_60px_-28px_rgb(0_0_0/.9)] md:rounded-t-[48px]"
      >
        <div className="absolute inset-0 overflow-clip">
          {glows.map((g) => (
            <span
              key={g.y}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: g.x,
                top: g.y,
                // the original gradients faded out at 70% of their radius: the box is exactly that big
                width: `calc(${g.w} * 1.4)`,
                height: `calc(${g.h} * 1.4)`,
                background: `radial-gradient(closest-side, ${g.c}, transparent)`,
              }}
            />
          ))}
        </div>
        <span className="absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(357_85%_59%/.7),hsl(226_92%_63%/.7),transparent)]" />
      </div>
      {children}
    </div>
  )
}
