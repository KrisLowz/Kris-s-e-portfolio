# Phase 2 — Cinematic Motion Layer — Design Spec

**Date:** 2026-06-24
**Status:** Approved in brainstorming; ready for implementation planning (writing-plans).
**Parent:** `docs/superpowers/specs/2026-06-24-cosmic-cyberpunk-voyage-redesign-design.md` (§9 Phase 2).
**Beat reference:** `docs/2026-06-24-cosmic-cyberpunk-interaction-spec.md` (per-scene timelines + `WarpTransition`).
**Builds on:** Phase 0+1 (commits `33988e6..0a55310` on `v2`) — the readable static voyage with the GSAP+Lenis motion engine and the `src/motion/scroll.ts` per-section progress bridge already in place.

---

## 1. Context — what Phase 2 adds

Phase 1 left every section readable with enter-based `data-anim` reveals, and `src/motion/scroll.ts` already exposes scrubbed global + per-section scroll progress (`getScrollProgress()`, `getSectionProgress()`) that **nothing consumes yet**. Phase 2 layers the cinematic motion on top:

1. A **persistent spaceship that flies a scroll-synced path** section-to-section.
2. A **pinned Hero launch** (desktop) that accelerates the ship and blooms a wormhole into About.
3. **Full-screen pinned wormhole warps** at major section boundaries.
4. **Per-section scrubbed timelines** for About, Experience, and Contact (planet parallax + scan, timeline draw, signal-ring pulse).

**Locked decisions (from brainstorming):**
- **Max cinematic:** pinned Hero + full-screen pinned warps (not just non-pinned scrubs).
- **Ship-travel is in this phase.** The full scroll-synced flight path ships now; **mascot pose states stay Phase 4.**
- Same stack as Phase 1: GSAP 3 + ScrollTrigger + Lenis, DOM cutouts, no React Three Fiber.

**Not in Phase 2** (later phases): the Skills meteor break + crystal flip, the Projects portal route + black-hole modal transition, mascot pose states, the reskinned chatbot, and the Phase-5 cleanup (dead CSS / unused deps). The ship *flies past* the still-static Skills and Projects sections; their interactive cinematics are Phase 3.

---

## 2. Architecture

Four new units, each with one responsibility and a well-defined interface.

### 2.1 `ShipFlight` — the scroll-driven spaceship
- **Where:** replaces the static `<img>` ship inside `StoryWorldLayer` (fixed layer, `z-[-20]`).
- **How:** a `useShipFlight()` hook builds **one** GSAP timeline scrubbed by a document-spanning ScrollTrigger (`start: 0, end: 'max', scrub`). The timeline moves the ship element through per-section keyframes.
- **Data:** a `SHIP_PATH` table (new, in `src/motion/shipPath.ts`) — an ordered list of waypoints keyed to `STORY_ACTS` ids, each `{ act, x, y, rotate, scale, thruster }` in viewport-relative units. One tunable table holds the entire flight; the timeline interpolates between waypoints across each act's scroll span.
- **Interface:** `useShipFlight(shipRef, thrusterRef?)`. Consumes `STORY_ACTS` + `SHIP_PATH`. Produces nothing (drives the ref transforms).
- **Fallback:** desktop + motion only. Mobile / reduced-motion → the ship parks at a static decorative position (current Phase-1 behaviour), hook is a no-op.

### 2.2 `WarpTransition` — reusable full-screen warp primitive
- **Where:** a fixed full-screen overlay layer (`z-[80]`, above content, below modals).
- **How:** renders the wormhole cutout; pinned at a boundary via its own ScrollTrigger on a short **spacer element** placed between two sections. Scrub: `scale 0.15→2.5`, `rotate -8→12deg`, `opacity 0→1→0`, `filter blur(8px)→0→blur(12px)`.
- **Interface:** `<WarpTransition id fromSection toSection />` (props identify the boundary + drive the trigger). Self-contained ScrollTrigger created/reverted in a `gsap.context`.
- **Fallback:** reduced-motion / mobile → no pin; the wormhole renders as a brief, non-pinned opacity crossfade at the boundary (never traps scroll), so content stays reachable.

### 2.3 `useSectionCinematic` — per-section scrubbed timelines
- Each of **Hero, About, Experience, Contact** gains a `useEffect` that builds a section-scoped, scrubbed ScrollTrigger timeline targeting its own elements via refs (not global selectors), inside a `gsap.context` scoped to the section root and reverted on unmount.
- This **layers onto** the existing `data-anim` reveals. Where they conflict (the Hero), the pinned scrub timeline owns those elements and the `data-anim` enter-reveals become the reduced-motion / no-pin fallback only.
- Skills and Projects get **no** new scrubbed timeline in Phase 2 (their cinematics are Phase 3); they keep Phase-1 reveals.

### 2.4 `HeroLaunch` pin
- `#hero` pins on desktop (`pin: true, scrub`, `anticipatePin: 1`), running the launch timeline: ship idle → accelerate; name (`chars`) + headline (`words`) + CTAs (`pop`) resolve; hero content scales back + fades; the wormhole blooms — **this bloom is the Hero→About warp** (so that boundary's warp is authored inside the hero pin rather than a separate spacer).
- Mobile / reduced-motion: no pin; the Phase-1 static reveals stand.

---

## 3. Per-section beats (adopted from the interaction spec)

| Section | Pinned? | Scrubbed cinematic |
|---------|---------|--------------------|
| **Hero** | Yes (desktop) | ship accelerates → name/headline/CTA resolve → hero content recedes → wormhole bloom into About |
| **About** | No | origin-planet parallax + scan-beam sweep + dossier rows decrypt as the section passes |
| **Experience** | No | timeline `draw-y` grows + records decrypt in sequence; open-to-work node pulses |
| **Contact** | No | console boot + signal-ring pulse loop behind the submit button |
| **Skills / Projects** | No | unchanged from Phase 1 (interactive cinematics are Phase 3) |

**Warp boundaries (2):** **Hero→About** (authored in the hero pin) and **Projects→Contact** (standalone `WarpTransition` on a spacer). Other boundaries remain light handoffs.

---

## 4. Reduced-motion, mobile, performance

- **Reduced-motion:** no pins, no scrub, no ship-flight; warps become crossfades; everything renders in its final, readable state (the Phase-1 baseline already guarantees this via `CONFIG.reducedMotion` + `showAllStatic`).
- **Mobile:** pins and ship-flight disabled; sections keep their enter-reveals; warps become quick crossfades. No pinned or horizontal scroll for core content.
- **Performance:** a single scrubbed master timeline drives the ship (no per-frame React state); animate only `transform`/`opacity`/`filter`; `anticipatePin` on pinned triggers; all ScrollTriggers/timelines created inside `gsap.context` and reverted on unmount (StrictMode-safe). Reuse the existing Lenis↔ScrollTrigger sync — do not add a second smooth-scroll or RAF loop.

---

## 5. Internal phasing (the implementation plan splits in two)

- **Phase 2a — flight + launch foundation:** `src/motion/shipPath.ts` (`SHIP_PATH`), `useShipFlight` + `ShipFlight` in `StoryWorldLayer`, the Hero pinned launch timeline, and the `WarpTransition` primitive with the Hero→About warp wired. First shippable slice — the ship flies and the hero launches.
- **Phase 2b — section cinematics + fallbacks:** the About/Experience/Contact scrubbed timelines, the Projects→Contact warp, and the full mobile / reduced-motion fallbacks + perf pass.

Each gets its own writing-plans plan; the first plan covers **2a**.

---

## 6. Testing / verification

- `npx tsc --noEmit` clean; `npx vitest run` passing (plus any new pure-logic tests, e.g. `SHIP_PATH` waypoint count === `STORY_ACTS` mapped sections, monotonic ordering).
- `npm run dev` live walkthrough: the ship flies the full scroll top-to-bottom along the path; the Hero pins then releases; the wormhole warp fires at Hero→About and Projects→Contact; About/Experience/Contact scrub their cinematics; **scrolling back up reverses everything** (scrub is reversible).
- Emulate `prefers-reduced-motion` and a 390px mobile viewport (chrome-devtools): no pins, no ship-flight, content fully readable, no trapped scroll, no horizontal overflow.
- Lighthouse perf budget holds; no dropped-frame jank on the pinned hero or warps on a mid-tier machine.

---

## 7. Scope boundaries (YAGNI)

- **In, Phase 2:** ship-flight system, Hero pin, two full-screen warps, three section scrubbed timelines, and their fallbacks.
- **Out:** mascot pose states (Phase 4), Skills meteor / crystal flip (Phase 3), Projects portal route + black-hole modal transition (Phase 3), chatbot (Phase 4), dead-CSS/dep cleanup (Phase 5), the missing CV PDF (owner action).

---

## 8. Open decisions (resolve during implementation)

1. Exact `SHIP_PATH` waypoint values (positions/rotations/scales per act) — tuned live for a smooth, readable flight that never occludes text.
2. Hero pin scroll length (how much scroll the pinned launch consumes) and the precise wormhole-bloom threshold.
3. Whether the Projects→Contact warp also subtly involves the ship (light touch) or is purely the wormhole overlay.
