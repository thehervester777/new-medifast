# MediFast — landing page

React + Vite + TypeScript + Tailwind CSS + GSAP (ScrollTrigger, SplitText) + Lenis smooth scrolling + lucide-react.

```bash
npm install
npm run dev            # local dev server
npm run build          # production build in dist/
npm run build:single   # everything inlined into one dist/index.html
```

- All page copy and links live in `src/content.ts`.
- App screenshots and the logo are in `src/assets/`.
- Fonts: Sora (headlines) and Manrope (text), bundled in `src/assets/fonts/` so they render everywhere.
- Colour tokens (MediFast red + blue) and type scale are in `src/index.css`.
- GSAP setup is in `src/lib/gsap.ts`; smooth scrolling in `src/lib/smooth.ts`.
- Every animation respects the visitor's reduced-motion setting.
- Navigation is a macOS-style dock (`src/components/MagnificationDock.tsx`, no animation library: it eases on GSAP's ticker and stops when idle), wired to the sections in `src/components/SiteDock.tsx`. It magnifies with a mouse, stays a compact icon bar on touch screens, and lights up the section in view.

## Pages

- The landing page, and an **About me** page at `#/about-me` (`src/components/aboutme/AboutMePage.tsx`), opened from the "About me" button in the About section.
- The first load and every page switch use the same curtain (`src/components/PageCurtain.tsx`): on first load the page name rises in while the gradient rule under it fills with real loading progress, then the curtain lifts. The hash router is in `src/lib/router.ts` and `src/App.tsx`. Browser back and forward work.
- The About me form opens the visitor's mail app or WhatsApp with their message filled in. Where it sends is `aboutMe.contact` in `src/content.ts`.

## Performance notes

- Scroll animations use `scrub: true`, so they follow Lenis directly instead of easing behind it.
- Only `transform` and `opacity` animate while scrolling; the hero isn't pinned or scaled. The one exception is the empty glass shape in the top bar, which narrows.
- No CSS masks or blur filters sit over moving layers; soft edges are plain gradient overlays.
- Decorative loops (aurora, stars, phone floats, marquee) pause while off screen.
- Headings reveal line by line (not word by word), so only a few pieces move at once.
- While the page is smooth-scrolling, pointer events are off (`html.lenis-scrolling body`), so nothing under a still mouse restyles mid-scroll; pointer handlers also ignore the browser's stand-in moves during scroll.
- Lenis runs at the front of GSAP's ticker, so each frame scrolls on a clean layout before animations render.
- Phones use a tight shadow and no glow of their own (the light behind them comes from separate, static glows); 3D is only used where it's needed (the hero phone).
