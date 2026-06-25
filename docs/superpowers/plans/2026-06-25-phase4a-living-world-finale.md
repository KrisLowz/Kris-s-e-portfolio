# Phase 4a — Living-World Finale (Mascot, Signal Beam, Ending) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the cat pilot to life — a mascot that rides the ship and reacts per act, a signal beam that fires when the contact form is sent, and a goodbye cameo at the ending.

**Architecture:** The mascot is two nested elements: an OUTER wrapper that travels along `SHIP_PATH` (scrubbed, offset from the ship) and an INNER img that plays a looping "mood" keyed to the active act's `mascotState` — so travel and mood never fight over the same transform. The active act is React state from a tested pure `nearestAct` over the section centres. The signal beam is a one-shot GSAP timeline on contact submit, which also dispatches a `story:signal-sent` event the mascot listens for (decoupled, like the boot event). No ScrollTrigger pins anywhere.

**Tech Stack:** React 19 + TS, GSAP 3.15 (+ScrollTrigger), Lenis (already synced), Vitest for `nearestAct`.

## Global Constraints

- No React Three Fiber / Three.js / matter-js imports.
- **No ScrollTrigger `pin`.** Animate only `transform`/`opacity`/`filter` (GSAP `x`/`y`/`xPercent`/`yPercent`/`rotation`/`scale`/`autoAlpha`); never `left`/`top`/`width`/`height` as animated props.
- Every ScrollTrigger/timeline/loop inside `gsap.context(..., scope?)` reverted on cleanup; reuse `gsap`/`ScrollTrigger` from `src/motion/register.ts`; no second Lenis or continuous `requestAnimationFrame` loop (a passive scroll listener coalesced with a single `requestAnimationFrame` per event is fine).
- Gate the mascot via `cinematicOn('mascot')` (new toggle); the signal beam via `cinematicOn('sectionFx')` (same gate as the contact SignalRings). When off (reduced-motion / mobile) render the static/plain equivalents; content stays readable; scroll never traps.
- Decorative mascot/beam imgs `alt="" aria-hidden`, `pointer-events-none`. Assets via `WORLD_ASSETS`.
- Commits end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Type check `npx tsc --noEmit`; tests `npx vitest run`; build `npx vite build`.

---

## File Structure

**Created:**
- `src/motion/useMascotFlight.ts` — rides the mascot along SHIP_PATH (offset).
- `src/motion/useActiveAct.ts` — active-act hook + the pure `nearestAct` helper.
- `src/motion/useActiveAct.test.ts` — `nearestAct` unit tests.
- `src/components/story/MascotPilot.tsx` — the mascot (travel + mood + PILOT line).
- `src/components/story/contact/SignalBeam.tsx` — one-shot contact-submit beam.

**Modified:**
- `src/motion/config.ts` — add the `mascot` toggle.
- `src/components/story/StoryWorldLayer.tsx` — mount `<MascotPilot/>`.
- `src/components/story/contact/RelayConsole.tsx` — dispatch `story:signal-sent` + render `<SignalBeam/>` on submit.
- `src/components/story/ending/VoyageCompleteFooter.tsx` — goodbye mascot cameo + star-trail.

---

## Task 1: `mascot` toggle + flight & active-act hooks (TDD for `nearestAct`)

**Files:**
- Modify: `src/motion/config.ts`
- Create: `src/motion/useMascotFlight.ts`, `src/motion/useActiveAct.ts`, `src/motion/useActiveAct.test.ts`

**Interfaces:**
- Consumes: `gsap` from `register`; `cinematicOn`/`CONFIG` from `config`; `SHIP_PATH` from `shipPath`; `SECTION_ACTS` from `content`; `StoryActId` from `types`.
- Produces: `CONFIG.toggles.mascot`; `useMascotFlight(ref)`; `useActiveAct(): StoryActId`; `nearestAct(centers, mid): StoryActId`.

- [ ] **Step 1: Add the `mascot` toggle to `src/motion/config.ts`**

In the `MotionConfig` interface `toggles` block, after `blackhole: boolean;`, add:
```ts
    mascot: boolean;
```
In the `CONFIG` object's `toggles` literal, after `blackhole: true,`, add:
```ts
    mascot: true,
```

- [ ] **Step 2: Create `src/motion/useActiveAct.ts`**

```ts
import { useEffect, useState } from 'react';
import { StoryActId } from '../types';
import { SECTION_ACTS } from '../content';
import { CONFIG } from './config';

/** Pick the act whose section centre is nearest the viewport midpoint. Pure. */
export function nearestAct(centers: { id: StoryActId; center: number }[], mid: number): StoryActId {
  let best = centers[0].id;
  let bestD = Infinity;
  for (const c of centers) {
    const d = Math.abs(c.center - mid);
    if (d < bestD) { bestD = d; best = c.id; }
  }
  return best;
}

/** The act currently nearest the viewport centre, as React state (updates only
 *  when it changes). No-op under reduced motion (the mascot is static there).
 *  Uses a passive scroll listener coalesced to one measure per frame. */
export function useActiveAct(): StoryActId {
  const [act, setAct] = useState<StoryActId>('hero');
  useEffect(() => {
    if (CONFIG.reducedMotion) return;
    let ticking = false;
    const compute = () => {
      const mid = window.innerHeight / 2;
      const centers = SECTION_ACTS
        .map((a) => {
          const el = document.getElementById(a.sectionId);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { id: a.id, center: r.top + r.height / 2 };
        })
        .filter((c): c is { id: StoryActId; center: number } => c !== null);
      if (!centers.length) return;
      const next = nearestAct(centers, mid);
      setAct((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { compute(); ticking = false; });
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return act;
}
```

- [ ] **Step 3: Write the failing test `src/motion/useActiveAct.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { nearestAct } from './useActiveAct';

describe('nearestAct', () => {
  it('returns the act whose center is nearest the midpoint', () => {
    const centers = [
      { id: 'hero' as const, center: 100 },
      { id: 'about' as const, center: 500 },
      { id: 'skills' as const, center: 900 },
    ];
    expect(nearestAct(centers, 120)).toBe('hero');
    expect(nearestAct(centers, 480)).toBe('about');
    expect(nearestAct(centers, 1000)).toBe('skills');
  });
  it('handles a single act', () => {
    expect(nearestAct([{ id: 'contact' as const, center: 42 }], 9999)).toBe('contact');
  });
  it('on a tie returns the first nearest', () => {
    const centers = [{ id: 'hero' as const, center: 0 }, { id: 'about' as const, center: 200 }];
    expect(nearestAct(centers, 100)).toBe('hero');
  });
});
```

- [ ] **Step 4: Run the test — expect PASS**

Run: `npx vitest run src/motion/useActiveAct.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/motion/useMascotFlight.ts`**

```ts
import { useEffect, RefObject } from 'react';
import { gsap } from './register';
import { cinematicOn } from './config';
import { SHIP_PATH } from './shipPath';

/** Viewport-fraction offset so the mascot rides just off the ship's flank. */
const OFFSET_X = 0.05;
const OFFSET_Y = 0.06;
/** Mascot scale relative to the ship's per-waypoint scale. */
const MASCOT_SCALE = 0.55;

/** Drives the mascot's OUTER wrapper along SHIP_PATH (offset from the ship),
 *  scrubbed by global scroll. Transform-only, function-based (responsive),
 *  inside a reverted gsap.context. No-op under reduced motion / mobile / when
 *  the mascot toggle is off (the wrapper keeps its static CSS position). */
export function useMascotFlight(ref: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!cinematicOn('mascot')) return;
    const ctx = gsap.context(() => {
      const first = SHIP_PATH[0];
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: () => (first.x + OFFSET_X) * window.innerWidth,
        y: () => (first.y + OFFSET_Y) * window.innerHeight,
        scale: first.scale * MASCOT_SCALE,
      });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { start: 0, end: 'max', scrub: 0.6, invalidateOnRefresh: true },
      });
      for (let i = 1; i < SHIP_PATH.length; i++) {
        const w = SHIP_PATH[i];
        tl.to(el, {
          x: () => (w.x + OFFSET_X) * window.innerWidth,
          y: () => (w.y + OFFSET_Y) * window.innerHeight,
          scale: w.scale * MASCOT_SCALE,
        });
      }
    });
    return () => ctx.revert();
  }, [ref]);
}
```

- [ ] **Step 6: Type-check + commit**

Run: `npx tsc --noEmit` → clean. `npx vitest run` → all pass (the new 3 + prior).
```bash
git add src/motion/config.ts src/motion/useMascotFlight.ts src/motion/useActiveAct.ts src/motion/useActiveAct.test.ts
git commit -m "feat(mascot): mascot toggle + flight + active-act hooks"
```

---

## Task 2: `MascotPilot` (travel + mood + PILOT line)

**Files:**
- Create: `src/components/story/MascotPilot.tsx`
- Modify: `src/components/story/StoryWorldLayer.tsx`

**Interfaces:**
- Consumes: `gsap` from `register`; `cinematicOn` from `config`; `useMascotFlight`; `useActiveAct`; `STORY_ACTS` from `content`; `MascotState` from `types`; `WORLD_ASSETS.mascot`.
- Produces: `<MascotPilot/>` (default export). Listens for the `story:signal-sent` window event (dispatched by Task 3).

- [ ] **Step 1: Create `src/components/story/MascotPilot.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from '../../motion/register';
import { cinematicOn } from '../../motion/config';
import { useMascotFlight } from '../../motion/useMascotFlight';
import { useActiveAct } from '../../motion/useActiveAct';
import { STORY_ACTS } from '../../content';
import { MascotState } from '../../types';
import { WORLD_ASSETS } from '../../story/worldAssets';

/** Per-mascotState "mood": a small yoyo loop on the inner sprite. */
const MOODS: Record<MascotState, gsap.TweenVars> = {
  sleep:     { y: 3, duration: 1.6 },
  wave:      { rotation: 8, duration: 0.8 },
  pilot:     { y: 3, duration: 1.4 },
  scan:      { x: 6, duration: 1.2 },
  alarm:     { x: 3, duration: 0.12 },
  aim:       { y: 4, scale: 0.96, duration: 0.5 },
  celebrate: { y: -10, scale: 1.1, duration: 0.4 },
  archive:   { y: 3, duration: 1.4 },
  relay:     { rotation: -6, duration: 0.45 },
  goodbye:   { rotation: 12, duration: 0.7 },
};

/** The cat pilot. Rides the ship (OUTER wrapper travels) and plays a mood on the
 *  INNER sprite per the active act's mascotState; celebrates on a sent signal.
 *  Static near the ship under reduced-motion / mobile. */
export default function MascotPilot() {
  const outerRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<HTMLImageElement>(null);
  useMascotFlight(outerRef);
  const act = useActiveAct();
  const on = cinematicOn('mascot');
  const mascotState: MascotState = STORY_ACTS.find((a) => a.id === act)?.mascotState ?? 'pilot';

  // Mood loop — re-created when the active act's mascotState changes.
  useEffect(() => {
    if (!on) return;
    const el = moodRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, { ...MOODS[mascotState], repeat: -1, yoyo: true, ease: 'sine.inOut', overwrite: true });
    });
    return () => ctx.revert();
  }, [mascotState, on]);

  // One-shot celebrate when a signal is sent (decoupled from RelayConsole).
  useEffect(() => {
    if (!on) return;
    const el = moodRef.current;
    if (!el) return;
    const onSignal = () => {
      gsap.fromTo(el, { y: 0, scale: 1 }, { y: -16, scale: 1.2, duration: 0.25, yoyo: true, repeat: 3, ease: 'power1.out' });
    };
    window.addEventListener('story:signal-sent', onSignal);
    return () => window.removeEventListener('story:signal-sent', onSignal);
  }, [on]);

  return (
    <div
      ref={outerRef}
      aria-hidden
      className={on
        ? 'pointer-events-none fixed left-0 top-0 w-24 will-change-transform'
        : 'pointer-events-none fixed right-[14%] top-[20%] w-20 opacity-60'}
    >
      <img ref={moodRef} src={WORLD_ASSETS.mascot} alt="" aria-hidden className="w-full" />
      {on && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-widest text-pop-primary/70">
          Pilot · {mascotState}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Mount it in `src/components/story/StoryWorldLayer.tsx`**

```tsx
import ShipFlight from './ShipFlight';
import MascotPilot from './MascotPilot';

/** Persistent decorative layer hosting the scroll-flying spaceship + cat pilot. */
export default function StoryWorldLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-20]">
      <ShipFlight />
      <MascotPilot />
    </div>
  );
}
```

- [ ] **Step 3: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → tests pass.
Manual (desktop): a small cat rides alongside the ship and a `PILOT · <state>` label tracks the section (wave at hero → scan at about → aim at skills → relay at contact); the cat bobs/leans differently per act. Reduced-motion / mobile: a single static cat sits near the ship's static spot (no travel, no mood, no label).

- [ ] **Step 4: Commit**

```bash
git add src/components/story/MascotPilot.tsx src/components/story/StoryWorldLayer.tsx
git commit -m "feat(mascot): MascotPilot rides the ship with per-act moods"
```

---

## Task 3: `SignalBeam` on contact submit

**Files:**
- Create: `src/components/story/contact/SignalBeam.tsx`
- Modify: `src/components/story/contact/RelayConsole.tsx`

**Interfaces:**
- Consumes: `gsap` from `register`; `cinematicOn` from `config`.
- Produces: `<SignalBeam/>` (renders null when `sectionFx` is off); `RelayConsole` dispatches the `story:signal-sent` window event on submit.

- [ ] **Step 1: Create `src/components/story/contact/SignalBeam.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';

/** A one-shot beam that shoots upward when mounted (i.e. when the form is sent).
 *  Transform/opacity only; renders nothing when the sectionFx gate is off. */
export default function SignalBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const on = cinematicOn('sectionFx');
  useEffect(() => {
    if (!on) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleY: 0, autoAlpha: 0.9, transformOrigin: 'bottom center' },
        { scaleY: 1, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [on]);
  if (!on) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute bottom-full left-8 h-[55vh] w-1 bg-gradient-to-t from-pop-primary to-transparent opacity-0 will-change-transform"
    />
  );
}
```

- [ ] **Step 2: Dispatch the event + render the beam in `src/components/story/contact/RelayConsole.tsx`**

Add the import `import SignalBeam from './SignalBeam';`. Change the form's `onSubmit` to also dispatch the event, and render `<SignalBeam/>` in the sent state. Replace the form's onSubmit:

```tsx
          <form data-stagger="0.06" className="mt-8 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
```
with:
```tsx
          <form data-stagger="0.06" className="mt-8 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); window.dispatchEvent(new CustomEvent('story:signal-sent')); }}>
```

And replace the success message block:
```tsx
          <p className="mt-8 rounded-lg border border-pop-primary/50 p-4 font-mono text-pop-primary">Signal sent. Transmission channel remains open.</p>
```
with:
```tsx
          <div className="relative mt-8">
            <SignalBeam />
            <p className="rounded-lg border border-pop-primary/50 p-4 font-mono text-pop-primary">Signal sent. Transmission channel remains open.</p>
          </div>
```

- [ ] **Step 3: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → tests pass.
Manual (desktop): filling + submitting the contact form fires a cyan beam upward from the relay area, the cat pilot does a celebrate bounce (it listens for `story:signal-sent`), and the success message appears. Reduced-motion / mobile: submit shows the success message with no beam (and the mascot doesn't celebrate). Required fields still validate.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/contact/SignalBeam.tsx src/components/story/contact/RelayConsole.tsx
git commit -m "feat(contact): signal beam on submit + mascot celebrate event"
```

---

## Task 4: Ending goodbye cameo + integration verification

**Files:**
- Modify: `src/components/story/ending/VoyageCompleteFooter.tsx`

**Interfaces:**
- Consumes: `PROFILE`, `WORLD_ASSETS` (`mascot`, `spaceship`).

- [ ] **Step 1: Add a goodbye mascot cameo + star-trail to `VoyageCompleteFooter.tsx`**

The persistent ship + mascot already streak off-screen at the `end` SHIP_PATH waypoint (Phase 2a); this adds a small waving cat + a thin star-trail to the footer itself. Full updated file:

```tsx
import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function VoyageCompleteFooter() {
  return (
    <footer className="relative overflow-hidden px-6 py-24 text-center md:px-16">
      <span aria-hidden data-anim="draw" className="mx-auto mb-6 block h-px w-40 bg-gradient-to-r from-transparent via-pop-primary to-transparent" />
      <img src={WORLD_ASSETS.spaceship} alt="" aria-hidden data-speed="1.1" className="mx-auto w-24 opacity-40" />
      <img src={WORLD_ASSETS.mascot} alt="" aria-hidden data-anim="pop" data-float className="mx-auto mt-3 w-14 opacity-80" />
      <p data-anim="words" className="mt-6 font-display text-2xl text-pop-text-main">Voyage complete.</p>
      <p data-anim="fade-up" className="mt-2 text-pop-text-muted">Thanks for exploring Low Chee Fei's developer universe.</p>
      <div data-stagger="0.06" className="mt-6 flex justify-center gap-4 font-mono text-sm">
        <a data-anim="pop" href={PROFILE.social.github} target="_blank" rel="noreferrer">GitHub</a>
        <a data-anim="pop" href={PROFILE.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a data-anim="pop" href={`mailto:${PROFILE.email}`}>Email</a>
      </div>
    </footer>
  );
}
```

(The `data-float` on the cameo mascot gives it a gentle goodbye bob via the existing engine; `data-anim` reveals are already reduced-motion-safe.)

- [ ] **Step 2: Full headless checks**

Run: `npx tsc --noEmit` → zero errors.
Run: `npx vitest run` → all pass (content 6, motion config 4, shipPath 3, forgeLayout 4, useActiveAct 3 = 20).
Run: `npx vite build` → success.

- [ ] **Step 3: Desktop walkthrough (`npm run dev`)**

Scroll top→bottom: the cat rides the ship and its mood + PILOT line change per act; the ship+cat streak off at the end; the footer shows the waving-cat cameo + star-trail. Submit the contact form → beam + cat celebrate + success. No regression (Forge, warps, project black-hole). **App renders (no insertBefore crash)** and `ScrollTrigger.getAll().filter(t=>t.pin).length === 0`. Console clean (only the external Devicon CDN error).

- [ ] **Step 4: Reduced-motion + mobile (chrome-devtools)**

390px mobile (reload): a single static cat near the ship (no travel/mood/label); contact submit shows the plain success message (no beam, no celebrate); footer renders; content readable; 0 pins. (Same gate covers reduced-motion.)

- [ ] **Step 5: If a gap is found** (cat travels on mobile, mood doesn't change, beam fires on mobile, a pin appears), fix at the gate/source, re-run Steps 2–4, then commit:

```bash
git add -A
git commit -m "fix(mascot): tighten Phase 4a gating / behaviour"
```

(If nothing needs fixing, commit Step 1:)
```bash
git add src/components/story/ending/VoyageCompleteFooter.tsx
git commit -m "feat(ending): goodbye mascot cameo + star-trail"
```

---

## Self-Review (completed during planning)

**Spec coverage (Phase 4a of the Phase-4 spec):** `MascotPilot` riding the ship with per-act moods + PILOT line (§2.1) → Tasks 1–2; the `mascot` toggle + active-act detection (§2.1) → Task 1; signal beam on successful submit + mascot celebrate via event (§2.2) → Tasks 2–3; the ending departure (ship/cat already depart via SHIP_PATH `end`) + goodbye cameo (§2.3) → Task 4; verification (§5) → Task 4. Deferred to 4b (correctly absent): the cat-comms chatbot.

**Placeholder scan:** none — every code step is complete.

**Type consistency:** `nearestAct(centers, mid)` / `useActiveAct(): StoryActId` (Task 1) consumed in Task 2; `useMascotFlight(ref)` (Task 1) consumed in Task 2; `MOODS: Record<MascotState, ...>` covers all 10 `MascotState` values; the `story:signal-sent` event is dispatched in Task 3 and listened for in Task 2 (named identically); `cinematicOn('mascot')` matches the toggle from Task 1, `cinematicOn('sectionFx')` matches the existing contact gate.

**React-safety:** no ScrollTrigger `pin`; mascot travel is a scrubbed (non-pinned) timeline; mood/celebrate/beam are loops/one-shots in `gsap.context`; active-act uses a coalesced passive scroll listener (not a second Lenis/rAF engine); two nested elements keep travel and mood from fighting over one transform.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks here with checkpoints.

Pick one to begin Task 1.
