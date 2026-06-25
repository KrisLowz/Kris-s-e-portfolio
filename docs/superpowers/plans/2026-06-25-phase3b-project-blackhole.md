# Phase 3b — Projects Black-Hole Modal Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing project modal in a black-hole portal transition — opening a project expands a black-hole overlay that "pulls you in", and closing reverses it.

**Architecture:** A thin `ProjectPortalTransition` wrapper renders the existing `ProjectModal` plus a fixed black-hole-cutout overlay animated by GSAP (transform/opacity only) on open and on close. It's click-triggered (no scroll, so no pin). `ProjectWorldRoute` picks the wrapper on capable desktops (`cinematicOn('blackhole')`) and the plain modal otherwise (reduced-motion / mobile keep the current fade).

**Tech Stack:** React 19 + TS, GSAP 3.15 (no ScrollTrigger needed here), Tailwind.

## Global Constraints

- No React Three Fiber / Three.js / matter-js imports. **No ScrollTrigger `pin`** (this is a click-triggered overlay, not a scroll effect).
- Animate only `transform`/`opacity` (GSAP `scale`/`rotate`/`autoAlpha`); never `left`/`top`/`width`/`height`.
- GSAP work created inside `gsap.context(...)` and reverted on unmount; reuse `gsap` from `src/motion/register.ts`; no second Lenis/rAF.
- Gate via `cinematicOn('blackhole')` (a new toggle). When off (reduced-motion / mobile), render the **plain `ProjectModal`** unchanged — no black-hole, no scroll trap.
- The existing `ProjectModal` accessibility (role=dialog, Escape, focus capture/restore) must remain intact; the close transition must still end in the real `onClose`.
- Decorative black-hole img `alt="" aria-hidden`, `pointer-events-none`; asset via `WORLD_ASSETS.blackHole`.
- Commits end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Type check `npx tsc --noEmit`; tests `npx vitest run`; build `npx vite build`.

---

## File Structure

**Created:**
- `src/components/story/projects/ProjectPortalTransition.tsx` — black-hole overlay + ProjectModal wrapper.

**Modified:**
- `src/motion/config.ts` — add the `blackhole` toggle.
- `src/components/story/projects/ProjectWorldRoute.tsx` — pick the wrapper vs. the plain modal.

---

## Task 1: `blackhole` toggle + `ProjectPortalTransition`

**Files:**
- Modify: `src/motion/config.ts`
- Create: `src/components/story/projects/ProjectPortalTransition.tsx`

**Interfaces:**
- Consumes: `gsap` from `register`; `Project` type; `WORLD_ASSETS.blackHole`; the existing `ProjectModal` (props `{ project, onClose }`).
- Produces: `CONFIG.toggles.blackhole`; `ProjectPortalTransition` (default export, props `{ project: Project; onClose: () => void }`).

- [ ] **Step 1: Add the `blackhole` toggle to `src/motion/config.ts`**

In the `MotionConfig` interface `toggles` block, after `forge: boolean;`, add:
```ts
    blackhole: boolean;
```
In the `CONFIG` object's `toggles` literal, after `forge: true,`, add:
```ts
    blackhole: true,
```

- [ ] **Step 2: Create `src/components/story/projects/ProjectPortalTransition.tsx`**

```tsx
import { useCallback, useEffect, useRef } from 'react';
import { gsap } from '../../../motion/register';
import { Project } from '../../../types';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import ProjectModal from './ProjectModal';

/** Wraps ProjectModal with a black-hole portal transition: a fixed black-hole
 *  overlay expands to "pull you in" on open (then fades to reveal the modal),
 *  and on close it sweeps back in before the modal unmounts. Transform/opacity
 *  only; no pin; the open animation lives in a reverted gsap.context. The modal
 *  keeps its own role=dialog / Escape / focus behaviour — we only wrap onClose
 *  so the reverse plays before the real close fires. */
export default function ProjectPortalTransition({ project, onClose }: { project: Project; onClose: () => void }) {
  const bhRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const bh = bhRef.current;
    if (!bh) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(bh, { scale: 0.2, autoAlpha: 0, rotate: -10 }, { scale: 2.2, autoAlpha: 1, rotate: 10, duration: 0.32, ease: 'power2.in' })
        .to(bh, { autoAlpha: 0, duration: 0.22, ease: 'power1.out' });
    });
    return () => ctx.revert();
  }, []);

  // Close: sweep the black-hole back in, then fire the real onClose (unmounts).
  const handleClose = useCallback(() => {
    const bh = bhRef.current;
    if (!bh) { onClose(); return; }
    gsap
      .timeline({ onComplete: onClose })
      .fromTo(bh, { scale: 1.8, autoAlpha: 0, rotate: 8 }, { scale: 0.3, autoAlpha: 1, rotate: -8, duration: 0.3, ease: 'power2.in' });
  }, [onClose]);

  return (
    <>
      <img
        ref={bhRef}
        src={WORLD_ASSETS.blackHole}
        alt=""
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[110] m-auto h-[140vh] w-[140vh] max-w-none opacity-0 will-change-transform"
      />
      <ProjectModal project={project} onClose={handleClose} />
    </>
  );
}
```

- [ ] **Step 3: Type-check + build + commit**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → existing 17 tests still pass.
```bash
git add src/motion/config.ts src/components/story/projects/ProjectPortalTransition.tsx
git commit -m "feat(projects): black-hole portal transition wrapper + toggle"
```

---

## Task 2: Wire `ProjectWorldRoute` + verification

**Files:**
- Modify: `src/components/story/projects/ProjectWorldRoute.tsx`

**Interfaces:**
- Consumes: `cinematicOn` from `config`; `ProjectPortalTransition` (Task 1); the existing `ProjectModal`.

- [ ] **Step 1: Branch the modal render in `ProjectWorldRoute.tsx`**

Add the imports `import { cinematicOn } from '../../../motion/config';` and `import ProjectPortalTransition from './ProjectPortalTransition';`. Compute `const cinematic = cinematicOn('blackhole');` inside the component (after the `closeModal` definition). Replace the existing modal render line:

```tsx
      {active && <ProjectModal project={active} onClose={closeModal} />}
```

with:

```tsx
      {active && (cinematic
        ? <ProjectPortalTransition project={active} onClose={closeModal} />
        : <ProjectModal project={active} onClose={closeModal} />)}
```

(Leave the card buttons and everything else unchanged. `ProjectModal` stays imported — it's used in the non-cinematic branch.)

- [ ] **Step 2: Headless checks**

Run: `npx tsc --noEmit` → zero errors.
Run: `npx vitest run` → all pass (17).
Run: `npx vite build` → success.

- [ ] **Step 3: Desktop walkthrough (`npm run dev`)**

In the Projects section, click a project card: a black-hole overlay expands to fill the screen, then fades to reveal the project modal; the modal still shows the project (title/overview/achievements/tags) and is keyboard-operable. Close via ✕ / Escape / click-away: the black-hole sweeps back in and the modal closes, focus returning to the card. Open/close several projects — no stuck overlay, no `insertBefore` crash (confirms no pin), console clean (only the external Devicon CDN error). Confirm `ScrollTrigger.getAll().filter(t=>t.pin).length === 0`.

- [ ] **Step 4: Reduced-motion + mobile (chrome-devtools)**

390px mobile (reload): clicking a card opens the **plain** modal (no black-hole overlay element with `WORLD_ASSETS.blackHole` present), Escape/close works, content readable, no scroll trap. (Same `cinematicOn('blackhole')` gate also covers reduced-motion.)

- [ ] **Step 5: If any gap is found** (black-hole appears on mobile, the close transition never fires `onClose` so the modal stays open, focus not restored), fix at the source, re-run Steps 2–4, then commit:

```bash
git add -A
git commit -m "fix(projects): tighten black-hole transition / gating"
```

(If nothing needs fixing, commit Step 1:)

```bash
git add src/components/story/projects/ProjectWorldRoute.tsx
git commit -m "feat(projects): wire black-hole transition (desktop) + plain modal fallback"
```

---

## Self-Review (completed during planning)

**Spec coverage (Phase 3b of the Phase-3 spec §3):** the black-hole overlay scaling open + reverse on close around the existing `ProjectModal` → Task 1; the `cinematicOn('blackhole')` gate selecting transition-vs-plain, with reduced-motion/mobile keeping the plain modal → Task 2; verification → Task 2.

**Placeholder scan:** none — both code steps are complete.

**Type consistency:** `ProjectPortalTransition` props `{ project: Project; onClose: () => void }` (Task 1) match its usage in `ProjectWorldRoute` (Task 2); `cinematicOn('blackhole')` matches the toggle added in Task 1; the wrapper reuses the existing `ProjectModal` `{ project, onClose }` contract unchanged.

**React-safety:** no ScrollTrigger `pin` (no ScrollTrigger at all here — a click-triggered timeline); the open animation is in a reverted `gsap.context`; transform/opacity only; the close timeline ends in the real `onClose`.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks here with checkpoints.

Pick one to begin Task 1.
