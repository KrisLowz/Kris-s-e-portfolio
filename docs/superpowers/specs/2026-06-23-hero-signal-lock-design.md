# Hero — "First Contact: Signal-Lock" Design Spec

**Date:** 2026-06-23
**Topic:** Replace the Hero's Typed.js typewriter name with a signal-lock reveal — the name resolves once from scrambled glyphs, like tuning a frequency.
**Status:** Approved in brainstorming. The reveal logic + wiring are buildable + unit-testable now; the surrounding visual flourishes are deferred to the browser pass.

---

## Context — why

The journey-map's Hero ("First Contact") calls for the name to "render letter by letter, scrambled then snap — like tuning a frequency. Never a typewriter (too common)." The current Hero uses `typed.js` to cycle the name + three role titles. We replace that with a **signal-lock** reveal of the name, resolving **once** and holding (roles already appear in the floating identity constellation + the subtitle, so nothing is lost). Reduced-motion shows the static name, as today.

---

## Architecture

- **`src/components/hero/signalLock.ts`** (pure, no React/DOM) — the testable core:
  - `signalLock(target: string, progress: number, tick?: number): string` — returns a same-length string where each non-space character is "locked" to its real value once `progress` passes a per-character, left-to-right threshold, and otherwise shows a deterministic scramble glyph that varies with `tick` (for per-frame liveliness). Spaces are preserved (layout stable). `progress >= 1` → exactly `target`. No `Math.random` (deterministic given `target/progress/tick`).
- **`src/components/hero/SignalLockText.tsx`** — drives `progress` 0→1 over a duration via `requestAnimationFrame`, incrementing `tick` per frame, synced to the existing intro (`intro:type`) with a timeout fallback; renders `<span aria-label={text}>`. Under `CONFIG.reducedMotion`, renders the static `text`. Cancels its rAF/listener/timeout on unmount.
- **`src/components/Hero.tsx`** (modify) — drop the `typed.js` import + effect; render `<SignalLockText text={PROFILE.name} />` inside the existing gradient `<span>`. Everything else (boot status, label, subtitle, CTAs, socials, constellation) stays.

`signalLock` (logic) and `SignalLockText` (view) are separate, independently testable units. File names differ by more than case (no Windows casing collision).

---

## The signal-lock logic

- Per character `i` of `n`: a **reveal threshold** `(i + 1) / (n + 1) ∈ (0,1)` — so at `progress = 0` none are locked (all scrambled), at `progress = 1` all are locked (→ exact target), and locks move **left-to-right** as progress rises.
- Spaces always render as spaces (keeps the name's word breaks stable while it resolves).
- Scramble glyph for an unlocked char = `GLYPHS[(i*31 + tick*17) mod len]` from a fixed techy glyph set — deterministic, but `tick` (incremented each animation frame by the component) makes it churn so it reads as live static.

---

## Build split

- ✅ **Now (buildable + verifiable):** `signalLock.ts` + Vitest tests (progress 1 === target; progress 0 ≠ target but same length + spaces preserved; left-to-right lock ordering; determinism); `SignalLockText.tsx`; the `Hero.tsx` swap (remove typed.js). `tsc` + tests are the gates.
- ⏸ **Deferred (pure visual, browser pass):** tune the reveal duration/feel; the optional targeting-reticle/crosshair around the name, the scan-line subtitle sweep, and the ambient wireframe sphere from the storyline.

---

## Verification

- `npx tsc --noEmit` clean; `npm test` green (new signalLock tests + existing 33).
- Read-through: `Hero.tsx` no longer imports/uses `typed.js`; renders `<SignalLockText text={PROFILE.name} />`; reduced-motion path intact; `SignalLockText` cleans up its rAF/listener/timeout.
- When a browser returns: load the hero, confirm the name churns through glyphs and resolves left-to-right to "Low Chee Fei", and that reduced-motion shows it static.

---

## Open decisions (owner)
1. **Reveal duration/feel** — finalised in the browser pass (the logic is duration-agnostic).
2. Whether to later add the reticle / scan-line / ambient-sphere flourishes (deferred visuals).
