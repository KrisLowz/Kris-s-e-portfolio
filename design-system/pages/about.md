# Journey (Hero → About) — page override

> Overrides `design-system/MASTER.md`. Establishes the **dark space-journey** pattern. Component: `src/components/Journey.tsx` (the bright Hero and the About space scene are **fused into one pinned stage**). `src/components/About.tsx` is the older standalone version — now **unused/superseded** by Journey.

## Concept
The Hero and About share ONE pinned, scroll-scrubbed stage layered as: **Hero (bottom) + space/planet/copy overlay (top)**. You start on the hero; as you scroll (page held/pinned, NOT scrolling to a new section) the **origin planet pops up from the centre of the hero**, grows, and **deep space washes over the hero in place** (the hero zooms past + fades) — the About scene covers/fills the hero. The planet then zooms and "lands" and the copy reveals. Fully reversible (scrub) — scroll up and the planet shrinks back into the hero and the cat returns. This is the tonal pivot: dark space from here on.

## Mechanic (GSAP ScrollTrigger, CDN globals)
- One pinned `100svh` stage holding `.jr-hero` (the `<Hero/>` layer) + `.jr-overlay` (space/planet/copy, inline `opacity:0` until JS so it never flashes over the hero). **The overlay starts `pointer-events:none`** (and a ScrollTrigger `onUpdate` flips it to `auto` only past progress 0.42) — otherwise the invisible overlay sits on top of the hero and eats all clicks/hovers/text-selection. Critical for any future "scene-over-scene" layering.
- `ScrollTrigger { pin:true, scrub:1, pinSpacing:true, anticipatePin:1, invalidateOnRefresh:true, end:()=>'+=' + innerHeight*(mobile?1.6:2.2) }`.
- Timeline (ease `none`) — **background-first order**: space fades in over the hero (0.0) + `.jr-hero` `autoAlpha 0 + scale 1.12` zooms past & hides (0.04, so its buttons can't be clicked under About) → THEN planet pops `scale 0→0.5` from centre on the now-dark space (0.3) · grows to 1 (0.46) · **zoom/land** scale→`mobile?1.25:1.7` + drift desktop x:+0.2vw / mobile y:−0.17vh (0.7) · scrim (0.72) · **copy 3D cascade-reveal** (0.74): each `.about-line` stands up from `rotationX 50°` (hinged base, projected by `.about-copy { perspective:900px }`), staggered; the heading word (`.about-gradient`) has a flowing animated gradient + glow (gated to `.about-active`, off for reduced-motion).
- **Function-based** scale/x/y (+`invalidateOnRefresh`) so resize/rotate recalc. `ScrollTrigger.config({ ignoreMobileResize:true })`. `gsap.context().revert()` = StrictMode-safe.
- **Reduced motion:** no pin — renders `<Hero/>` then a static landed About `<section>` below (sequential, legible).

## Layout / legibility
- **Desktop:** planet drifts right, copy left (vertically centered), left-fade scrim.
- **Mobile:** planet drifts up (smaller), copy stacked in the lower third (`items-end`), bottom-fade scrim.
- Two `.about-scrim` layers (`hidden sm:block` / `sm:hidden`), both GSAP-faded.
- **Short viewports** (`@media max-height:740/560`): `.about-copy` h2/p scale down (clamp+vh) so the pinned, overflow-hidden stage never clips copy.

## Palette (dark-space variant of MASTER)
backdrop `#070512`→`#1A0B3B` (radial); text `#F5F3FF`; muted `#C3BFD6`; accents stay cyan `#22D3EE` (brighter on dark) + magenta `#FF2BD6`. Heading gradient `from-[#22D3EE] to-[#FF2BD6]`. Starfield = tiled radial-gradients (`.about-starfield`) + 2 nebula glows. Planet glow = radial behind the image.

## Assets / perf
- `origin-planet-cutout-opt.webp` (221 KB, from the 1.66 MB PNG via ffmpeg-static, `scale=1100 -c:v libwebp -quality 90`). `decoding="async"`, intrinsic 1100×1100.
- Reduced-motion: early-return, no pin/scrub; CSS defaults render the static legible "landed" view (`.about-planet` has a responsive CSS transform; space/scrim/copy default to opacity 1). Idle loops (`twinkle`, `planetBob`) are `animation:none`.
- Idle loops are **gated** to on-screen via `.about-active` (ScrollTrigger `onToggle`) — `animation-play-state: paused` otherwise.

## Cross-cutting fixes made here (apply project-wide)
- Removed `scroll-behavior:smooth` (`scroll-smooth`) from `<html>` — it fights ScrollTrigger pin/scrub. Use JS/GSAP `scrollTo` for nav anchors.
- `overflow-x-hidden` → **`overflow-x-clip`** on `<body>`/`<main>` (clip doesn't force `overflow-y:auto`, avoiding the pin-ancestor scroll-container gotcha).
- Section has `id="about"` + `aria-labelledby="about-heading"`.

## Known TODO
- Hero "View Work" → `#projects` has no target yet — wire it when the Projects section is built (next).
