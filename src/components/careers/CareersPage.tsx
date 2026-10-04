import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowUpRight, Briefcase, CalendarClock, Check, Copy, Link2, Mail, MapPin, MessageCircle, Plus, RotateCcw, Wallet,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { careers, footer } from '../../content'
import { jobs as allJobs, type Job } from '../../jobs'
import { gsap, MQ, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useMagnetic, useSpotlight } from '../../lib/hooks'
import { jobIdFromHash, onPageShown, readRoute, routeHref } from '../../lib/router'
import { scrollToHash } from '../../lib/smooth'
import { PageBar } from '../PageBar'

const wrap = 'mx-auto w-full max-w-[1280px] px-5 md:px-8'
/** the form's "role" value for an application that isn't for a listed job */
const GENERAL = 'general'

// job dates are 'YYYY-MM-DD', read as local calendar days
const day = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const fmtDate = (s: string, year = true) => day(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}) })

/** The roles to show: anything past its deadline drops off by itself (it stays open through that day). Newest first. */
function openRoles(now = new Date()) {
  return allJobs
    .filter((j) => !j.deadline || now.getTime() < day(j.deadline).getTime() + 86_400_000)
    .sort((a, b) => day(b.posted).getTime() - day(a.posted).getTime())
}

let refreshCall: gsap.core.Tween | null = null
/** a job opening or closing moves everything below it: re-measure the scroll triggers once it settles */
const queueRefresh = () => {
  refreshCall?.kill()
  refreshCall = gsap.delayedCall(0.1, () => ScrollTrigger.refresh())
}

/**
 * Careers: a page of its own, like About me. A big "Join us." with a live board of open roles, why
 * MediFast, the roles themselves (each one opens in place and has its own link, #/careers/<job id>),
 * then one short application that opens the visitor's mail app or WhatsApp with everything filled in.
 * The roles come from src/jobs.ts.
 */
export function CareersPage() {
  const root = useRef<HTMLDivElement>(null)
  const introPlayed = useRef(false)
  const jobs = useMemo(() => openRoles(), [])

  const linked = useRef(jobIdFromHash()).current
  // the job open in the list (mirrored in the address, so it can be shared as it is)
  const [openId, setOpenId] = useState<string | null>(() => (linked && jobs.some((j) => j.id === linked) ? linked : null))
  // a shared link to a role that has since closed
  const [missing, setMissing] = useState(() => !!linked && !jobs.some((j) => j.id === linked))
  // the role picked in the application form
  const [role, setRole] = useState<string>(() => (jobs.length ? (openId ?? '') : GENERAL))

  useEffect(() => {
    document.title = careers.title
    return () => { document.title = 'MediFast Medicine Wholesale' }
  }, [])

  // keep the address in step with the open job (replaceState: no history entry, no page switch)
  useEffect(() => {
    if (readRoute() !== 'careers') return
    const want = openId ? `#/careers/${openId}` : routeHref.careers
    if (window.location.hash !== want) history.replaceState(history.state, '', want)
  }, [openId])

  // links to a job from inside the page (the hiring board), and back / forward between jobs
  const openRef = useRef(openId)
  openRef.current = openId
  useEffect(() => {
    const onHash = () => {
      if (readRoute() !== 'careers') return
      const id = jobIdFromHash()
      if (!id || !jobs.some((j) => j.id === id)) return setOpenId(null)
      const wait = openRef.current && openRef.current !== id ? 0.65 : 0.05 // let another open job fold away first
      setMissing(false)
      setOpenId(id)
      gsap.delayedCall(wait, () => scrollToHash(`#job-${id}`))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [jobs])

  // arriving on a job's own link: once the page is showing, bring that job into view
  useEffect(() => {
    if (!openId) return
    return onPageShown(() => gsap.delayedCall(0.2, () => scrollToHash(`#job-${openId}`)))
    // only on arrival, so no dependencies
  }, [])

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)

      // pause the glow drift while the hero is off screen
      const hero = q('[data-cr-hero]')[0] as HTMLElement
      ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => hero.classList.toggle('is-offscreen', !s.isActive) })

      // reading progress in the top bar
      gsap.fromTo(q('[data-progress]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } })

      const mm = gsap.matchMedia()
      mm.add({ motion: MQ.motion, desktop: '(min-width: 768px)' }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        if (!motion) return

        // ---- entrance, once the page is on screen ----
        const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
        intro
          .fromTo(q('[data-bar-in]'), { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, 0)
          .from(q('[data-glow]'), { autoAlpha: 0, duration: 2, ease: 'power2.out' }, 0)
          .from(q('[data-kicker]'), { x: -30, autoAlpha: 0, duration: 1 }, 0.2)
          .from(q('[data-w]'), { yPercent: 115, rotate: 7, duration: 1.5, stagger: 0.12 }, 0.25)
          .from(q('[data-line-word]'), { yPercent: 110, duration: 1.1, stagger: 0.03 }, 0.75)
          .from(q('[data-cue]'), { y: 24, autoAlpha: 0, duration: 1 }, 1.1)
          .from(q('[data-board]'), { x: 70, autoAlpha: 0, duration: 1.5 }, 0.45)
          .from(q('[data-board-row]'), { x: 36, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.75)
        const offShown = onPageShown(() => {
          if (introPlayed.current) intro.progress(1)
          else { introPlayed.current = true; intro.play() }
        })

        // ---- hero depth: the headline lifts away faster than the board ----
        gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
          .to(q('[data-hero-copy]'), { yPercent: desktop ? -22 : -12, autoAlpha: 0.15 }, 0)
          .to(q('[data-board-wrap]'), { yPercent: -12 }, 0)

        // ---- why MediFast: cards fold up into place ----
        gsap.from(q('[data-why-label]'), { x: -24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: q('[data-why-label]')[0], start: 'top 90%', once: true } })
        ScrollTrigger.batch(q('[data-why]'), {
          start: 'top 92%',
          once: true,
          onEnter: (b) => gsap.from(b, { y: 80, rotationX: -26, autoAlpha: 0, transformPerspective: 1100, transformOrigin: '50% 100%', duration: 1.4, stagger: 0.1, ease: 'expo.out', clearProps: 'transform' }),
        })

        // ---- open roles ----
        const roles = q('[data-roles]')[0]
        gsap.from(q('[data-roles-label]'), { x: -24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: roles, start: 'top 85%', once: true } })
        gsap.from(q('[data-roles-word]'), { yPercent: 115, rotate: 5, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: roles, start: 'top 85%', once: true } })
        gsap.from(q('[data-roles-filter]'), { y: 20, autoAlpha: 0, duration: 1, delay: 0.3, scrollTrigger: { trigger: roles, start: 'top 85%', once: true } })
        ScrollTrigger.batch(q('[data-job]'), {
          start: 'top 95%',
          once: true,
          onEnter: (b) => gsap.from(b, { y: 50, autoAlpha: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }),
        })

        // ---- the application ----
        const apply = q('[data-apply]')[0]
        gsap.from(q('[data-apply-label]'), { x: -24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: apply, start: 'top 80%', once: true } })
        gsap.from(q('[data-apply-word]'), { yPercent: 115, rotate: 5, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: apply, start: 'top 80%', once: true } })
        gsap.from(q('[data-apply-intro]'), { y: 24, autoAlpha: 0, duration: 1, delay: 0.3, scrollTrigger: { trigger: apply, start: 'top 80%', once: true } })
        gsap.from(q('[data-form-card]'), { y: 80, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: q('[data-form-card]')[0], start: 'top 92%', once: true } })
        gsap.from(q('[data-form-row]'), { y: 26, autoAlpha: 0, duration: 1, stagger: 0.07, ease: 'expo.out', delay: 0.2, scrollTrigger: { trigger: q('[data-form-card]')[0], start: 'top 88%', once: true } })

        // ---- closing line ----
        gsap.from(q('[data-closing-word]'), { yPercent: 110, duration: 1.2, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: q('[data-closing]')[0], start: 'top 90%', once: true } })

        return offShown
      })
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <PageBar back={careers.back} />
      <main>
        <Hero jobs={jobs} />
        <Why />
        <Roles
          jobs={jobs}
          openId={openId}
          missing={missing}
          onToggle={(id) => { setMissing(false); setOpenId((cur) => (cur === id ? null : id)) }}
          onApply={setRole}
        />
        <Apply jobs={jobs} role={role} setRole={setRole} />
      </main>
      <Closing onGeneral={() => setRole(GENERAL)} />
    </div>
  )
}

/* ---------- hero: "Join us." and a live board of open roles ---------- */
function Hero({ jobs }: { jobs: Job[] }) {
  const c = careers
  const cue = useRef<HTMLAnchorElement>(null)
  useMagnetic(cue, 0.18)
  return (
    <section data-cr-hero aria-labelledby="cr-title" className="relative flex min-h-svh overflow-hidden">
      <div data-glow aria-hidden className="pointer-events-none absolute inset-0">
        <span className="blob red -left-24 top-[10%] h-80 w-80 md:h-[600px] md:w-[600px]" />
        <span className="blob blue -bottom-24 right-[8%] h-80 w-80 md:h-[600px] md:w-[600px]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(transparent,var(--background))]" />

      <div className={clsx(wrap, 'relative z-10 flex min-h-svh flex-col justify-end pb-16 pt-28 md:pb-20')}>
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div data-hero-copy className="will-change-transform">
            <p data-kicker className="label">{c.kicker}</p>
            <h1
              id="cr-title"
              className="mt-5 font-display text-[clamp(92px,23vw,260px)] font-bold leading-[0.82] tracking-[-0.075em] lg:text-[min(220px,calc((100vw-470px)/3.7))]"
              aria-label={`${c.big.join(' ')} ${c.line}`}
            >
              <span aria-hidden className="line-mask -ml-[0.04em] !pb-[0.2em] !-mb-[0.2em]">
                <span data-w className="inline-block">{c.big[0]}</span>{' '}
                <span data-w className="grad-text inline-block pr-[0.05em]">{c.big[1]}</span>
              </span>
            </h1>
            <p aria-hidden className="mt-6 max-w-[17em] font-display text-[clamp(26px,3.4vw,48px)] font-semibold leading-[1.1] tracking-[-0.04em] md:mt-8">
              {c.line.split(' ').map((w, i) => (
                <span key={i} className="sw-mask inline-block overflow-clip align-top">
                  <span data-line-word className="inline-block">{w}&nbsp;</span>
                </span>
              ))}
            </p>
            <a ref={cue} data-cue href="#roles" className="btn-red group/cue mt-10 !gap-3 md:mt-12">
              {c.cue}
              {jobs.length > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-[13px] font-bold tabular-nums">{jobs.length}</span>
              )}
              <span className="relative grid size-5 place-items-center overflow-hidden" aria-hidden>
                <ArrowDown className="size-5 transition-transform duration-500 ease-calm group-hover/cue:translate-y-5" strokeWidth={2.2} />
                <ArrowDown className="absolute size-5 -translate-y-5 transition-transform duration-500 ease-calm group-hover/cue:translate-y-0" strokeWidth={2.2} />
              </span>
            </a>
          </div>

          {jobs.length > 0 && (
            <div data-board-wrap className="hidden will-change-transform lg:block">
              <Board jobs={jobs} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Board({ jobs }: { jobs: Job[] }) {
  const shown = jobs.slice(0, 4)
  return (
    <div data-board className="rounded-[26px] border border-border bg-[hsl(236_44%_9%/.88)] p-4 shadow-[0_40px_100px_-50px_rgb(0_0_0/.95),inset_0_1px_0_hsl(0_0%_100%/.05)]">
      <div className="flex items-center justify-between px-2 pb-4 pt-1">
        <span className="inline-flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em]">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {careers.hiring}
        </span>
        <span className="font-display text-[13px] font-semibold tabular-nums text-muted-foreground">{String(jobs.length).padStart(2, '0')} open</span>
      </div>
      <ul className="flex flex-col gap-2">
        {shown.map((j) => (
          <li key={j.id} data-board-row>
            <a
              href={`#/careers/${j.id}`}
              className="group/br flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 transition-[border-color,background-color] duration-300 hover:border-border-hi hover:bg-[hsl(236_40%_12%)]"
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold leading-snug">{j.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{j.team} · {j.workplace}</span>
              </span>
              <ArrowUpRight className="size-4 flex-none text-muted-foreground transition-[translate,color] duration-500 ease-calm group-hover/br:-translate-y-0.5 group-hover/br:translate-x-0.5 group-hover/br:text-primary" strokeWidth={2.2} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      {jobs.length > shown.length && (
        <a href="#roles" className="mt-3 block px-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          +{jobs.length - shown.length} more
        </a>
      )}
    </div>
  )
}

/* ---------- why MediFast ---------- */
function Why() {
  const w = careers.why
  return (
    <section aria-label={w.label} className="relative py-24 md:py-36">
      <div className={wrap}>
        <p data-why-label className="label">{w.label}</p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4 lg:gap-5">
          {w.items.map((item, i) => <WhyCard key={item.title} n={i + 1} title={item.title} body={item.body} />)}
        </ul>
      </div>
    </section>
  )
}

function WhyCard({ n, title, body }: { n: number; title: string; body: string }) {
  const ref = useRef<HTMLLIElement>(null)
  useSpotlight(ref)
  return (
    <li
      ref={ref}
      data-why
      className="spot sheen flex min-h-[230px] flex-col rounded-[26px] border border-border bg-card p-6 transition-[border-color] duration-500 hover:border-border-hi sm:p-7 md:min-h-[280px]"
    >
      <span className="relative z-[2] grad-text w-fit pr-[0.04em] font-display text-[44px] font-bold leading-none tracking-[-0.05em] tabular-nums">
        {String(n).padStart(2, '0')}
      </span>
      <div className="relative z-[2] mt-auto pt-10">
        <h3 className="text-[21px] leading-snug tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 text-[15px] leading-[1.65] text-muted-foreground">{body}</p>
      </div>
    </li>
  )
}

/* ---------- the open roles: each opens in place ---------- */
function Roles({
  jobs, openId, missing, onToggle, onApply,
}: { jobs: Job[]; openId: string | null; missing: boolean; onToggle: (id: string) => void; onApply: (id: string) => void }) {
  const r = careers.roles
  const teams = useMemo(() => Array.from(new Set(jobs.map((j) => j.team))), [jobs])
  const [team, setTeam] = useState('')
  const count = (t: string) => jobs.filter((j) => !t || j.team === t).length

  return (
    <section id="roles" data-roles aria-labelledby="cr-roles" className="relative py-10 md:py-14">
      <div className={wrap}>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-roles-label className="label">{r.label}</p>
            <h2 id="cr-roles" className="mt-5 font-display text-[clamp(52px,7.4vw,112px)] font-bold leading-[0.92] tracking-[-0.06em]">
              <span className="line-mask">
                <span data-roles-word className="inline-block">{r.heading[0]}</span>{' '}
                <span data-roles-word className="grad-text inline-block pr-[0.05em]">{r.heading[1]}</span>
              </span>
            </h2>
          </div>
          {teams.length > 1 && (
            <div data-roles-filter role="group" aria-label="Filter roles by team" className="flex flex-wrap gap-2 md:justify-end md:pb-3">
              {['', ...teams].map((t) => (
                <button key={t || 'all'} type="button" className="chip" aria-pressed={team === t} onClick={() => setTeam(t)}>
                  {t || r.all}
                  <span className="text-[12px] font-bold tabular-nums opacity-60">{count(t)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {missing && (
          <p role="status" className="mt-8 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-4 text-[15px] leading-relaxed">
            {r.closed}
          </p>
        )}

        {jobs.length === 0 ? (
          <div className="mt-10 rounded-[26px] border border-border bg-card p-7 md:mt-14 md:p-10">
            <h3 className="text-[clamp(26px,3vw,40px)] leading-[1.1] tracking-[-0.035em]">{r.empty.heading}</h3>
            <p className="mt-3 max-w-[34em] text-muted-foreground">{r.empty.body}</p>
            <a href="#apply" className="btn-red mt-7">
              {careers.closingCta}
              <ArrowDown className="size-[18px]" strokeWidth={2.2} aria-hidden />
            </a>
          </div>
        ) : (
          <ul className="mt-10 flex flex-col gap-3 md:mt-14">
            {jobs.map((j) => (
              <JobRow
                key={j.id}
                job={j}
                open={openId === j.id}
                hidden={!!team && j.team !== team}
                onToggle={() => onToggle(j.id)}
                onApply={() => onApply(j.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Meta({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-medium leading-none text-muted-foreground">
      <Icon className="size-3.5 flex-none" strokeWidth={2} aria-hidden />
      {children}
    </span>
  )
}

function Points({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-[12px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</h4>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-[16px] leading-[1.6] text-foreground/90">
            <span aria-hidden className="mt-[0.6em] size-1.5 flex-none rounded-full bg-[image:var(--grad)]" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function JobRow({ job, open, hidden, onToggle, onApply }: { job: Job; open: boolean; hidden: boolean; onToggle: () => void; onApply: () => void }) {
  const r = careers.roles
  const card = useRef<HTMLLIElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const [copied, setCopied] = useState(false)
  useSpotlight(card)

  // fold open / closed (heights in GSAP, not React, so a re-render never fights the tween)
  useLayoutEffect(() => {
    const p = panel.current!
    const inner = p.firstElementChild as HTMLElement
    const instant = first.current || prefersReducedMotion()
    first.current = false
    gsap.to(p, { height: open ? 'auto' : 0, duration: instant ? 0 : 0.7, ease: 'power3.inOut', overwrite: true, onComplete: instant ? undefined : queueRefresh })
    gsap.to(inner, { autoAlpha: open ? 1 : 0, y: open ? 0 : -10, duration: instant ? 0 : 0.5, delay: open && !instant ? 0.15 : 0, overwrite: true })
  }, [open])

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/careers/${job.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      gsap.delayedCall(2.2, () => setCopied(false))
    } catch {
      setCopied(false)
    }
  }

  const apply = useRef<HTMLAnchorElement>(null)
  useMagnetic(apply, 0.16)

  return (
    <li
      ref={card}
      id={`job-${job.id}`}
      data-job
      hidden={hidden}
      className={clsx('spot rounded-[24px] border bg-card transition-[border-color] duration-500', open ? 'border-border-hi' : 'border-border hover:border-border-hi')}
    >
      <h3 className="font-sans font-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`job-${job.id}-panel`}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-5 px-5 py-6 text-left sm:px-7 md:px-8 md:py-7"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-bold uppercase tracking-[0.18em] text-primary">{job.team}</span>
            <span className="mt-2 block font-display text-[clamp(22px,2.4vw,32px)] font-semibold leading-[1.15] tracking-[-0.03em]">{job.title}</span>
            <span className="mt-4 flex flex-wrap gap-2">
              <Meta icon={Briefcase}>{job.type}</Meta>
              <Meta icon={MapPin}>{job.location} · {job.workplace}</Meta>
              {job.salary && <Meta icon={Wallet}>{job.salary}</Meta>}
              {job.deadline && <Meta icon={CalendarClock}>{r.deadline} {fmtDate(job.deadline, false)}</Meta>}
            </span>
          </span>
          <span
            className={clsx(
              'mt-1 grid size-10 flex-none place-items-center rounded-full transition-[rotate,background-color,color] duration-500 ease-calm',
              open ? 'rotate-45 bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
            )}
          >
            <Plus className="size-[18px]" strokeWidth={2.2} aria-hidden />
          </span>
        </button>
      </h3>

      <div ref={panel} id={`job-${job.id}-panel`} role="region" aria-label={job.title} className="overflow-hidden">
        <div className="px-5 pb-7 sm:px-7 md:px-8 md:pb-9">
          <div className="border-t border-border pt-7">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{r.about}</h4>
            <p className="mt-3 max-w-[46em] text-[17px] leading-[1.7] text-foreground/90">{job.summary}</p>
            <div className={clsx('mt-9 grid grid-cols-1 gap-9 md:gap-10', job.niceToHave?.length ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
              <Points title={r.do} items={job.responsibilities} />
              <Points title={r.need} items={job.requirements} />
              {job.niceToHave?.length ? <Points title={r.nice} items={job.niceToHave} /> : null}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a ref={apply} href="#apply" onClick={onApply} className="btn-red group/apply">
                {r.apply}
                <ArrowDown className="size-[18px] transition-transform duration-500 ease-calm group-hover/apply:translate-y-0.5" strokeWidth={2.2} aria-hidden />
              </a>
              <button type="button" className="btn-ghost" onClick={copyLink}>
                {copied ? <Check className="size-[18px] text-primary" strokeWidth={2.4} aria-hidden /> : <Link2 className="size-[18px]" strokeWidth={2} aria-hidden />}
                <span aria-live="polite">{copied ? r.copied : r.copy}</span>
              </button>
              <span className="text-[14px] text-muted-foreground sm:ml-auto">
                {r.posted} {fmtDate(job.posted)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/* ---------- the application ---------- */
type Sent = null | 'email' | 'whatsapp'
type Errors = { role?: string; name?: string; contact?: string; message?: string }

function Apply({ jobs, role, setRole }: { jobs: Job[]; role: string; setRole: (r: string) => void }) {
  const f = careers.form
  const card = useRef<HTMLDivElement>(null)
  useSpotlight(card)

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<Sent>(null)
  const [copied, setCopied] = useState(false)
  const done = useRef<HTMLDivElement>(null)

  // a role picked from a job's "Apply" button clears the "pick a role" error
  useEffect(() => {
    if (role) setErrors((e) => (e.role ? { ...e, role: undefined } : e))
  }, [role])

  const roleTitle = role === GENERAL ? f.general : (jobs.find((j) => j.id === role)?.title ?? '')
  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))

  const compose = () => {
    const subject = `Application: ${roleTitle}${name.trim() ? ` from ${name.trim()}` : ''}`
    const body = [
      `Role: ${roleTitle}`,
      `Name: ${name.trim()}`,
      `Contact: ${contact.trim()}`,
      link.trim() ? `CV / profile: ${link.trim()}` : '',
      '',
      message.trim(),
    ]
      .filter((l, i) => l !== '' || i === 4)
      .join('\n')
      .trim()
    return { subject, body }
  }

  const send = (via: 'email' | 'whatsapp') => {
    const next: Errors = {}
    if (!roleTitle) next.role = f.errors.role
    if (name.trim().length < 2) next.name = f.errors.name
    if (contact.trim().length < 5) next.contact = f.errors.contact
    if (message.trim().length < 8) next.message = f.errors.message
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const { subject, body } = compose()
    const url =
      via === 'email'
        ? `mailto:${careers.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        : `https://wa.me/${careers.contact.whatsapp}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setSent(via)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send('email')
  }

  const copy = async () => {
    const { subject, body } = compose()
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const reset = () => {
    setSent(null)
    setCopied(false)
    setName('')
    setContact('')
    setLink('')
    setMessage('')
    setErrors({})
  }

  // the "almost there" panel draws its tick and rises in
  useEffect(() => {
    if (!sent || !done.current) return
    const q = gsap.utils.selector(done.current)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.fromTo(q('[data-tick-ring]'), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.8)' }, 0)
      .fromTo(q('[data-tick-path]'), { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, 0.3)
      .from(q('[data-done-in]'), { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.07 }, 0.25)
    return () => { tl.kill() }
  }, [sent])

  const emailBtn = useRef<HTMLButtonElement>(null)
  const waBtn = useRef<HTMLButtonElement>(null)
  useMagnetic(emailBtn, 0.18)
  useMagnetic(waBtn, 0.18)

  const roleOptions = [...jobs.map((j) => ({ id: j.id, label: j.title })), { id: GENERAL, label: f.general }]

  return (
    <section id="apply" data-apply className="relative overflow-x-clip py-24 md:py-36">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 size-[min(1000px,150vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(357_85%_59%/.12),hsl(226_92%_63%/.1)_45%,transparent)]" />
      <div className={clsx(wrap, 'relative grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] md:gap-[clamp(40px,6vw,96px)]')}>
        <div className="md:sticky md:top-[120px]">
          <p data-apply-label className="label">{f.label}</p>
          <h2 className="mt-5 font-display text-[clamp(56px,8vw,128px)] font-bold leading-[0.9] tracking-[-0.065em]">
            <span className="line-mask"><span data-apply-word className="inline-block">{f.heading[0]}</span></span>
            <span className="line-mask"><span data-apply-word className="grad-text inline-block pr-[0.05em]">{f.heading[1]}</span></span>
          </h2>
          <p data-apply-intro className="mt-6 max-w-[26em] text-muted-foreground">{f.intro}</p>
        </div>

        <div ref={card} data-form-card className="spot relative rounded-[28px] border border-border bg-card p-5 shadow-[0_40px_100px_-50px_rgb(0_0_0/.9)] sm:p-7 md:p-9">
          {!sent ? (
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7">
              <fieldset data-form-row aria-describedby={errors.role ? 'cr-role-err' : undefined}>
                <legend className="mb-3.5 text-[15px] font-semibold">{f.roleLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((o) => (
                    <button key={o.id} type="button" className="chip" aria-pressed={role === o.id} onClick={() => setRole(role === o.id ? '' : o.id)}>
                      <span className="tick" aria-hidden><Check className="size-3.5" strokeWidth={3} /></span>
                      {o.label}
                    </button>
                  ))}
                </div>
                {errors.role && <span id="cr-role-err" className="field-error">{errors.role}</span>}
              </fieldset>

              <div data-form-row className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="field" data-invalid={errors.name ? '' : undefined}>
                  <input
                    id="cr-name"
                    name="name"
                    autoComplete="name"
                    placeholder=" "
                    value={name}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'cr-name-err' : undefined}
                    onChange={(e) => { setName(e.target.value); clear('name') }}
                  />
                  <label htmlFor="cr-name">{f.name}</label>
                  {errors.name && <span id="cr-name-err" className="field-error">{errors.name}</span>}
                </div>
                <div className="field" data-invalid={errors.contact ? '' : undefined}>
                  <input
                    id="cr-contact"
                    name="contact"
                    autoComplete="email"
                    placeholder=" "
                    value={contact}
                    aria-invalid={!!errors.contact}
                    aria-describedby={errors.contact ? 'cr-contact-err' : undefined}
                    onChange={(e) => { setContact(e.target.value); clear('contact') }}
                  />
                  <label htmlFor="cr-contact">{f.contact}</label>
                  {errors.contact && <span id="cr-contact-err" className="field-error">{errors.contact}</span>}
                </div>
              </div>

              <div data-form-row className="field">
                <input id="cr-link" name="link" type="url" inputMode="url" autoComplete="url" placeholder=" " value={link} onChange={(e) => setLink(e.target.value)} />
                <label htmlFor="cr-link">{f.link}</label>
              </div>

              <div data-form-row className="field" data-invalid={errors.message ? '' : undefined}>
                <textarea
                  id="cr-message"
                  name="message"
                  placeholder=" "
                  value={message}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'cr-message-err' : undefined}
                  onChange={(e) => { setMessage(e.target.value); clear('message') }}
                />
                <label htmlFor="cr-message">{f.message}</label>
                {errors.message && <span id="cr-message-err" className="field-error">{errors.message}</span>}
              </div>

              <div data-form-row className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button ref={emailBtn} type="submit" className="btn-red">
                  <Mail className="size-[18px]" strokeWidth={2} aria-hidden />
                  {f.email}
                </button>
                <button ref={waBtn} type="button" className="btn-ghost" onClick={() => send('whatsapp')}>
                  <MessageCircle className="size-[18px]" strokeWidth={2} aria-hidden />
                  {f.whatsapp}
                </button>
              </div>
            </form>
          ) : (
            <div ref={done} role="status" className="flex min-h-[420px] flex-col items-start justify-center gap-5">
              <span data-tick-ring className="grid size-16 place-items-center rounded-full bg-[image:var(--grad)] shadow-[0_18px_40px_-14px_hsl(357_85%_59%/.8)]">
                <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
                  <path data-tick-path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" />
                </svg>
              </span>
              <h3 data-done-in className="text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.04em]">{f.sent.heading}</h3>
              <p data-done-in className="max-w-[28em] text-muted-foreground">{sent === 'email' ? f.sent.email : f.sent.whatsapp}</p>
              <p data-done-in className="max-w-[30em] text-[15px] text-muted-foreground">
                {f.sent.fallback}{' '}
                <a href={`mailto:${careers.contact.email}`} className="font-semibold text-foreground underline decoration-primary/60 underline-offset-4 hover:decoration-primary">{careers.contact.email}</a>.
              </p>
              <div data-done-in className="mt-2 flex flex-wrap gap-3">
                <button type="button" className="btn-ghost !min-h-12" onClick={copy}>
                  {copied ? <Check className="size-[18px] text-primary" strokeWidth={2.4} aria-hidden /> : <Copy className="size-[18px]" strokeWidth={2} aria-hidden />}
                  {copied ? f.sent.copied : f.sent.copy}
                </button>
                <button type="button" className="btn-ghost !min-h-12" onClick={reset}>
                  <RotateCcw className="size-[18px]" strokeWidth={2} aria-hidden />
                  {f.sent.again}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- closing: one line, a general application, and the way back ---------- */
function Closing({ onGeneral }: { onGeneral: () => void }) {
  const back = useRef<HTMLAnchorElement>(null)
  useMagnetic(back, 0.2)
  const words = careers.closing.split(' ')
  return (
    <footer data-closing className="relative overflow-hidden border-t border-border pb-14 pt-20 md:pt-28">
      <div className={clsx(wrap, 'flex flex-col items-start gap-10')}>
        <p className="font-display text-[clamp(40px,7vw,104px)] font-bold leading-[0.95] tracking-[-0.06em]">
          {words.map((w, i) => (
            <span key={i} className="line-mask inline-block align-top !mb-0 !pb-[0.12em]">
              <span data-closing-word className={clsx('inline-block', i >= words.length - 2 && 'grad-text')}>{w}&nbsp;</span>
            </span>
          ))}
        </p>
        <div className="flex w-full flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#apply" onClick={onGeneral} className="btn-red">
              {careers.closingCta}
              <ArrowUpRight className="size-[18px]" strokeWidth={2.2} aria-hidden />
            </a>
            <a ref={back} href={routeHref.home} className="btn-ghost group/back">
              <ArrowLeft className="size-[18px] transition-transform duration-500 ease-calm group-hover/back:-translate-x-1" strokeWidth={2.2} aria-hidden />
              {careers.back}
            </a>
          </div>
          <p className="text-[14px] text-muted-foreground">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
