# Phase 2b — Section Cinematics + Projects→Contact Warp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Phase 2 cinematic layer — add the About scan-beam, the Experience active-node pulse, the Contact signal-rings, and a second `WarpTransition` at Projects→Contact — all React-safe (no pins) and gated through a shared `cinematicOn()` helper.

**Architecture:** Pure GSAP + ScrollTrigger over the existing Lenis sync. NO ScrollTrigger `pin` anywhere (Phase 2a proved pinning reparents DOM and crashes React 19). The new accents are either scroll-scrubbed transforms (scan beam) or continuous loops paused offscreen (node pulse, signal rings); the second warp reuses the existing pin-free `WarpTransition`. A new `cinematicOn(toggle)` helper centralizes the reduced-motion/mobile/toggle gate.

**Tech Stack:** React 19 + TS, GSAP 3.15 (+ScrollTrigger), Lenis (already synced), Vitest for the `cinematicOn` guard.

## Global Constraints

- No React Three Fiber / Three.js / matter-js imports.
- **No ScrollTrigger `pin`** (it reparents DOM into a `.pin-spacer` and crashes React 19's reconciler — the Phase 2a lesson). Use scrub, CSS sticky, or loops instead.
- Animate only `transform` / `opacity` / `filter` (GSAP `x`/`y`/`xPercent`/`scale`/`rotate`/`autoAlpha`/`filter`); never animate `left`/`top`/`width`/`height`.
- Every ScrollTrigger/timeline is created inside `gsap.context(..., scope)` and reverted in the effect cleanup (StrictMode-safe).
- Reuse `gsap`/`ScrollTrigger` from `src/motion/register.ts` and the existing Lenis↔ScrollTrigger sync — no second Lenis / smooth-scroll / `requestAnimationFrame`.
- Gate every cinematic system through `cinematicOn(toggle)` (Task 1). When it returns false the component renders its static/no-op form; content stays readable and scroll never traps.
- Continuous loops (node pulse, signal rings) pause when their section is offscreen (ScrollTrigger `onToggle`), for perf.
- Reference assets via `WORLD_ASSETS`.
- Commits end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Type check `npx tsc --noEmit`; tests `npx vitest run`; build `npx vite build`.

---

## File Structure

**Created:**
- `src/components/story/about/ScanBeam.tsx` — scrubbed cyan scan beam for About.
- `src/components/story/contact/SignalRings.tsx` — looping signal rings for Contact.

**Modified:**
- `src/motion/config.ts` — add `sectionFx` toggle + export `cinematicOn(toggle)`.
- `src/motion/config.test.ts` — guard for `cinematicOn`.
- `src/motion/useShipFlight.ts`, `src/components/story/ShipFlight.tsx`, `src/components/story/hero/HeroLaunch.tsx`, `src/components/story/WarpTransition.tsx` — use `cinematicOn(...)` (DRY the gate).
- `src/components/story/about/OriginDossier.tsx` — mount `<ScanBeam/>`.
- `src/components/story/experience/MissionArchive.tsx` — pulse the open-to-work node.
- `src/components/story/contact/RelayConsole.tsx` — mount `<SignalRings/>` behind submit.
- `src/App.tsx` — add `<WarpTransition id="projects-contact" />` between Projects and Contact.

---

## Task 1: `cinematicOn()` gate helper + `sectionFx` toggle (and adopt it everywhere)

**Files:**
- Modify: `src/motion/config.ts`
- Modify: `src/motion/config.test.ts`
- Modify: `src/motion/useShipFlight.ts`, `src/components/story/ShipFlight.tsx`, `src/components/story/hero/HeroLaunch.tsx`, `src/components/story/WarpTransition.tsx`

**Interfaces:**
- Produces: `cinematicOn(toggle: keyof MotionConfig['toggles']): boolean` and `CONFIG.toggles.sectionFx`.
- Consumes: existing `CONFIG`.

- [ ] **Step 1: Add the toggle + helper to `src/motion/config.ts`**

In the `MotionConfig` interface `toggles` block, after `warp: boolean;`, add:

```ts
    sectionFx: boolean;
```

In the exported `CONFIG` object's `toggles` literal, after `warp: true,`, add:

```ts
    sectionFx: true,
```

At the END of the file, add the helper:

```ts
/** True only when a cinematic system should run: motion allowed, not mobile,
 *  and the system's toggle is on. The single gate for every Phase-2 system. */
export function cinematicOn(toggle: keyof MotionConfig['toggles']): boolean {
  return !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles[toggle];
}
```

- [ ] **Step 2: Write the guard in `src/motion/config.test.ts`**

Add this test (extend the existing `describe`), importing `cinematicOn`:

```ts
import { CONFIG, dur, revealDistance, cinematicOn } from './config';

// ...existing tests...

it('cinematicOn equals the reduced/mobile/toggle gate', () => {
  expect(cinematicOn('shipFlight')).toBe(
    !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.shipFlight
  );
  expect(typeof cinematicOn('warp')).toBe('boolean');
  expect(typeof cinematicOn('sectionFx')).toBe('boolean');
});
```

- [ ] **Step 3: Run the test — expect PASS**

Run: `npx vitest run src/motion/config.test.ts`
Expected: PASS (the prior 3 + this new one = 4).

- [ ] **Step 4: Adopt `cinematicOn` in the four existing cinematic units**

In `src/motion/useShipFlight.ts`: add `cinematicOn` to the `./config` import and replace
`if (CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.shipFlight) return;`
with `if (!cinematicOn('shipFlight')) return;` (you may drop the now-unused `CONFIG` import if nothing else uses it).

In `src/components/story/ShipFlight.tsx`: import `cinematicOn` from `'../../motion/config'` and replace
`const flying = !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.shipFlight;`
with `const flying = cinematicOn('shipFlight');` (drop the `CONFIG` import if unused).

In `src/components/story/hero/HeroLaunch.tsx`: import `cinematicOn` from `'../../../motion/config'` and replace
`const pinned = !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.heroPin;`
with `const pinned = cinematicOn('heroPin');` (drop the `CONFIG` import if unused).

In `src/components/story/WarpTransition.tsx`: import `cinematicOn` from `'../../motion/config'` and replace
`const full = !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.warp;`
with `const full = cinematicOn('warp');` (drop the `CONFIG` import if unused).

- [ ] **Step 5: Type-check + build + commit**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → 13 tests pass (12 + the new one).

```bash
git add src/motion/config.ts src/motion/config.test.ts src/motion/useShipFlight.ts src/components/story/ShipFlight.tsx src/components/story/hero/HeroLaunch.tsx src/components/story/WarpTransition.tsx
git commit -m "refactor(motion): central cinematicOn() gate + sectionFx toggle"
```

---

## Task 2: About scan-beam

**Files:**
- Create: `src/components/story/about/ScanBeam.tsx`
- Modify: `src/components/story/about/OriginDossier.tsx`

**Interfaces:**
- Consumes: `gsap` from `register`; `cinematicOn` from `config`.
- Produces: `<ScanBeam/>` (default export). Renders nothing when `sectionFx` is off.

- [ ] **Step 1: Create `src/components/story/about/ScanBeam.tsx`**

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';

/** A cyan scan beam that sweeps left→right across the About dossier, scrubbed
 *  by the section's scroll. Non-pinning (React-safe). Renders nothing when the
 *  sectionFx gate is off (reduced-motion / mobile). */
export default function ScanBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const on = cinematicOn('sectionFx');

  useEffect(() => {
    if (!on) return;
    const el = ref.current;
    const section = el?.closest('section');
    if (!el || !section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { xPercent: -130 },
        {
          xPercent: 130,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [on]);

  if (!on) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/3 bg-gradient-to-r from-transparent via-pop-primary/15 to-transparent blur-md"
    />
  );
}
```

- [ ] **Step 2: Mount it in `src/components/story/about/OriginDossier.tsx`**

Add the import `import ScanBeam from './ScanBeam';` and render `<ScanBeam />` as the FIRST child inside the `<section id="about">` (before the planet `<img>`), so it sits behind the `relative z-10` content:

```tsx
    <section id="about" className="relative overflow-hidden px-6 py-28 md:px-16">
      <ScanBeam />
      <img src={WORLD_ASSETS.originPlanet} alt="" aria-hidden data-speed="0.85"
        className="pointer-events-none absolute -right-20 top-10 w-[28rem] opacity-25" />
```

- [ ] **Step 3: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success.
Manual (desktop, `npm run dev`): scrolling through About, a soft cyan beam sweeps across the dossier; it reverses on scroll-up; the dossier text stays fully legible (beam is behind `z-10` content). Reduced-motion / mobile: no beam element rendered.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/about/ScanBeam.tsx src/components/story/about/OriginDossier.tsx
git commit -m "feat(about): scrubbed scan-beam sweep across the dossier"
```

---

## Task 3: Experience active-node pulse

**Files:**
- Modify: `src/components/story/experience/MissionArchive.tsx`

**Interfaces:**
- Consumes: `gsap`/`ScrollTrigger` from `register`; `cinematicOn` from `config`.
- Produces: a paused-offscreen amber pulse on the open-to-work timeline node (no new exports).

- [ ] **Step 1: Add the section ref, node ref, and pulse effect to `MissionArchive.tsx`**

Replace the file with this version (adds `useRef`/`useEffect`, a `sectionRef`, a `pulseRef` attached to the open-to-work node, and a paused-offscreen pulse loop; everything else unchanged):

```tsx
import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { MISSION_RECORDS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function MissionArchive() {
  const sectionRef = useRef<HTMLElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cinematicOn('sectionFx')) return;
    const el = pulseRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    const ctx = gsap.context(() => {
      const tl = gsap.to(el, {
        scale: 1.6,
        autoAlpha: 0.5,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
      });
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="relative overflow-hidden px-6 py-28 md:px-16">
      <img src={WORLD_ASSETS.satelliteRelay} alt="" aria-hidden data-speed="0.9"
        className="pointer-events-none absolute -left-16 top-24 w-72 opacity-20" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <AnimatedSectionHeading eyebrow="03 · Mission Archive" title="Flight log" meta="Decrypted records" />
        <div className="relative mt-10 pl-6">
          <span data-anim="draw-y" className="absolute left-0 top-0 h-full w-px bg-pop-border" />
          <ol data-stagger="0.1" className="flex flex-col gap-8">
            {MISSION_RECORDS.map((r) => {
              const open = r.id === 'open-to-work';
              return (
                <li data-anim="clip-left" key={r.id} className="relative">
                  <span
                    ref={open ? pulseRef : undefined}
                    className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border"
                    style={{ borderColor: open ? 'var(--accent-amber)' : 'var(--accent-teal)', boxShadow: open ? '0 0 10px var(--accent-amber)' : 'none' }}
                  />
                  <p className="font-mono text-xs text-pop-text-muted">{r.period}</p>
                  <h3 className="font-display text-lg text-pop-text-main">{r.role}{r.company ? ` · ${r.company}` : ''}</h3>
                  <p className="mt-1 text-pop-text-muted">{r.description}</p>
                  {r.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.skills.map((s) => <span key={s} className="rounded border border-pop-border px-2 py-0.5 font-mono text-[10px] text-pop-text-muted">{s}</span>)}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success.
Manual (desktop): the amber "Open to new missions" node gently pulses (scale/opacity) while Experience is in view, and stops when it scrolls offscreen. Reduced-motion / mobile: the node is static (effect no-ops); the record text is unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/story/experience/MissionArchive.tsx
git commit -m "feat(experience): paused-offscreen pulse on the open-to-work node"
```

---

## Task 4: Contact signal-rings

**Files:**
- Create: `src/components/story/contact/SignalRings.tsx`
- Modify: `src/components/story/contact/RelayConsole.tsx`

**Interfaces:**
- Consumes: `gsap`/`ScrollTrigger` from `register`; `cinematicOn` from `config`.
- Produces: `<SignalRings/>` (default export). Renders nothing when `sectionFx` is off.

- [ ] **Step 1: Create `src/components/story/contact/SignalRings.tsx`**

```tsx
import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';

/** Concentric signal rings that pulse outward behind the relay submit button.
 *  Continuous loop, paused when Contact is offscreen; renders nothing when the
 *  sectionFx gate is off (reduced-motion / mobile). */
export default function SignalRings() {
  const ref = useRef<HTMLDivElement>(null);
  const on = cinematicOn('sectionFx');

  useEffect(() => {
    if (!on) return;
    const root = ref.current;
    const section = root?.closest('section');
    if (!root || !section) return;
    const rings = root.querySelectorAll<HTMLElement>('[data-ring]');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, paused: true });
      rings.forEach((r, i) => {
        tl.fromTo(
          r,
          { scale: 0.4, autoAlpha: 0.6 },
          { scale: 1.6, autoAlpha: 0, duration: 2, ease: 'sine.out' },
          i * 0.6
        );
      });
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
    }, root);
    return () => ctx.revert();
  }, [on]);

  if (!on) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
      {[0, 1, 2].map((i) => (
        <span key={i} data-ring className="absolute h-16 w-16 rounded-full border border-pop-primary/40" />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Mount it behind the submit button in `src/components/story/contact/RelayConsole.tsx`**

Add the import `import SignalRings from './SignalRings';`. Wrap the submit `<button>` in a `relative` container holding the rings behind it. Replace the submit button line:

```tsx
            <button data-anim="pop" type="submit" className="self-start rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Initiate Transmission →</button>
```

with:

```tsx
            <div className="relative self-start">
              <SignalRings />
              <button data-anim="pop" type="submit" className="rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Initiate Transmission →</button>
            </div>
```

- [ ] **Step 3: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success.
Manual (desktop): concentric cyan rings pulse outward behind the "Initiate Transmission" button while Contact is in view, and pause offscreen; the button stays clickable and the form submits to the success state. Reduced-motion / mobile: no rings rendered, button/form unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/contact/SignalRings.tsx src/components/story/contact/RelayConsole.tsx
git commit -m "feat(contact): looping signal rings behind the relay submit"
```

---

## Task 5: Projects→Contact warp + integration & fallback verification

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: the existing `WarpTransition` (pin-free).

- [ ] **Step 1: Add the second warp in `src/App.tsx`**

Place a `<WarpTransition id="projects-contact" />` between `<ProjectWorldRoute />` and `<RelayConsole />`:

```tsx
      <ProjectWorldRoute />
      <WarpTransition id="projects-contact" />
      <RelayConsole />
```

(`WarpTransition` is already imported in App.tsx from Phase 2a.)

- [ ] **Step 2: Full headless checks**

Run: `npx tsc --noEmit` → zero errors.
Run: `npx vitest run` → all pass (13: content 6, motion config 4, shipPath 3).
Run: `npx vite build` → success.

- [ ] **Step 3: Desktop walkthrough (`npm run dev`)**

Scroll top→bottom and back, confirm:
- The ship still flies the full path and the hero still launches (no regression).
- About: the scan beam sweeps; dossier legible.
- Experience: the open-to-work node pulses (and stops offscreen).
- Projects→Contact: a full-screen wormhole blooms (the second warp), reversible.
- Contact: signal rings pulse behind the submit button.
- No app console errors (the external Devicon CDN error is environmental), and **the app renders** (no `insertBefore` crash — confirming no accidental pin).

- [ ] **Step 4: Reduced-motion + mobile (chrome-devtools)**

- 390px mobile viewport (reload): no scan beam / no node pulse / no signal rings / warps are crossfade-only; every section readable; no horizontal overflow; no trapped scroll.
- The disabled-cinematics branch (mobile) also stands in for reduced-motion, since both flip `cinematicOn(...)` to false identically; spot-check that the new components render `null` / no-op there.

- [ ] **Step 5: If any gap is found** (a beam/pulse/ring running on mobile, a warp trapping scroll), fix it at the `cinematicOn(...)` gate in the offending component, re-run Steps 2–4, then commit:

```bash
git add -A
git commit -m "fix(motion): tighten Phase 2b reduced-motion/mobile gating"
```

(If nothing needs fixing, just commit Step 1:)

```bash
git add src/App.tsx
git commit -m "feat(story): Projects->Contact warp + Phase 2b integration"
```

---

## Self-Review (completed during planning)

**Spec coverage (Phase 2b of the Phase-2 spec §5):** About scrubbed cinematic → Task 2 (scan beam; planet parallax already shipped via `data-speed`); Experience → Task 3 (active-node pulse; `draw-y` timeline + record decrypt already ship via `data-anim`); Contact → Task 4 (signal-rings; console-boot reveals already ship); Projects→Contact warp → Task 5; reduced-motion/mobile fallbacks + perf (paused-offscreen loops, scrub-only beam, no pins) → enforced per task and verified in Task 5. The opus review's Minor #1 (shared gate helper) → Task 1.

**Placeholder scan:** none — every code step is complete; no "TBD"/"handle edge cases"/"similar to".

**Type consistency:** `cinematicOn(toggle: keyof MotionConfig['toggles'])` defined in Task 1 and consumed in Tasks 1–4; `sectionFx` toggle added in Task 1 and read by `ScanBeam`/`MissionArchive`/`SignalRings`; `<WarpTransition id>` prop matches its Phase-2a definition and the Task-5 usage; `<ScanBeam/>` / `<SignalRings/>` default exports match their mount sites.

**React-safety:** no task uses ScrollTrigger `pin`; the scan beam is a scrub, the pulse/rings are loops, the warp is the existing pin-free primitive — so the Phase 2a crash class cannot recur.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks here with checkpoints.

Pick one to begin Task 1.
