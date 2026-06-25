# Phase 3 — Interactive Scenes — Design Spec

**Date:** 2026-06-25
**Status:** Approved in brainstorming; ready for implementation planning (writing-plans, starting with 3a).
**Parent:** `docs/superpowers/specs/2026-06-24-cosmic-cyberpunk-voyage-redesign-design.md` (§9 Phase 3).
**Beat reference:** `docs/2026-06-24-cosmic-cyberpunk-interaction-spec.md` (Skills meteor scene + Projects portal modal) — adapted here to the React-safe, no-pin reality proven in Phase 2.
**Builds on:** Phase 0+1 (readable static voyage) + Phase 2 (cinematic motion layer) on `v2`.

---

## 1. Context — what Phase 3 adds

Phase 3 turns the two "toy" sections interactive:

1. **Skills — the Forge.** Today `SkillField` is a static grid of 17 crystals. Phase 3a makes the crystals **cluster into a glowing meteor that the visitor scroll-detonates into orbit rings**, then lets them **click a crystal to inspect it** (focus-to-center + a holographic detail panel).
2. **Projects — the Vault.** Today a project card opens a plain accessible modal. Phase 3b adds a **black-hole-portal transition** to that open/close.

**Locked decisions (from brainstorming):**
- **Skills mechanism: "crystals-as-meteor."** The 17 crystals themselves form the meteor (no separate meteor asset — there is none in `/assets/world/`). Scroll scrubs cluster → cracks → flash/detonate → burst → settled Core/Extended rings; reversible (scroll up re-assembles).
- **Crystal inspect: "focus + holo panel."** Click a settled crystal → it floats to center and enlarges, the field dims, and a holo panel shows its detail.
- **React-safe only.** CSS `position: sticky` + scroll-scrubbed timelines + React state for focus. **No ScrollTrigger `pin` anywhere** (Phase 2a proved pinning reparents DOM and crashes React 19).
- **Internal phasing: 3a (Skills) then 3b (Projects).** Each gets its own writing-plans plan; 3a is built and felt first.

**Not in Phase 3** (later phases): mascot pose states (Phase 4), the reskinned chatbot (Phase 4), the Phase-5 cleanup. No new portfolio data is needed — the `Skill` type already carries `category`, `blurb`, `usedIn`, `level`.

---

## 2. Skills — the Forge (Phase 3a)

### 2.1 Layout math — `src/scene/forge/forgeLayout.ts` (pure, unit-tested)
> Note: this is plain 2D/DOM geometry (viewport-relative), NOT the deleted R3F forge. New module.

- **Inputs:** the 17 `SKILLS` split by `ring` (8 inner / 9 outer).
- **Exports:**
  - `CLUSTER_POS: Vec2[]` — tight, near-center positions (the meteor mass), seeded per index.
  - `ringPositions(): Vec2[]` — settled positions: an inner ring of the 8 `inner` skills, an outer ring of the 9 `outer` skills (viewport-fraction coordinates).
  - `crystalStateAt(progress: number, i: number): { x, y, rotate, scale, opacity }` — a **pure function of the section's scroll progress (0→1)** and the crystal index: clustered before the detonation threshold, bursting along a seeded arc through it, settled at the ring position after. Deterministic and reversible (same progress → same state).
  - `DETONATE_AT: number` — the scroll-progress threshold where the flash fires.
- **Tests (`forgeLayout.test.ts`):** `ringPositions().length === 17`; inner/outer split 8/9; at `progress = 0` all crystals are clustered (near each other); at `progress = 1` they equal `ringPositions()`; `crystalStateAt` is deterministic (same inputs → same output); finite values.

### 2.2 The stage — `ForgeStage` (replaces the static `SkillField` on capable desktops)
- `#skills` is a **tall section** (e.g. `h-[260vh]`) with a `sticky top-0 h-screen` inner stage — the React-safe "dwell" that holds the crystals on-screen while you scroll, **without a pin**.
- A **single non-pinned `ScrollTrigger`** on `#skills` (`scrub`) whose `onUpdate` reads `self.progress` and applies `crystalStateAt(progress, i)` to each crystal via a `gsap.quickSetter` (transform/opacity). One trigger, no per-frame React, no pin.
- At `DETONATE_AT`, a CSS **flash + shockwave** element fires (opacity/scale pulse).
- HUD line: "THE FORGE · 17 elements" → "DEV STACK RECOVERED" after settle.
- **Interactivity gating:** crystals are clickable **only after settle** (`progress > DETONATE_AT` + small margin); before that they're mid-flight and inert. The sticky stage keeps the settled rings on screen long enough to inspect.

### 2.3 Crystal + inspect — focus + holo panel
- Each crystal is a real `<button>` (accessible name = `skill.name`) carrying the crystal cutout + Devicon `<i>` + label.
- Clicking a settled crystal sets `focusedId`:
  - that crystal animates to **center + scales up** (a transform override on top of its ring transform),
  - sibling crystals **dim** (reduced opacity),
  - a **`ForgeHoloPanel`** renders the detail: `skill.name`, `skill.category`, `skill.blurb`, a **level meter** from `skill.level` (1–5), and **"used in" chips** mapping `skill.usedIn` (project ids) → project titles, award-aware (🏆 for TrackPoint).
  - Esc / click-away / clicking the focused crystal again clears focus (crystal returns to its ring slot, field un-dims).
- Keyboard: Tab to crystals, Enter/Space focuses, Esc closes. Focus returns to the crystal on close.

### 2.4 Fallback (mobile / reduced-motion)
- The scene does not run there: render the **existing static `SkillField` grid** (Core/Extended), unchanged, as the universal readable baseline — but wired so **tapping a crystal opens the same `ForgeHoloPanel`** (centered card + panel below). No sticky, no scrub, no flash.
- Gated via a dedicated `cinematicOn('forge')` toggle (added to the motion config) so the Forge can be tuned/killed independently of the section accents.

---

## 3. Projects — black-hole modal transition (Phase 3b)

- A thin transition layer around the **existing** `ProjectModal` (its focus-trap / Esc / restore stay intact).
- On card click: the `black-hole-portal-cutout` (a fixed overlay) scales `0.2 → 2.2` and fades in over ~300–400ms centered on/over the clicked card; when it peaks, `ProjectModal` mounts. On close: the black-hole reverses, then the modal unmounts; focus returns to the card.
- **Reduced-motion / mobile:** skip the black-hole — the modal opens/closes with the current plain fade/scale (already implemented).

---

## 4. React-safety, performance, accessibility

- **React-safe:** no ScrollTrigger `pin`; the Forge "hold" is CSS `sticky`; the black-hole is a fixed overlay; focus is React state. All GSAP work in `gsap.context` reverted on cleanup.
- **Performance:** crystals animate via `transform`/`opacity` only, driven by one scrubbed timeline (no per-frame React state); the flash and black-hole are single fixed elements; pause/skip the scrub work under the gate; cap to the 17 crystals.
- **Accessibility:** crystals and project cards are real buttons; the holo panel content is real selectable DOM; decorative imgs `alt="" aria-hidden`; modal + panel are keyboard/Esc operable with focus restore; reduced-motion shows the static grid + plain modal with all content reachable.

---

## 5. Internal phasing + testing

- **Phase 3a — Skills Forge:** `forgeLayout` (+ tests), `ForgeStage` (sticky scrubbed crystals-as-meteor + flash), the focus interaction + `ForgeHoloPanel`, and the static-grid fallback wired to the same panel. First shippable slice.
- **Phase 3b — Projects black-hole:** the black-hole transition around `ProjectModal`.

Each gets its own writing-plans plan; the first plan covers **3a**.

**Verification:** `forgeLayout` unit tests; `tsc`/`vitest`/build clean; live desktop walkthrough (cluster → scrubbed detonation → settled rings, **reversible**; crystal count === `SKILLS.length` (17); click a crystal → center + dim + holo panel with correct blurb/level/project chips; Esc/away closes); live mobile + reduced-motion (static grid, tap → panel, no scrub/flash, content readable); keyboard operates crystals; no `insertBefore` crash (confirms no accidental pin); Lighthouse perf holds.

---

## 6. Scope boundaries (YAGNI)

- **In, Phase 3:** the Forge crystals-as-meteor + focus/holo inspect (3a) and the Projects black-hole modal transition (3b), plus their fallbacks.
- **Out:** mascot pose states, the reskinned chatbot, dead-CSS/dep cleanup (Phase 4/5); any new portfolio data (the `Skill` fields already exist); a separate faked-scatter mobile layer (the existing static grid is the fallback).

---

## 7. Open decisions (resolve during implementation)

1. Exact `DETONATE_AT` threshold, ring radii, and seeded burst arcs (tuned live for a readable, non-occluding settle).
2. Holo-panel placement (beside vs. below the centered crystal) responsively.
3. Whether a click on the meteor can also trigger an early detonation (bonus, not required).
4. The interactive-dwell length (the tall `#skills` height) so the settled rings stay on-screen long enough to inspect comfortably.
