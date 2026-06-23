# Hero — Signal-Lock Name Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** Replace the Hero's typed.js name with a signal-lock reveal — the name resolves once from scrambled glyphs, left-to-right.

**Architecture:** Pure tested `signalLock(target, progress, tick)` + a thin `SignalLockText` component that drives progress via rAF (synced to `intro:type`), swapped into `Hero.tsx` for the name. Reduced-motion → static name.

**Spec:** `docs/superpowers/specs/2026-06-23-hero-signal-lock-design.md`. Logic + wiring buildable/verifiable now; reveal feel + optional flourishes deferred to the browser.

## Global Constraints
- `signalLock` pure (no React/DOM/`Math.random`); deterministic given `(target, progress, tick)`. Glyph set contains **no letters** (so a scrambled position never coincidentally equals a target letter). Spaces preserved. `progress >= 1` → exact target.
- `SignalLockText` cancels its rAF/listener/timeout on unmount; honours `CONFIG.reducedMotion` (static name).
- Hero stops importing/using `typed.js`; everything else in the section stays.
- `tsc --noEmit` clean; `npm test` green (new tests + existing 33). File names differ by more than case (no Windows collision).

---

### Task 1: `signalLock.ts` + tests (TDD)
- [ ] **Test** — `src/components/hero/signalLock.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { signalLock } from './signalLock';

const NAME = 'Low Chee Fei';

describe('signalLock', () => {
  it('returns the exact target at progress 1', () => {
    expect(signalLock(NAME, 1, 5)).toBe(NAME);
  });
  it('is fully scrambled at progress 0 (same length, spaces preserved, not target)', () => {
    const s = signalLock(NAME, 0, 1);
    expect(s).not.toBe(NAME);
    expect(s.length).toBe(NAME.length);
    for (let i = 0; i < NAME.length; i++) {
      if (NAME[i] === ' ') expect(s[i]).toBe(' ');
      else expect(s[i]).not.toBe(' ');
    }
  });
  it('locks left-to-right', () => {
    const s = signalLock('ABCDE', 0.5, 0);
    expect(s.startsWith('AB')).toBe(true);
    expect(s).not.toBe('ABCDE');
  });
  it('is deterministic for identical args', () => {
    expect(signalLock(NAME, 0.4, 3)).toBe(signalLock(NAME, 0.4, 3));
  });
});
```
- [ ] **Run → FAIL** (`npm test`).
- [ ] **Implement** — `src/components/hero/signalLock.ts`:
```ts
/** Scramble glyphs — deliberately NO letters, so an unlocked position never
 *  coincidentally equals a target letter (keeps the reveal + tests clean). */
const GLYPHS = '!<>-_\\/[]{}=+*^?#$%&@01234789';

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/**
 * One frame of a "signal-lock" reveal of `target`. Each non-space character
 * locks to its real value once `progress` passes its left-to-right threshold;
 * otherwise it shows a glyph that churns with `tick`. Spaces are preserved.
 * Pure + deterministic: progress>=1 returns the exact target.
 */
export function signalLock(target: string, progress: number, tick = 0): string {
  const p = clamp(progress, 0, 1);
  const n = target.length;
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = target[i];
    if (ch === ' ') {
      out += ' ';
      continue;
    }
    const locked = p >= 1 || p > (i + 1) / (n + 1);
    out += locked ? ch : GLYPHS[Math.abs(i * 31 + tick * 17) % GLYPHS.length];
  }
  return out;
}
```
- [ ] **Run → PASS** (`npm test`) + `tsc --noEmit` clean.
- [ ] **Commit** — `git add src/components/hero/signalLock.ts src/components/hero/signalLock.test.ts && git commit -m "feat(hero): signal-lock text reveal (pure, tested)"`

---

### Task 2: `SignalLockText.tsx`
- [ ] **Create** — `src/components/hero/SignalLockText.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { signalLock } from './signalLock';
import { CONFIG } from '../../animations';

/** Drives a signal-lock reveal of `text` once, synced to the intro (`intro:type`)
 *  with a timeout fallback. Static under reduced motion. */
export default function SignalLockText({
  text,
  durationMs = 1600,
}: {
  text: string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(() =>
    CONFIG.reducedMotion ? text : signalLock(text, 0, 0)
  );

  useEffect(() => {
    if (CONFIG.reducedMotion) {
      setDisplay(text);
      return;
    }
    let rafId = 0;
    let startTs = 0;
    let tick = 0;
    let started = false;

    const step = (now: number) => {
      if (!startTs) startTs = now;
      const p = Math.min(1, (now - startTs) / durationMs);
      tick += 1;
      setDisplay(signalLock(text, p, tick));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    const start = () => {
      if (started) return;
      started = true;
      rafId = requestAnimationFrame(step);
    };

    window.addEventListener('intro:type', start, { once: true });
    const fallback = window.setTimeout(start, 1400);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('intro:type', start);
      clearTimeout(fallback);
    };
  }, [text, durationMs]);

  return <span aria-label={text}>{display}</span>;
}
```
- [ ] **Type-check** — `tsc --noEmit` clean.
- [ ] **Commit** — `git add src/components/hero/SignalLockText.tsx && git commit -m "feat(hero): SignalLockText component (rAF, intro-synced, reduced-motion safe)"`

---

### Task 3: Swap into `Hero.tsx`
- [ ] **Edit `src/components/Hero.tsx`:**
  - Imports: remove `import Typed from 'typed.js';` and `import { CONFIG } from '../animations';`; change `import React, { useEffect, useRef } from 'react';` → `import React from 'react';`; add `import SignalLockText from './hero/SignalLockText';`.
  - Remove the `typeTarget` ref and the entire typed.js `useEffect`.
  - Replace the inner name span:
    ```tsx
    <span ref={typeTarget}></span>
    ```
    with
    ```tsx
    <SignalLockText text={PROFILE.name} />
    ```
- [ ] **Verify** — `tsc --noEmit` clean (confirms no dangling `Typed`/`CONFIG`/`useEffect`/`useRef`/`typeTarget`); `npm test` green; read-through confirms typed.js is gone and `SignalLockText` renders the name.
- [ ] **Commit** — `git add src/components/Hero.tsx && git commit -m "feat(hero): signal-lock the name reveal (retire typed.js typewriter)"`

---

## Self-Review
- Spec coverage: `signalLock` + tests (T1) ✓; `SignalLockText` (T2) ✓; Hero swap removing typed.js (T3) ✓; reduced-motion + cleanup ✓; deferred = reveal feel + flourishes.
- Placeholders: none — complete code each step.
- Type consistency: `signalLock(target,progress,tick)` used identically T1→T2; `SignalLockText` default export matches the T3 import; `PROFILE.name` exists.

## Deferred (browser)
Tune reveal duration/easing; optionally add the targeting reticle, scan-line subtitle sweep, and ambient wireframe sphere.
