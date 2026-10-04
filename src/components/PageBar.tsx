import { useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useMagnetic } from '../lib/hooks'
import { routeHref } from '../lib/router'
import { Wordmark } from './Brand'

/** Top bar for the inner pages (About me, Careers): logo home, a way back, and a reading-progress
    hairline. The page animates [data-bar-in] on entry and scrubs [data-progress] with the scroll. */
export function PageBar({ back: label }: { back: string }) {
  const back = useRef<HTMLAnchorElement>(null)
  useMagnetic(back, 0.2)
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-[10px]">
      <div data-bar className="pointer-events-auto relative flex h-[56px] w-[min(1216px,calc(100vw-24px))] items-center justify-between rounded-full border border-border bg-[hsl(236_44%_9%/.92)] pl-5 pr-[7px] shadow-[0_14px_36px_-18px_rgb(0_0_0/.9),inset_0_1px_0_hsl(0_0%_100%/.05)] md:w-[min(1216px,calc(100vw-64px))]">
        <a data-bar-in href={routeHref.home} aria-label="MediFast home" className="group/logo rounded-full">
          <span className="block transition-opacity duration-300 group-hover/logo:opacity-85">
            <Wordmark className="h-[24px] sm:h-[26px]" />
          </span>
        </a>
        <span data-bar-in className="block">
        <a ref={back} href={routeHref.home} className="btn-ghost group/back !min-h-[42px] !gap-2 !px-4 !text-[14px]">
          <ArrowLeft className="size-4 transition-transform duration-500 ease-calm group-hover/back:-translate-x-1" strokeWidth={2.2} aria-hidden />
          {label}
        </a>
        </span>
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-0 h-px overflow-hidden rounded-full">
          <span data-progress className="block h-full w-full origin-left bg-[image:var(--grad)]" style={{ transform: 'scaleX(0)' }} />
        </span>
      </div>
    </header>
  )
}
