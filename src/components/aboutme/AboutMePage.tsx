import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowLeft, Braces, Check, Copy, Mail, MessageCircle, RotateCcw, ShieldCheck, Trophy } from 'lucide-react'
import clsx from 'clsx'
import { about, aboutMe } from '../../content'
import portrait from '../../assets/rishu-mondal.webp'
import { gsap, MQ, revealWords, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useMagnetic, useSpotlight } from '../../lib/hooks'
import { onPageShown, routeHref } from '../../lib/router'
import { Wordmark } from '../Brand'

const wrap = 'mx-auto w-full max-w-[1280px] px-5 md:px-8'

/**
 * About me: a manifesto page. A giant "F you." over a moody portrait, the credentials he won't be
 * showing struck through one by one as you scroll, then the only form you'll fill.
 * Everything moves with transforms and opacity, tied directly to the scroll.
 */
export function AboutMePage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'About me — Rishu Mondal · MediFast'
    return () => { document.title = 'MediFast Medicine Wholesale' }
  }, [])

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)

      // pause the glow drift while the hero is off screen
      const hero = q('[data-me-hero]')[0] as HTMLElement
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
          .from(q('[data-photo-inner]'), { scale: 1.18, autoAlpha: 0, duration: 2.2, ease: 'power3.out' }, 0)
          .from(q('[data-glow]'), { autoAlpha: 0, duration: 2, ease: 'power2.out' }, 0)
          .from(q('[data-kicker]'), { x: -30, autoAlpha: 0, duration: 1 }, 0.2)
          .from(q('[data-w]'), { yPercent: 115, rotate: 7, duration: 1.5, stagger: 0.12 }, 0.25)
          .from(q('[data-line-word]'), { yPercent: 110, duration: 1.1, stagger: 0.035 }, 0.75)
          .from(q('[data-cue]'), { y: 24, autoAlpha: 0, duration: 1 }, 1.15)
        const offShown = onPageShown(() => intro.play())

        // ---- hero depth: the headline lifts away faster than the portrait ----
        gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
          .to(q('[data-hero-copy]'), { yPercent: desktop ? -22 : -12, autoAlpha: 0.15 }, 0)
          .to(q('[data-photo]'), { yPercent: 16 }, 0)

        // ---- credentials, struck through one by one as they pass ----
        gsap.utils.toArray<HTMLElement>('[data-strike]', el).forEach((item) => {
          gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: item, start: 'top 80%', end: 'top 46%', scrub: true } })
            .fromTo(item.querySelector('[data-strike-line]'), { scaleX: 0 }, { scaleX: 1 }, 0)
            .fromTo(item.querySelector('[data-strike-text]'), { opacity: 1 }, { opacity: 0.28 }, 0.25)
        })
        gsap.from(q('[data-strike-label]'), { x: -24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: q('[data-strike-label]')[0], start: 'top 90%', once: true } })
        // ---- the receipts: cards fold up into place, the rank counts down to #7 ----
        const receipts = q('[data-receipts]')[0]
        gsap.from(q('[data-receipts-label]'), { x: -24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: receipts, start: 'top 85%', once: true } })
        gsap.from(q('[data-receipts-word]'), { yPercent: 115, rotate: 5, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: receipts, start: 'top 85%', once: true } })
        ScrollTrigger.batch(q('[data-receipt]'), {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => {
            gsap.from(batch, { y: 90, rotationX: -28, autoAlpha: 0, transformPerspective: 1100, transformOrigin: '50% 100%', duration: 1.4, stagger: 0.12, ease: 'expo.out', clearProps: 'transform' })
            batch.forEach((card, k) => {
              const big = card.querySelector<HTMLElement>('[data-receipt-big]')!
              gsap.from(big, { yPercent: 105, duration: 1.2, delay: 0.25 + k * 0.12, ease: 'expo.out' })
              const of = Number(big.dataset.rankOf)
              const place = Number(big.dataset.rankPlace)
              if (of && place) {
                const n = { v: of }
                big.textContent = `#${of.toLocaleString('en-US')}`
                gsap.to(n, {
                  v: place,
                  duration: 2.4,
                  delay: 0.35 + k * 0.12,
                  ease: 'expo.out',
                  onUpdate: () => { big.textContent = `#${Math.round(n.v).toLocaleString('en-US')}` },
                })
              }
            })
          },
        })

        revealWords(q('[data-resolve]')[0], { duration: 1.1, stagger: 0.04 }, { start: 'top 88%' })
        ScrollTrigger.batch(q('[data-build]'), {
          start: 'top 94%',
          once: true,
          onEnter: (b) => gsap.from(b, { y: 34, autoAlpha: 0, scale: 0.92, duration: 1, stagger: 0.06, ease: 'expo.out' }),
        })

        // ---- the form ----
        const form = q('[data-drop]')[0]
        gsap.from(q('[data-drop-label]'), { x: -24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: form, start: 'top 80%', once: true } })
        gsap.from(q('[data-drop-word]'), { yPercent: 115, rotate: 5, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: form, start: 'top 80%', once: true } })
        gsap.from(q('[data-drop-intro]'), { y: 24, autoAlpha: 0, duration: 1, delay: 0.3, scrollTrigger: { trigger: form, start: 'top 80%', once: true } })
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
      <TopBar />
      <main>
        <Hero />
        <Strikes />
        <Drop />
      </main>
      <Closing />
    </div>
  )
}

/* ---------- top bar: logo home, a way back, reading progress ---------- */
function TopBar() {
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
          {aboutMe.back}
        </a>
        </span>
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-0 h-px overflow-hidden rounded-full">
          <span data-progress className="block h-full w-full origin-left bg-[image:var(--grad)]" style={{ transform: 'scaleX(0)' }} />
        </span>
      </div>
    </header>
  )
}

/* ---------- hero: "F you." over the portrait ---------- */
function Hero() {
  const cue = useRef<HTMLAnchorElement>(null)
  useMagnetic(cue, 0.18)
  return (
    <section data-me-hero aria-labelledby="me-title" className="relative flex min-h-svh overflow-hidden">
      {/* portrait: full-bleed behind on phones, the right half on large screens */}
      <div data-photo aria-hidden className="absolute inset-y-0 right-0 w-full will-change-transform md:w-[56%]">
        <div data-photo-inner className="absolute inset-0">
          <img src={portrait} alt="" width={816} height={1020} decoding="async" className="size-full object-cover object-[50%_22%] opacity-50 md:opacity-90" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background),hsl(236_52%_6%/.35)_45%,transparent_75%)] max-md:bg-[linear-gradient(180deg,hsl(236_52%_6%/.55),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_45%,var(--background))]" />
      </div>

      {/* red and blue light, falling across the portrait too */}
      <div data-glow aria-hidden className="pointer-events-none absolute inset-0">
        <span className="blob red -left-24 top-[10%] h-80 w-80 md:h-[600px] md:w-[600px]" />
        <span className="blob blue -bottom-24 right-[8%] h-80 w-80 md:h-[600px] md:w-[600px]" />
      </div>

      <div className={clsx(wrap, 'relative z-10 flex min-h-svh flex-col justify-end pb-16 pt-28 md:pb-20')}>
        <div data-hero-copy className="will-change-transform">
          <p data-kicker className="label">{aboutMe.kicker}</p>
          <h1 id="me-title" className="mt-5 font-display text-[clamp(112px,27vw,400px)] font-bold leading-[0.82] tracking-[-0.075em]" aria-label={`${aboutMe.big.join(' ')} ${aboutMe.line}`}>
            <span aria-hidden className="line-mask -ml-[0.04em] !pb-[0.2em] !-mb-[0.2em]">
              <span data-w className="inline-block">{aboutMe.big[0]}</span>{' '}
              <span data-w className="grad-text inline-block pr-[0.05em]">{aboutMe.big[1]}</span>
            </span>
          </h1>
          <p aria-hidden className="mt-6 max-w-[15em] font-display text-[clamp(28px,4vw,58px)] font-semibold leading-[1.08] tracking-[-0.04em] md:mt-8">
            {aboutMe.line.split(' ').map((w, i) => (
              <span key={i} className="sw-mask inline-block overflow-clip align-top">
                <span data-line-word className="inline-block">{w}&nbsp;</span>
              </span>
            ))}
          </p>
          <a ref={cue} data-cue href="#drop" className="btn-red group/cue mt-10 !gap-3 md:mt-12">
            {aboutMe.cue}
            <span className="relative grid size-5 place-items-center overflow-hidden" aria-hidden>
              <ArrowDown className="size-5 transition-transform duration-500 ease-calm group-hover/cue:translate-y-5" strokeWidth={2.2} />
              <ArrowDown className="absolute size-5 -translate-y-5 transition-transform duration-500 ease-calm group-hover/cue:translate-y-0" strokeWidth={2.2} />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ---------- the credentials he won't be showing, struck through ---------- */
function Strikes() {
  return (
    <section aria-label={aboutMe.strikeLabel} className="relative overflow-x-clip py-24 md:py-40">
      <div className={wrap}>
        <p data-strike-label className="label">{aboutMe.strikeLabel}</p>
        <ul className="mt-8 flex flex-col gap-1 md:mt-12">
          {aboutMe.strikes.map((s) => (
            <li key={s} data-strike className="relative w-fit max-w-full">
              <s className="no-underline">
                <span data-strike-text className="block whitespace-nowrap font-display text-[min(116px,calc((100vw-40px)/7.4))] font-semibold leading-[1.06] tracking-[-0.055em] will-change-[opacity]">{s}</span>
              </s>
              <span data-strike-line aria-hidden className="absolute -inset-x-[2%] top-[54%] h-[0.09em] min-h-[4px] origin-left rounded-full bg-[image:var(--grad)] shadow-[0_0_24px_hsl(357_85%_59%/.5)] will-change-transform" />
            </li>
          ))}
        </ul>

        <Receipts />

        <p data-resolve className="mt-16 max-w-[20em] font-display text-[clamp(26px,3vw,44px)] font-semibold leading-[1.18] tracking-[-0.035em] md:mt-24">
          {aboutMe.resolve}
        </p>

        <div className="mt-10 md:mt-14">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{aboutMe.buildsLabel}</p>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {about.skills.map((s, i) => (
              <li key={s} data-build className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-[15px] font-medium">
                <span className="font-display text-[12px] font-bold tabular-nums text-primary">{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- the receipts: certifications and a ranking, since people ask anyway ---------- */
const receiptIcons = { shield: ShieldCheck, code: Braces, trophy: Trophy } as const
type ReceiptItem = (typeof aboutMe.receipts.items)[number]

function Receipt({ item }: { item: ReceiptItem }) {
  const ref = useRef<HTMLLIElement>(null)
  useSpotlight(ref)
  const Icon = receiptIcons[item.icon as keyof typeof receiptIcons]
  const rank = 'rank' in item ? item.rank : undefined
  return (
    <li
      ref={ref}
      data-receipt
      className="spot sheen group/rc flex min-h-[250px] flex-col rounded-[26px] border border-border bg-card p-6 transition-[border-color] duration-500 hover:border-border-hi sm:p-7 md:min-h-[320px] md:p-8"
    >
      <div className="relative z-[2] flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,hsl(357_85%_59%/.2),hsl(226_92%_63%/.2))] ring-1 ring-white/10 transition-transform duration-500 ease-calm group-hover/rc:-rotate-6 group-hover/rc:scale-110">
          <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-[image:var(--grad)]" aria-hidden />
          {item.tag}
        </span>
      </div>
      <div className="relative z-[2] mt-auto pt-10">
        <div className="overflow-clip pb-[0.08em]">
          <p
            data-receipt-big
            data-rank-of={rank?.of}
            data-rank-place={rank?.place}
            className={clsx('whitespace-nowrap font-display text-[clamp(52px,5.6vw,84px)] font-bold leading-[0.95] tracking-[-0.055em] tabular-nums', rank && 'grad-text w-fit pr-[0.04em]')}
          >
            {item.big}
          </p>
        </div>
        <p className="mt-4 text-[18px] font-semibold leading-snug">{item.title}</p>
        <p className="mt-1 text-[15px] text-muted-foreground">{item.meta}</p>
      </div>
    </li>
  )
}

function Receipts() {
  const r = aboutMe.receipts
  return (
    <div data-receipts className="mt-24 md:mt-36">
      <p data-receipts-label className="label">{r.label}</p>
      <h2 className="mt-5 font-display text-[clamp(52px,7.4vw,112px)] font-bold leading-[0.92] tracking-[-0.06em]">
        <span className="line-mask">
          <span data-receipts-word className="inline-block">{r.heading[0]}</span>{' '}
          <span data-receipts-word className="grad-text inline-block pr-[0.05em]">{r.heading[1]}</span>
        </span>
      </h2>
      <ul className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
        {r.items.map((item) => <Receipt key={item.title} item={item} />)}
      </ul>
    </div>
  )
}

/* ---------- the only form you'll fill ---------- */
type Sent = null | 'email' | 'whatsapp'

function Drop() {
  const f = aboutMe.form
  const card = useRef<HTMLDivElement>(null)
  useSpotlight(card)

  const [needs, setNeeds] = useState<string[]>([])
  const [timeline, setTimeline] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ message?: string; contact?: string }>({})
  const [sent, setSent] = useState<Sent>(null)
  const [copied, setCopied] = useState(false)
  const done = useRef<HTMLDivElement>(null)

  const toggleNeed = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]))

  const compose = () => {
    const subject = `New request${name.trim() ? ` from ${name.trim()}` : ''}${needs.length ? ` (${needs.join(', ')})` : ''}`
    const body = [
      needs.length ? `What I need: ${needs.join(', ')}` : '',
      timeline ? `When: ${timeline}` : '',
      '',
      message.trim(),
      '',
      `${name.trim() || 'Someone'}`,
      `Reach me at: ${contact.trim()}`,
    ]
      .filter((l, i, a) => !(l === '' && (i === 0 || a[i - 1] === '')))
      .join('\n')
      .trim()
    return { subject, body }
  }

  const send = (via: 'email' | 'whatsapp') => {
    const next: typeof errors = {}
    if (message.trim().length < 4) next.message = f.errors.message
    if (contact.trim().length < 5) next.contact = f.errors.contact
    setErrors(next)
    if (next.message || next.contact) return
    const { subject, body } = compose()
    const url =
      via === 'email'
        ? `mailto:${aboutMe.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        : `https://wa.me/${aboutMe.contact.whatsapp}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`
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
    setNeeds([])
    setTimeline('')
    setName('')
    setContact('')
    setMessage('')
    setErrors({})
  }

  // the "ready" panel draws its tick and rises in
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

  return (
    <section id="drop" data-drop className="relative overflow-x-clip py-24 md:py-36">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 size-[min(1000px,150vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(357_85%_59%/.12),hsl(226_92%_63%/.1)_45%,transparent)]" />
      <div className={clsx(wrap, 'relative grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] md:gap-[clamp(40px,6vw,96px)]')}>
        <div className="md:sticky md:top-[120px]">
          <p data-drop-label className="label">{f.label}</p>
          <h2 className="mt-5 font-display text-[clamp(56px,8vw,128px)] font-bold leading-[0.9] tracking-[-0.065em]">
            <span className="line-mask"><span data-drop-word className="inline-block">{f.heading[0]}</span></span>
            <span className="line-mask"><span data-drop-word className="grad-text inline-block pr-[0.05em]">{f.heading[1]}</span></span>
          </h2>
          <p data-drop-intro className="mt-6 max-w-[26em] text-muted-foreground">{f.intro}</p>
        </div>

        <div
          ref={card}
          data-form-card
          className="spot relative rounded-[28px] border border-border bg-card p-5 shadow-[0_40px_100px_-50px_rgb(0_0_0/.9)] sm:p-7 md:p-9"
        >
          {!sent ? (
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7">
              <fieldset data-form-row>
                <legend className="mb-3.5 text-[15px] font-semibold">{f.needsLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {f.needs.map((n) => (
                    <button key={n} type="button" className="chip" aria-pressed={needs.includes(n)} onClick={() => toggleNeed(n)}>
                      <span className="tick" aria-hidden><Check className="size-3.5" strokeWidth={3} /></span>
                      {n}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div data-form-row className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="field">
                  <input id="me-name" name="name" autoComplete="name" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} />
                  <label htmlFor="me-name">{f.name}</label>
                </div>
                <div className="field" data-invalid={errors.contact ? '' : undefined}>
                  <input
                    id="me-contact"
                    name="contact"
                    autoComplete="email"
                    placeholder=" "
                    value={contact}
                    aria-invalid={!!errors.contact}
                    aria-describedby={errors.contact ? 'me-contact-err' : undefined}
                    onChange={(e) => { setContact(e.target.value); if (errors.contact) setErrors((x) => ({ ...x, contact: undefined })) }}
                  />
                  <label htmlFor="me-contact">{f.contact}</label>
                  {errors.contact && <span id="me-contact-err" className="field-error">{errors.contact}</span>}
                </div>
              </div>

              <div data-form-row className="field" data-invalid={errors.message ? '' : undefined}>
                <textarea
                  id="me-message"
                  name="message"
                  placeholder=" "
                  value={message}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'me-message-err' : undefined}
                  onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((x) => ({ ...x, message: undefined })) }}
                />
                <label htmlFor="me-message">{f.message}</label>
                {errors.message && <span id="me-message-err" className="field-error">{errors.message}</span>}
              </div>

              <fieldset data-form-row>
                <legend className="mb-3.5 text-[15px] font-semibold">{f.timelineLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {f.timeline.map((t) => (
                    <button key={t} type="button" className="chip" aria-pressed={timeline === t} onClick={() => setTimeline((cur) => (cur === t ? '' : t))}>
                      <span className="tick" aria-hidden><Check className="size-3.5" strokeWidth={3} /></span>
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div data-form-row className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button ref={emailBtn} type="submit" className="btn-red group/send">
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
              <h3 data-done-in className="font-display text-[clamp(32px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.04em]">{f.sent.heading}</h3>
              <p data-done-in className="max-w-[28em] text-muted-foreground">{sent === 'email' ? f.sent.email : f.sent.whatsapp}</p>
              <p data-done-in className="max-w-[30em] text-[15px] text-muted-foreground">
                {f.sent.fallback}{' '}
                <a href={`mailto:${aboutMe.contact.email}`} className="font-semibold text-foreground underline decoration-primary/60 underline-offset-4 hover:decoration-primary">{aboutMe.contact.email}</a>.
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

/* ---------- closing: one line, and the way back ---------- */
function Closing() {
  const back = useRef<HTMLAnchorElement>(null)
  useMagnetic(back, 0.2)
  return (
    <footer data-closing className="relative overflow-hidden border-t border-border pb-14 pt-20 md:pt-28">
      <div className={clsx(wrap, 'flex flex-col items-start gap-10')}>
        <p className="font-display text-[clamp(40px,7vw,104px)] font-bold leading-[0.95] tracking-[-0.06em]">
          {aboutMe.closing.split(' ').map((w, i) => (
            <span key={i} className="line-mask inline-block align-top !mb-0 !pb-[0.12em]">
              <span data-closing-word className={clsx('inline-block', i >= aboutMe.closing.split(' ').length - 2 && 'grad-text')}>{w}&nbsp;</span>
            </span>
          ))}
        </p>
        <div className="flex w-full flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <a ref={back} href={routeHref.home} className="btn-red group/back">
            <ArrowLeft className="size-[18px] transition-transform duration-500 ease-calm group-hover/back:-translate-x-1" strokeWidth={2.2} aria-hidden />
            {aboutMe.back}
          </a>
          <p className="text-[14px] text-muted-foreground">© 2026 Rishu Mondal · MediFast</p>
        </div>
      </div>
    </footer>
  )
}
