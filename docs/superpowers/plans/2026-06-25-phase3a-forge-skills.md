# Phase 3a — The Forge (Interactive Skills) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static Skills grid into the interactive Forge — the 17 crystals cluster into a "meteor" that the visitor scroll-detonates into Core/Extended rings, and clicking a crystal opens a focused holo detail panel.

**Architecture:** Pure 2D layout math (`forgeLayout`, unit-tested) drives crystal transforms as a function of the section's scroll progress. The Forge "holds" via CSS `position: sticky` (NO ScrollTrigger pin — pinning crashes React 19); one non-pinned scrubbed `ScrollTrigger` applies the layout each frame. Inspect is a shared accessible overlay (`ForgeHoloPanel`), so the same focus path works in both the cinematic stage and the static-grid fallback.

**Tech Stack:** React 19 + TS, GSAP 3.15 (+ScrollTrigger), Lenis (already synced), Vitest for `forgeLayout`. Devicon for crystal icons.

## Global Constraints

- No React Three Fiber / Three.js / matter-js imports.
- **No ScrollTrigger `pin`** (use CSS `sticky` + scrub). Animate only `transform`/`opacity`/`filter` (GSAP `x`/`y`/`xPercent`/`yPercent`/`rotation`/`scale`/`opacity`); never `left`/`top`/`width`/`height` as animated props.
- Every ScrollTrigger/timeline inside `gsap.context(..., scope)` reverted in cleanup (StrictMode-safe).
- Reuse `gsap`/`ScrollTrigger` from `src/motion/register.ts` + the existing Lenis sync — no second Lenis/rAF.
- Gate the cinematic via `cinematicOn('forge')` (a new toggle). When off (mobile / reduced-motion), render the **static interactive grid** fallback — content readable, no scrub/flash, no scroll trap.
- Crystals and project cards are real `<button>`s; `ForgeHoloPanel` is `role="dialog"` with Escape + focus restore. Decorative imgs `alt="" aria-hidden`.
- Reference assets via `WORLD_ASSETS`. Crystal count rendered === `SKILLS.length` (17).
- Commits end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Type check `npx tsc --noEmit`; tests `npx vitest run`; build `npx vite build`.

---

## File Structure

**Created (all under `src/components/story/skills/`):**
- `forgeLayout.ts` — pure layout math (cluster/ring positions, `crystalStateAt`).
- `forgeLayout.test.ts` — unit tests.
- `ForgeHoloPanel.tsx` — the focused inspect overlay (detail dialog).
- `CrystalButton.tsx` — one crystal as a button (shared by grid + stage).
- `Forge.tsx` — the `#skills` section: owns focus state + panel; renders the grid (Task 3) or the cinematic stage (Task 4).
- `ForgeStage.tsx` — the cinematic crystals-as-meteor sticky stage.

**Modified:**
- `src/motion/config.ts` — add the `forge` toggle.
- `src/App.tsx` — render `<Forge/>` instead of `<SkillField/>`.

**Deleted:**
- `src/components/story/skills/SkillField.tsx` — replaced by `Forge.tsx` (Task 3).

---

## Task 1: `forge` toggle + `forgeLayout` math (TDD)

**Files:**
- Modify: `src/motion/config.ts`
- Create: `src/components/story/skills/forgeLayout.ts`, `src/components/story/skills/forgeLayout.test.ts`

**Interfaces:**
- Consumes: `SKILLS` from `src/content`.
- Produces: `CONFIG.toggles.forge`; `Vec2`, `CrystalState`, `CLUSTER_POS`, `DETONATE_AT`, `ringPositions()`, `crystalStateAt(progress, i)`.

- [ ] **Step 1: Add the `forge` toggle to `src/motion/config.ts`**

In the `MotionConfig` interface `toggles` block, after `sectionFx: boolean;`, add:
```ts
    forge: boolean;
```
In the `CONFIG` object's `toggles` literal, after `sectionFx: true,`, add:
```ts
    forge: true,
```

- [ ] **Step 2: Write `src/components/story/skills/forgeLayout.ts`**

```ts
import { SKILLS } from '../../../content';

export interface Vec2 { x: number; y: number; }
export interface CrystalState { x: number; y: number; rotate: number; scale: number; opacity: number; }

const TAU = Math.PI * 2;

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function seeded(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Settled ring positions as NORMALIZED offsets from stage center (~[-1,1]).
 *  Inner-ring skills sit on a small circle, outer-ring skills on a larger one;
 *  returned in SKILLS order (index i → that skill's settled slot). */
export function ringPositions(): Vec2[] {
  const innerN = SKILLS.filter((s) => s.ring === 'inner').length;
  const outerN = SKILLS.filter((s) => s.ring === 'outer').length;
  const R_IN = 0.34;
  const R_OUT = 0.72;
  let iIn = 0;
  let iOut = 0;
  return SKILLS.map((s) => {
    if (s.ring === 'inner') {
      const a = (iIn++ / innerN) * TAU - Math.PI / 2;
      return { x: Math.cos(a) * R_IN, y: Math.sin(a) * R_IN };
    }
    const a = (iOut++ / outerN) * TAU - Math.PI / 2;
    return { x: Math.cos(a) * R_OUT, y: Math.sin(a) * R_OUT };
  });
}

/** Tight clustered "meteor" positions near center (seeded jitter), SKILLS order. */
export const CLUSTER_POS: Vec2[] = SKILLS.map((_, i) => ({
  x: (seeded(i) - 0.5) * 0.12,
  y: (seeded(i + 99) - 0.5) * 0.12,
}));

/** Scroll progress (0..1) at which the meteor detonates. */
export const DETONATE_AT = 0.45;

const RINGS = ringPositions();

function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

/** Pure function of section scroll progress (0..1) and crystal index → its
 *  normalized transform. Clustered before DETONATE_AT, bursting to the ring
 *  after; deterministic and reversible. x/y are normalized offsets from stage
 *  center (multiply by half-stage width/height to get px). */
export function crystalStateAt(progress: number, i: number): CrystalState {
  const from = CLUSTER_POS[i];
  const to = RINGS[i];
  const raw = (progress - DETONATE_AT) / (1 - DETONATE_AT);
  const t = easeOut(Math.min(1, Math.max(0, raw)));
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    rotate: (seeded(i) - 0.5) * 220 * (1 - t),
    scale: 0.6 + 0.4 * t,
    opacity: 1,
  };
}
```

- [ ] **Step 3: Write the failing test `src/components/story/skills/forgeLayout.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { ringPositions, CLUSTER_POS, crystalStateAt } from './forgeLayout';
import { SKILLS } from '../../../content';

const dist = (p: { x: number; y: number }) => Math.hypot(p.x, p.y);

describe('forgeLayout', () => {
  it('has a ring position per skill (17), split 8 inner / 9 outer', () => {
    expect(ringPositions()).toHaveLength(17);
    expect(SKILLS.filter((s) => s.ring === 'inner')).toHaveLength(8);
    expect(SKILLS.filter((s) => s.ring === 'outer')).toHaveLength(9);
  });

  it('settles inner-ring crystals closer to center than outer-ring ones', () => {
    const r = ringPositions();
    const innerMax = Math.max(...SKILLS.map((s, i) => (s.ring === 'inner' ? dist(r[i]) : 0)));
    const outerMin = Math.min(...SKILLS.map((s, i) => (s.ring === 'outer' ? dist(r[i]) : Infinity)));
    expect(innerMax).toBeLessThan(outerMin);
  });

  it('is clustered at progress 0 and settled at progress 1', () => {
    const r = ringPositions();
    for (let i = 0; i < SKILLS.length; i++) {
      expect(Math.abs(crystalStateAt(0, i).x - CLUSTER_POS[i].x)).toBeLessThan(1e-9);
      expect(Math.abs(crystalStateAt(1, i).x - r[i].x)).toBeLessThan(1e-9);
      expect(Math.abs(crystalStateAt(1, i).y - r[i].y)).toBeLessThan(1e-9);
    }
  });

  it('is deterministic and finite', () => {
    expect(crystalStateAt(0.7, 5)).toEqual(crystalStateAt(0.7, 5));
    for (let i = 0; i < SKILLS.length; i++) {
      const c = crystalStateAt(0.5, i);
      expect(Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.rotate) && Number.isFinite(c.scale)).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Run the test — expect PASS**

Run: `npx vitest run src/components/story/skills/forgeLayout.test.ts`
Expected: PASS (4 tests). (Pure-data guards; written alongside the module.)

- [ ] **Step 5: Type-check + commit**

Run: `npx tsc --noEmit` → no errors.
```bash
git add src/motion/config.ts src/components/story/skills/forgeLayout.ts src/components/story/skills/forgeLayout.test.ts
git commit -m "feat(forge): forgeLayout math (cluster->ring) + forge toggle"
```

---

## Task 2: `ForgeHoloPanel` — the focused inspect overlay

**Files:**
- Create: `src/components/story/skills/ForgeHoloPanel.tsx`

**Interfaces:**
- Consumes: `Skill` type; `PROJECTS` from `src/content`; `WORLD_ASSETS`.
- Produces: `ForgeHoloPanel` (default export), props `{ skill: Skill; onClose: () => void }`.

- [ ] **Step 1: Create the component**

```tsx
import { useEffect, useRef } from 'react';
import { Skill } from '../../../types';
import { PROJECTS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

/** Maps a skill's usedIn project ids → display chips (title + award flag). */
function usedInChips(skill: Skill) {
  return skill.usedIn.map((id) => {
    const p = PROJECTS.find((x) => x.id === id);
    return { id, title: p ? p.title : id, award: !!p && !!p.achievements[0]?.startsWith('🏆') };
  });
}

/** Focused inspect overlay for one skill crystal: a centered holo dialog over a
 *  dimmed field. Escape / click-away / Close button dismiss; focus restores to
 *  the opener. */
export default function ForgeHoloPanel({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); opener?.focus(); };
  }, [onClose]);

  const chips = usedInChips(skill);
  return (
    <div role="dialog" aria-modal="true" aria-label={`${skill.name} details`}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-pop-primary/40 bg-pop-surface/95 p-8 text-center"
        onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 rounded border border-pop-border px-2 py-1 font-mono text-xs">✕</button>
        <div className="relative grid place-items-center">
          <img src={WORLD_ASSETS.skillCrystal} alt="" aria-hidden className="w-28" />
          <i className={`${skill.iconClass} absolute text-4xl`} aria-hidden />
        </div>
        <h3 className="font-display text-2xl text-pop-text-main">{skill.name}</h3>
        <p className="font-mono text-xs uppercase tracking-widest text-pop-primary">{skill.category}</p>
        <p className="text-pop-text-muted">{skill.blurb}</p>
        <div className="flex items-center gap-1" aria-label={`Level ${skill.level} of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`h-2 w-6 rounded-full ${n <= skill.level ? 'bg-pop-primary' : 'bg-pop-border'}`} />
          ))}
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <span key={c.id} className="rounded-full border border-pop-border px-3 py-1 font-mono text-[11px] text-pop-text-muted">
                {c.award ? '🏆 ' : ''}{c.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + build + commit**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → existing tests still pass.
```bash
git add src/components/story/skills/ForgeHoloPanel.tsx
git commit -m "feat(forge): ForgeHoloPanel inspect overlay (level meter + project chips)"
```

---

## Task 3: `CrystalButton` + `Forge` interactive grid (replaces SkillField)

**Files:**
- Create: `src/components/story/skills/CrystalButton.tsx`, `src/components/story/skills/Forge.tsx`
- Delete: `src/components/story/skills/SkillField.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `SKILLS`, `Skill`, `WORLD_ASSETS`, `AnimatedSectionHeading`, `ForgeHoloPanel`.
- Produces: `CrystalButton` (props `{ skill, onActivate, className?, style? }`); `Forge` (default export, renders `<section id="skills">`).

- [ ] **Step 1: Create `src/components/story/skills/CrystalButton.tsx`**

```tsx
import { CSSProperties } from 'react';
import { Skill } from '../../../types';
import { WORLD_ASSETS } from '../../../story/worldAssets';

/** One skill crystal as a real button (crystal cutout + Devicon + name).
 *  Positioning is the parent's job (className/style). */
export default function CrystalButton({ skill, onActivate, className, style }: {
  skill: Skill;
  onActivate: (skill: Skill) => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button type="button" onClick={() => onActivate(skill)} style={style}
      className={`group relative grid place-items-center ${className ?? ''}`}>
      <img src={WORLD_ASSETS.skillCrystal} alt="" aria-hidden className="w-20 transition group-hover:scale-110" />
      <i className={`${skill.iconClass} absolute text-2xl`} aria-hidden />
      <span className="sr-only">{skill.name}</span>
      <span aria-hidden className="mt-1 font-mono text-[10px] text-pop-text-muted">{skill.name}</span>
    </button>
  );
}
```

- [ ] **Step 2: Create `src/components/story/skills/Forge.tsx` (grid baseline)**

```tsx
import { useState, useCallback } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { Skill } from '../../../types';
import CrystalButton from './CrystalButton';
import ForgeHoloPanel from './ForgeHoloPanel';

/** The Skills act. Renders an interactive crystal grid; clicking a crystal
 *  opens its focused holo panel. (The cinematic meteor stage is added in the
 *  next task; this grid is the universal fallback + baseline.) */
export default function Forge() {
  const [focused, setFocused] = useState<Skill | null>(null);
  const close = useCallback(() => setFocused(null), []);
  const inner = SKILLS.filter((s) => s.ring === 'inner');
  const outer = SKILLS.filter((s) => s.ring === 'outer');

  return (
    <section id="skills" className="relative px-6 py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
        <p data-anim="fade-up" className="mt-8 font-mono text-xs uppercase tracking-widest text-pop-primary">Core</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-8">
          {inner.map((s) => <div data-anim="pop" key={s.id}><CrystalButton skill={s} onActivate={setFocused} /></div>)}
        </div>
        <p data-anim="fade-up" className="mt-10 font-mono text-xs uppercase tracking-widest text-pop-secondary">Extended</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-5 md:grid-cols-9">
          {outer.map((s) => <div data-anim="pop" key={s.id}><CrystalButton skill={s} onActivate={setFocused} /></div>)}
        </div>
      </div>
      {focused && <ForgeHoloPanel skill={focused} onClose={close} />}
    </section>
  );
}
```

- [ ] **Step 3: Swap `SkillField` → `Forge` in `src/App.tsx` and delete `SkillField.tsx`**

In `src/App.tsx`, replace the import `import SkillField from './components/story/skills/SkillField';` with `import Forge from './components/story/skills/Forge';`, and replace `<SkillField />` with `<Forge />`. Then:
```bash
git rm src/components/story/skills/SkillField.tsx
```

- [ ] **Step 4: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → tests pass.
Manual (`npm run dev`): the Skills grid renders (8 core + 9 extended); clicking any crystal opens the holo panel with that skill's category/blurb/level meter and project chips (e.g. Kotlin → "🏆 TrackPoint"); Escape / click-away / ✕ closes and returns focus to the crystal. Keyboard: Tab to a crystal, Enter opens.

- [ ] **Step 5: Commit**

```bash
git add src/components/story/skills/CrystalButton.tsx src/components/story/skills/Forge.tsx src/App.tsx
git commit -m "feat(forge): interactive crystal grid + focus holo panel (replaces SkillField)"
```

---

## Task 4: `ForgeStage` — cinematic crystals-as-meteor (desktop)

**Files:**
- Create: `src/components/story/skills/ForgeStage.tsx`
- Modify: `src/components/story/skills/Forge.tsx`

**Interfaces:**
- Consumes: `gsap`/`ScrollTrigger` from `register`; `cinematicOn` from `config`; `crystalStateAt`/`DETONATE_AT` from `forgeLayout`; `SKILLS`, `CrystalButton`, `AnimatedSectionHeading`.
- Produces: `ForgeStage` (default export), props `{ onActivate: (s: Skill) => void }`. `Forge` renders it when `cinematicOn('forge')`.

- [ ] **Step 1: Create `src/components/story/skills/ForgeStage.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/register';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { Skill } from '../../../types';
import CrystalButton from './CrystalButton';
import { crystalStateAt, DETONATE_AT } from './forgeLayout';

/** Cinematic Forge: the 17 crystals start clustered (a glowing meteor) and a
 *  non-pinned scrubbed trigger bursts them out to their rings as the tall
 *  section scrolls past a sticky stage. Crystals become clickable once settled.
 *  React-safe: CSS sticky (no pin), one ScrollTrigger, transform-only. */
export default function ForgeStage({ onActivate }: { onActivate: (s: Skill) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const crystalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const settledRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const apply = (progress: number) => {
      const halfW = stage.clientWidth / 2;
      const halfH = stage.clientHeight / 2;
      for (let i = 0; i < SKILLS.length; i++) {
        const el = crystalRefs.current[i];
        if (!el) continue;
        const c = crystalStateAt(progress, i);
        gsap.set(el, { xPercent: -50, yPercent: -50, x: c.x * halfW, y: c.y * halfH, rotation: c.rotate, scale: c.scale, opacity: c.opacity });
      }
    };
    const setSettled = (settled: boolean) => {
      if (settled === settledRef.current) return;
      settledRef.current = settled;
      crystalRefs.current.forEach((el) => { if (el) el.style.pointerEvents = settled ? 'auto' : 'none'; });
    };

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          apply(self.progress);
          setSettled(self.progress >= DETONATE_AT);
          if (flashRef.current) {
            flashRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(self.progress - DETONATE_AT) / 0.05));
          }
        },
      });
      apply(st.progress);
      setSettled(st.progress >= DETONATE_AT);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="relative h-[260vh]">
      <div ref={stageRef} className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <div className="pointer-events-none absolute top-24 z-10 w-full text-center">
          <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
        </div>
        {SKILLS.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => { crystalRefs.current[i] = el; }}
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{ pointerEvents: 'none' }}
          >
            <CrystalButton skill={s} onActivate={onActivate} />
          </div>
        ))}
        <div ref={flashRef} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Branch `Forge.tsx` to the stage when the gate is on**

Update `src/components/story/skills/Forge.tsx` to render `ForgeStage` on capable desktops and the grid otherwise, keeping the shared focus state + panel:

```tsx
import { useState, useCallback } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { Skill } from '../../../types';
import { cinematicOn } from '../../../motion/config';
import CrystalButton from './CrystalButton';
import ForgeHoloPanel from './ForgeHoloPanel';
import ForgeStage from './ForgeStage';

export default function Forge() {
  const [focused, setFocused] = useState<Skill | null>(null);
  const close = useCallback(() => setFocused(null), []);
  const cinematic = cinematicOn('forge');
  const inner = SKILLS.filter((s) => s.ring === 'inner');
  const outer = SKILLS.filter((s) => s.ring === 'outer');

  return (
    <>
      {cinematic ? (
        <ForgeStage onActivate={setFocused} />
      ) : (
        <section id="skills" className="relative px-6 py-28 md:px-16">
          <div className="mx-auto max-w-5xl">
            <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
            <p data-anim="fade-up" className="mt-8 font-mono text-xs uppercase tracking-widest text-pop-primary">Core</p>
            <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-8">
              {inner.map((s) => <div data-anim="pop" key={s.id}><CrystalButton skill={s} onActivate={setFocused} /></div>)}
            </div>
            <p data-anim="fade-up" className="mt-10 font-mono text-xs uppercase tracking-widest text-pop-secondary">Extended</p>
            <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-5 md:grid-cols-9">
              {outer.map((s) => <div data-anim="pop" key={s.id}><CrystalButton skill={s} onActivate={setFocused} /></div>)}
            </div>
          </div>
        </section>
      )}
      {focused && <ForgeHoloPanel skill={focused} onClose={close} />}
    </>
  );
}
```

- [ ] **Step 3: Type-check + build + manual verify**

Run: `npx tsc --noEmit` → clean. `npx vite build` → success. `npx vitest run` → tests pass.
Manual (desktop): the Skills section is tall; scrolling holds a sticky stage where the 17 crystals start clustered (meteor), then **burst out to Core/Extended rings** past ~45% with a white flash; scrolling back **re-clusters** them. Once settled, clicking a crystal opens its holo panel (field dims behind). **The app must render with no `insertBefore` crash** (confirms no accidental pin / no DOM reparent). Emulate reduced-motion or a 390px mobile viewport: the static grid renders instead (no sticky/scrub/flash), crystals still open the panel on tap.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/skills/ForgeStage.tsx src/components/story/skills/Forge.tsx
git commit -m "feat(forge): cinematic crystals-as-meteor sticky stage (React-safe)"
```

---

## Task 5: Integration + verification

**Files:** none (verification + any small gating fixes uncovered).

- [ ] **Step 1: Full headless checks**

Run: `npx tsc --noEmit` → zero errors.
Run: `npx vitest run` → all pass (content 6, motion config 4, shipPath 3, forgeLayout 4 = 17).
Run: `npx vite build` → success.

- [ ] **Step 2: Desktop walkthrough (`npm run dev`)**

Confirm, scrolling through Skills and back:
- 17 crystals; cluster → flash/detonate (~45%) → settle into 8-inner / 9-outer rings; reversible on scroll-up.
- After settle, clicking any crystal opens the holo panel with correct data (category, blurb, level meter, project chips incl. 🏆 TrackPoint); Esc / away / ✕ closes, focus returns.
- No regression elsewhere (ship flies, hero launch, warps); **app renders (no insertBefore crash)** — i.e. no accidental pin; `ScrollTrigger.getAll().filter(t=>t.pin).length === 0`.
- Console clean (only the external Devicon CDN error).

- [ ] **Step 3: Reduced-motion + mobile (chrome-devtools)**

- 390px mobile (reload): the static interactive grid renders (no sticky/scrub/flash); tapping a crystal opens the panel; content readable; no horizontal overflow; 0 pins.
- This mobile branch also stands in for reduced-motion (same `cinematicOn('forge')` gate).

- [ ] **Step 4: If any gap is found** (a pin present, crystals unclickable when settled, the field not re-clustering on reverse, the panel data wrong), fix at the source, re-run Steps 1–3, then commit:

```bash
git add -A
git commit -m "fix(forge): tighten Phase 3a integration / gating"
```

(If nothing needs fixing, Phase 3a is complete — the prior commits stand.)

---

## Self-Review (completed during planning)

**Spec coverage (Phase 3a of the Phase-3 spec):** `forgeLayout` (§2.1) → Task 1; the sticky scrubbed crystals-as-meteor stage + flash + settled-gating (§2.2) → Task 4; crystal buttons + focus + holo panel with level/used-in chips (§2.3) → Tasks 2–3; the static-grid fallback wired to the same panel (§2.4) → Task 3 (grid) + Task 4 (gate); the new `forge` toggle → Task 1; verification (§5) → Task 5. Deferred to 3b (correctly absent): the Projects black-hole modal transition.

**Placeholder scan:** none — every code step is complete.

**Type consistency:** `crystalStateAt`/`ringPositions`/`CLUSTER_POS`/`DETONATE_AT` defined in Task 1 and consumed in Task 4; `CrystalButton` props (`skill`/`onActivate`/`className`/`style`) defined in Task 3 and used in Tasks 3–4; `ForgeHoloPanel` props (`skill`/`onClose`) defined in Task 2 and used in Tasks 3–4; `Forge` default export replaces `SkillField` in `App.tsx`; `cinematicOn('forge')` matches the toggle added in Task 1.

**React-safety:** no ScrollTrigger `pin`; the Forge hold is CSS `sticky`; one scrubbed trigger; focus is React state + an overlay (no crystal DOM reparenting). The Phase-2a crash class cannot recur.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks here with checkpoints.

Pick one to begin Task 1.
