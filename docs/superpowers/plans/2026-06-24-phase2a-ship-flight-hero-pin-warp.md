# Phase 2a — Ship Flight + Hero Pin + Warp Primitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first slice of the cinematic motion layer — a persistent spaceship that flies a scroll-synced path, a pinned Hero launch, and a reusable full-screen wormhole `WarpTransition` wired at the Hero→About boundary.

**Architecture:** Pure GSAP + ScrollTrigger over the existing Lenis-synced setup. One scrubbed master timeline drives the ship along a `SHIP_PATH` waypoint table; the Hero section pins on desktop and recedes its content on scrub; `WarpTransition` pins a spacer and scrubs a wormhole bloom. Everything is gated off under reduced-motion/mobile and torn down via `gsap.context`.

**Tech Stack:** React 19 + TS, GSAP 3.15 (+ScrollTrigger), Lenis (already synced), Vitest for the pure `SHIP_PATH` data.

## Global Constraints

- No React Three Fiber / Three.js / matter-js imports.
- Animate only `transform` / `opacity` / `filter` (use GSAP `x`/`y`/`scale`/`rotate`/`autoAlpha`/`filter`, never `left`/`top`/`width`/`height` as animated props).
- Every ScrollTrigger/timeline is created inside a `gsap.context(..., scopeEl)` and reverted in the effect cleanup (StrictMode-safe).
- Reuse the existing `gsap`/`ScrollTrigger` from `src/motion/register.ts` and the existing Lenis↔ScrollTrigger sync. Do NOT create a second Lenis, smooth-scroll, or `requestAnimationFrame` loop.
- Gate every cinematic system: no-op / static when `CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.<system>`. Content must stay readable in those modes (Phase-1 reveals already cover that).
- Reference assets only via `WORLD_ASSETS` (absolute `/assets/world/...`).
- `gsap` and `ScrollTrigger` are imported from `'../../motion/register'` (or the correct relative depth), never `window.gsap`.
- Commits end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Type check `npx tsc --noEmit`; tests `npx vitest run`; build `npx vite build`.

---

## File Structure

**Created:**
- `src/motion/shipPath.ts` — `ShipWaypoint` type + `SHIP_PATH` table.
- `src/motion/shipPath.test.ts` — pure data invariants.
- `src/motion/useShipFlight.ts` — the scroll-scrubbed flight hook.
- `src/components/story/ShipFlight.tsx` — the ship sprite + hook host (replaces the static ship).
- `src/components/story/WarpTransition.tsx` — reusable full-screen warp primitive.

**Modified:**
- `src/motion/config.ts` — add `shipFlight`/`heroPin`/`warp` toggles.
- `src/components/story/StoryWorldLayer.tsx` — render `<ShipFlight/>` instead of the inline static ship.
- `src/components/story/hero/HeroLaunch.tsx` — remove its own ship `<img>` (Task 2) and add the pinned launch timeline (Task 3).
- `src/App.tsx` — mount `<WarpTransition id="hero-about" />` between Hero and About.

---

## Task 1: SHIP_PATH waypoint table + config toggles

**Files:**
- Create: `src/motion/shipPath.ts`
- Create: `src/motion/shipPath.test.ts`
- Modify: `src/motion/config.ts` (add 3 toggles)

**Interfaces:**
- Consumes: `StoryActId` from `src/types.ts`; `STORY_ACTS` from `src/content/story.ts`.
- Produces: `ShipWaypoint` type and `SHIP_PATH: ShipWaypoint[]`; `CONFIG.toggles.shipFlight | heroPin | warp`.

- [ ] **Step 1: Write `src/motion/shipPath.ts`**

```ts
import { StoryActId } from '../types';

/** One waypoint on the ship's scroll-driven flight. x/y are VIEWPORT FRACTIONS
 *  (0 = left/top edge, 1 = right/bottom edge) of the ship's CENTER; rotate is
 *  degrees; scale is a multiplier; thruster is 0..1 glow intensity. The ship
 *  interpolates between consecutive waypoints as global scroll progresses. */
export interface ShipWaypoint {
  act: StoryActId;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  thruster: number;
}

/** Full flight path in scroll order: parked at the hero (lower-right, idling),
 *  crossing the cosmos to each act, then streaking off-screen at the end.
 *  First-pass values; tuned live so the ship never occludes text. */
export const SHIP_PATH: ShipWaypoint[] = [
  { act: 'hero',       x: 0.78, y: 0.74, rotate: -8,  scale: 1.0,  thruster: 0.3 },
  { act: 'about',      x: 0.30, y: 0.42, rotate: 6,   scale: 0.8,  thruster: 0.6 },
  { act: 'skills',     x: 0.64, y: 0.30, rotate: -4,  scale: 0.7,  thruster: 0.5 },
  { act: 'experience', x: 0.24, y: 0.60, rotate: 8,   scale: 0.75, thruster: 0.5 },
  { act: 'projects',   x: 0.70, y: 0.48, rotate: -6,  scale: 0.72, thruster: 0.6 },
  { act: 'contact',    x: 0.40, y: 0.34, rotate: 4,   scale: 0.78, thruster: 0.7 },
  { act: 'end',        x: 1.15, y: 0.10, rotate: -12, scale: 0.3,  thruster: 1.0 },
];
```

- [ ] **Step 2: Write the failing test `src/motion/shipPath.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { SHIP_PATH } from './shipPath';
import { STORY_ACTS } from '../content/story';

describe('SHIP_PATH', () => {
  it('has a waypoint for every non-boot story act, in story order', () => {
    const expected = STORY_ACTS.map((a) => a.id).filter((id) => id !== 'boot');
    expect(SHIP_PATH.map((w) => w.act)).toEqual(expected);
  });

  it('uses finite positions and rotations', () => {
    for (const w of SHIP_PATH) {
      expect(Number.isFinite(w.x)).toBe(true);
      expect(Number.isFinite(w.y)).toBe(true);
      expect(Number.isFinite(w.rotate)).toBe(true);
    }
  });

  it('has positive scale and thruster within 0..1', () => {
    for (const w of SHIP_PATH) {
      expect(w.scale).toBeGreaterThan(0);
      expect(w.thruster).toBeGreaterThanOrEqual(0);
      expect(w.thruster).toBeLessThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 3: Run the test — expect FAIL**

Run: `npx vitest run src/motion/shipPath.test.ts`
Expected: FAIL (`shipPath` module not found) until Step 1's file exists. If Step 1 is already saved, it PASSES — that's fine; the invariants are the point.

- [ ] **Step 4: Add the toggles to `src/motion/config.ts`**

In the `MotionConfig` interface, inside the `toggles: { ... }` block, add three lines after `navAutoHide: boolean;`:

```ts
    /** Phase 2 cinematic systems. */
    shipFlight: boolean;
    heroPin: boolean;
    warp: boolean;
```

Then in the exported `CONFIG` object's `toggles: { ... }` literal, add (alongside the existing keys):

```ts
    shipFlight: true,
    heroPin: true,
    warp: true,
```

- [ ] **Step 5: Run test + type-check — expect PASS / clean**

Run: `npx vitest run src/motion/shipPath.test.ts` → Expected: PASS (3 tests).
Run: `npx tsc --noEmit` → Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/motion/shipPath.ts src/motion/shipPath.test.ts src/motion/config.ts
git commit -m "feat(motion): SHIP_PATH waypoint table + cinematic toggles"
```

---

## Task 2: Ship flight — hook + sprite (replaces the static ship)

**Files:**
- Create: `src/motion/useShipFlight.ts`
- Create: `src/components/story/ShipFlight.tsx`
- Modify: `src/components/story/StoryWorldLayer.tsx`
- Modify: `src/components/story/hero/HeroLaunch.tsx` (remove its own ship `<img>`)

**Interfaces:**
- Consumes: `SHIP_PATH` (Task 1); `CONFIG` (`reducedMotion`/`isMobile`/`toggles.shipFlight`); `gsap`/`ScrollTrigger` from `register`; `WORLD_ASSETS.spaceship`.
- Produces: `useShipFlight(shipRef: RefObject<HTMLElement>): void`; `<ShipFlight/>` (default export). The persistent ship now lives in `StoryWorldLayer`, so the Hero must NOT render its own.

- [ ] **Step 1: Write `src/motion/useShipFlight.ts`**

```ts
import { useEffect, RefObject } from 'react';
import { gsap } from './register';
import { CONFIG } from './config';
import { SHIP_PATH } from './shipPath';

/** Drives a viewport-fixed ship element along SHIP_PATH, scrubbed by global
 *  page scroll. Uses transform (x/y/rotate/scale) with function-based values so
 *  the path is responsive (ScrollTrigger re-evaluates them on resize/refresh).
 *  No-op (ship keeps its CSS position) under reduced motion, mobile, or when
 *  the shipFlight toggle is off. */
export function useShipFlight(shipRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const ship = shipRef.current;
    if (!ship) return;
    if (CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.shipFlight) return;

    const ctx = gsap.context(() => {
      const first = SHIP_PATH[0];
      gsap.set(ship, {
        xPercent: -50,
        yPercent: -50,
        x: () => first.x * window.innerWidth,
        y: () => first.y * window.innerHeight,
        rotate: first.rotate,
        scale: first.scale,
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { start: 0, end: 'max', scrub: 0.6, invalidateOnRefresh: true },
      });

      for (let i = 1; i < SHIP_PATH.length; i++) {
        const w = SHIP_PATH[i];
        tl.to(ship, {
          x: () => w.x * window.innerWidth,
          y: () => w.y * window.innerHeight,
          rotate: w.rotate,
          scale: w.scale,
        });
      }
    });

    return () => ctx.revert();
  }, [shipRef]);
}
```

- [ ] **Step 2: Write `src/components/story/ShipFlight.tsx`**

```tsx
import { useRef } from 'react';
import { WORLD_ASSETS } from '../../story/worldAssets';
import { useShipFlight } from '../../motion/useShipFlight';
import { CONFIG } from '../../motion/config';

/** The persistent spaceship. On capable desktops it flies along SHIP_PATH,
 *  scrubbed by scroll; otherwise it parks at a static decorative spot so the
 *  world still reads as a continuous scene. */
export default function ShipFlight() {
  const ref = useRef<HTMLImageElement>(null);
  useShipFlight(ref);

  const flying = !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.shipFlight;

  return (
    <img
      ref={ref}
      src={WORLD_ASSETS.spaceship}
      alt=""
      aria-hidden
      className={
        flying
          ? 'pointer-events-none fixed left-0 top-0 w-40 opacity-80 will-change-transform md:w-56'
          : 'pointer-events-none fixed right-[8%] top-[14%] w-40 opacity-30'
      }
    />
  );
}
```

- [ ] **Step 3: Replace `src/components/story/StoryWorldLayer.tsx`**

```tsx
import ShipFlight from './ShipFlight';

/** Persistent decorative layer hosting the scroll-flying spaceship. Sits behind
 *  all content (z-[-20]); the ship itself is viewport-fixed. */
export default function StoryWorldLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-20]">
      <ShipFlight />
    </div>
  );
}
```

- [ ] **Step 4: Remove the Hero's own ship in `src/components/story/hero/HeroLaunch.tsx`**

Delete the spaceship `<img>` block (the element with `src={WORLD_ASSETS.spaceship} ... data-float ... className="pointer-events-none absolute bottom-[12%] right-[6%] ..."`). The persistent `ShipFlight` ship now covers the hero (its `hero` waypoint sits lower-right). If `WORLD_ASSETS` is then unused in this file, also remove its import; keep the `PROFILE` import.

- [ ] **Step 5: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean.
Run: `npx vite build` → success.
Run: `npx vitest run` → existing tests still pass (12 now: content 6, motion config 3, shipPath 3).
Manual (desktop, `npm run dev`): exactly ONE ship is visible; scrolling moves it across the viewport through the waypoints; it stays behind the section text. Emulate reduced-motion or a 390px mobile viewport: the ship is static (parked top-right, faint) and does not move on scroll.

- [ ] **Step 6: Commit**

```bash
git add src/motion/useShipFlight.ts src/components/story/ShipFlight.tsx src/components/story/StoryWorldLayer.tsx src/components/story/hero/HeroLaunch.tsx
git commit -m "feat(story): scroll-flying persistent spaceship (ShipFlight)"
```

---

## Task 3: Hero pinned launch timeline

**Files:**
- Modify: `src/components/story/hero/HeroLaunch.tsx`

**Interfaces:**
- Consumes: `gsap` from `register`; `CONFIG` (`reducedMotion`/`isMobile`/`toggles.heroPin`).
- Produces: pinned `#hero` behaviour on desktop (no new exports). The existing `data-anim` reveals stay as the intro + reduced-motion fallback.

- [ ] **Step 1: Add refs + the pin effect to `HeroLaunch.tsx`**

Update the imports and component so the section pins and its content recedes on scrub. Add a `sectionRef` on the `<section>` and a `contentRef` on the inner `<div className="relative z-10 max-w-3xl">`. Full updated file (ship `<img>` already removed in Task 2):

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from '../../../motion/register';
import { CONFIG } from '../../../motion/config';
import { PROFILE } from '../../../content';

export default function HeroLaunch() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.heroPin) return;
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=80%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        })
        .to(content, { scale: 0.9, autoAlpha: 0.15, ease: 'none' });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative grid min-h-screen items-center overflow-hidden px-6 pt-24 md:px-16"
    >
      <div ref={contentRef} className="relative z-10 max-w-3xl">
        <span data-anim="pop" className="font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
          Pilot profile · {PROFILE.title}
        </span>
        <h1 data-anim="chars" className="mt-3 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
          {PROFILE.name}
        </h1>
        <p data-anim="words" className="mt-4 font-display text-xl text-pop-text-main md:text-2xl">
          {PROFILE.headline}
        </p>
        <p data-anim="lines" className="mt-4 max-w-xl text-pop-text-muted">
          Computer Science graduate, Swinburne 2025 — focused on mobile applications, user-centric design, and enterprise systems.
        </p>
        <div data-stagger="0.08" className="mt-8 flex flex-wrap gap-3">
          <a data-anim="pop" href="#about" className="rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Launch Tour →</a>
          <a data-anim="pop" href={PROFILE.cv} className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">Download CV</a>
          <a data-anim="pop" href={PROFILE.social.github} target="_blank" rel="noreferrer" className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">GitHub</a>
          <a data-anim="pop" href={PROFILE.social.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">LinkedIn</a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success.
Manual (desktop): the hero stays pinned for ~80% of a viewport of scroll while its content scales down and fades; then it unpins and About scrolls up. Scrolling back up re-grows/re-shows the content (scrub is reversible). Reduced-motion / mobile: no pin — the hero scrolls normally with the static Phase-1 reveals.

- [ ] **Step 3: Commit**

```bash
git add src/components/story/hero/HeroLaunch.tsx
git commit -m "feat(hero): desktop pinned launch with scrubbed content recede"
```

---

## Task 4: WarpTransition primitive + Hero→About warp

**Files:**
- Create: `src/components/story/WarpTransition.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `gsap` from `register`; `CONFIG` (`reducedMotion`/`isMobile`/`toggles.warp`); `WORLD_ASSETS.wormhole`.
- Produces: `<WarpTransition id={string} />` (default export). Renders an in-flow spacer (the scroll trigger range) + a fixed full-screen wormhole overlay.

- [ ] **Step 1: Write `src/components/story/WarpTransition.tsx`**

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from '../../motion/register';
import { CONFIG } from '../../motion/config';
import { WORLD_ASSETS } from '../../story/worldAssets';

/** Full-screen wormhole warp at a section boundary. Desktop+motion: pins a
 *  spacer and scrubs a wormhole bloom (grow → peak → blow past). Reduced-motion
 *  / mobile: no pin — a short non-pinned crossfade over a small spacer, so the
 *  scroll never traps and content stays reachable. */
export default function WarpTransition({ id }: { id: string }) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<HTMLImageElement>(null);
  const full = !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.warp;

  useEffect(() => {
    const spacer = spacerRef.current;
    const warp = warpRef.current;
    if (!spacer || !warp) return;

    const ctx = gsap.context(() => {
      if (full) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: spacer,
              start: 'top bottom',
              end: 'bottom top',
              pin: spacer,
              scrub: 0.5,
              anticipatePin: 1,
            },
          })
          .fromTo(
            warp,
            { scale: 0.15, autoAlpha: 0, rotate: -8, filter: 'blur(8px)' },
            { scale: 1.4, autoAlpha: 1, rotate: 6, filter: 'blur(0px)', ease: 'none' }
          )
          .to(warp, { scale: 2.5, autoAlpha: 0, rotate: 12, filter: 'blur(12px)', ease: 'none' });
      } else {
        gsap
          .timeline({
            scrollTrigger: { trigger: spacer, start: 'top bottom', end: 'bottom top', scrub: true },
          })
          .fromTo(warp, { autoAlpha: 0 }, { autoAlpha: 0.4, ease: 'none' })
          .to(warp, { autoAlpha: 0, ease: 'none' });
      }
    });

    return () => ctx.revert();
  }, [full]);

  return (
    <>
      <div ref={spacerRef} data-warp={id} aria-hidden className={full ? 'h-[60vh] w-full' : 'h-[15vh] w-full'} />
      <img
        ref={warpRef}
        src={WORLD_ASSETS.wormhole}
        alt=""
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] m-auto h-[120vh] w-[120vh] max-w-none opacity-0 will-change-transform"
      />
    </>
  );
}
```

- [ ] **Step 2: Mount the Hero→About warp in `src/App.tsx`**

Add the import and place `<WarpTransition id="hero-about" />` between `<HeroLaunch />` and `<OriginDossier />`:

```tsx
import WarpTransition from './components/story/WarpTransition';
```
```tsx
      <HeroLaunch />
      <WarpTransition id="hero-about" />
      <OriginDossier />
```

- [ ] **Step 3: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success.
Manual (desktop): scrolling from the hero into About plays a full-screen wormhole that grows from center, peaks, then blows past as About arrives; scrolling back reverses it. Reduced-motion / mobile: the wormhole only briefly crossfades (no pin, no trapped scroll), and About is reachable normally.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/WarpTransition.tsx src/App.tsx
git commit -m "feat(story): reusable WarpTransition + Hero->About wormhole"
```

---

## Task 5: Integration + reduced-motion/mobile verification

**Files:** none (verification + any small gating fixes uncovered).

**Interfaces:** none.

- [ ] **Step 1: Full headless checks**

Run: `npx tsc --noEmit` → zero errors.
Run: `npx vitest run` → all pass (12 tests: content 6, motion config 3, shipPath 3).
Run: `npx vite build` → success.

- [ ] **Step 2: Desktop walkthrough (`npm run dev`)**

Confirm, scrolling top→bottom and back:
- Exactly one ship; it flies the full path (hero lower-right → across acts → streaks off at the end) and never sits on top of section text illegibly.
- The hero pins, its content recedes, then unpins.
- The Hero→About wormhole blooms and clears.
- Scrolling back up reverses the ship, the hero recede, and the warp (all scrubbed, reversible).
- Console has no app errors (the external Devicon CDN error is environmental, not ours).

- [ ] **Step 3: Reduced-motion + mobile emulation (chrome-devtools)**

- Emulate `prefers-reduced-motion: reduce`: no pin, no ship-flight, no warp pin; the ship is static, the hero scrolls normally, content fully readable; the warp at most briefly crossfades and never traps scroll.
- Emulate a 390px mobile viewport: same — pins and ship-flight disabled, no horizontal overflow, no awkward trapped scroll from the warp spacer, all content reachable.

- [ ] **Step 4: If any gating gap is found** (e.g. a pin firing on mobile, the ship moving under reduced motion), fix it at the source (the `CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.X` guard in the offending hook/component), re-run Steps 1–3, then commit:

```bash
git add -A
git commit -m "fix(motion): tighten Phase 2a reduced-motion/mobile gating"
```

(If no gap is found, there is nothing to commit for this task — the prior commits stand and Phase 2a is complete.)

---

## Self-Review (completed during planning)

**Spec coverage (Phase 2a slice of the Phase-2 spec):** ship-flight system → Tasks 1–2 (`SHIP_PATH`, `useShipFlight`, `ShipFlight`); Hero pin → Task 3; `WarpTransition` primitive + Hero→About warp → Task 4; reduced-motion/mobile gating + perf (transform-only, `gsap.context` cleanup, single ship timeline, reuse existing Lenis sync) → enforced in every task and verified in Task 5. Deferred to **2b** (correctly absent here): About/Experience/Contact scrubbed timelines, the Projects→Contact warp, thruster-glow visuals, and full crossfade polish.

**Placeholder scan:** none — every code step is complete; the one fallback simplification (warp crossfade vs. full bloom) is fully specified in both branches of `WarpTransition`.

**Type consistency:** `ShipWaypoint`/`SHIP_PATH` defined in Task 1 and consumed unchanged in Task 2; `CONFIG.toggles.shipFlight|heroPin|warp` added in Task 1 and read in Tasks 2/3/4; `useShipFlight(shipRef)` signature matches its caller in `ShipFlight`; `<WarpTransition id>` prop matches its `App.tsx` usage.

**Known integration risk (flagged for Task 5 + live tuning, per spec §8):** the global ship ScrollTrigger (`start:0,end:'max'`) coexists with two pinned triggers (hero, warp) that add scroll distance; `end:'max'` and `invalidateOnRefresh` adapt, but the ship's dwell/timing across the hero pin is first-pass and tuned live. No code blocker — a tuning surface.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks here with checkpoints.

Pick one to begin Task 1.
