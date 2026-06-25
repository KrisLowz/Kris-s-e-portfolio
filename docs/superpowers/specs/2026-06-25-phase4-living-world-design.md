# Phase 4 — Living World (Mascot, Finale) — Design Spec

**Date:** 2026-06-25
**Status:** Phase 4a shipped on `v2`. **Phase 4b (cat-comms chatbot) — CANCELLED 2026-06-26** at the owner's request ("remove the chatbot, I don't need chatbot"). The chatbot is dropped from the product entirely; its teardown remnants (`@google/genai` dep, `src/content/chatbot.ts`, the Gemini `vite.config.ts` wiring) have been purged. §3 below is retained only as a record of the cancelled scope.
**Parent:** `docs/superpowers/specs/2026-06-24-cosmic-cyberpunk-voyage-redesign-design.md` (§9 Phase 4; §10 — note the chatbot decision there is now superseded by this cancellation).
**Beat reference:** `docs/2026-06-24-cosmic-cyberpunk-interaction-spec.md` (mascot state map, signal beam, ending) and `docs/2026-06-23-cosmic-cyberpunk-scroll-storyline.md` (the cat-pilot story).
**Builds on:** Phases 0–3 on `v2` (readable voyage → cinematic motion layer → interactive Forge + project portals). The spaceship travel between sections already shipped in Phase 2a.

---

## 1. Context — what Phase 4 adds

Phase 4 is the "living world" character + finale layer:

1. **The cat pilot becomes visible and reactive.** A single mascot sprite rides with the flying ship and changes "mood" per act.
2. **The voyage gets a payoff.** Submitting the contact form fires a signal beam (mascot celebrates); reaching the end departs the ship into a star-trail.
3. ~~**The comms channel returns.** The AI chatbot — removed at teardown — is rebuilt as a floating cat-comms assistant.~~ **CANCELLED** — the chatbot is dropped from the product (see Status above).

**Locked decisions (from brainstorming):**
- **Mood-cat rides the ship.** One mascot sprite (no per-pose art — `cyber-cat-mascot-cutout.png`; the turnaround is reference only) follows the ship and expresses each act's `mascotState` via GSAP transform "moods" (motion moods, not redrawn poses), with a small `PILOT · <state>` status line.
- **React-safe.** Transforms + React state + click/scroll-scrubbed (non-pinned) timelines; **no ScrollTrigger `pin`** (the Phase-2a lesson).
- ~~**Internal phasing: 4a (living-world finale) then 4b (cat-comms chatbot).**~~ Only **4a** was built; **4b is cancelled**.
- ~~**Chatbot persona:** professional / recruiter-accurate with a thin cat-comms voice.~~ (Moot — chatbot dropped.)

**Not in Phase 4:** multi-pose mascot art (future), the Phase-5 cleanup (dead CSS / unused deps / accumulated Minor notes). No new portfolio data.

---

## 2. Phase 4a — Living-world finale

### 2.1 `MascotPilot` (rides the ship)
- **Where:** added to `StoryWorldLayer` alongside `ShipFlight`.
- **How:** a cat sprite (`WORLD_ASSETS.mascot`) follows the ship's path — driven by the **same `SHIP_PATH`** waypoints (Phase 2a) with a small fixed offset so it rides alongside — using one non-pinned scrubbed `ScrollTrigger`/timeline (mirrors `useShipFlight`).
- **Mood:** the **current act** is detected from scroll as the `SECTION_ACTS` section nearest the viewport centre (a small "active act" helper). The act's `STORY_ACTS[act].mascotState` selects a looping GSAP "mood" on the mascot sprite: e.g. `wave` → tilt-bob, `scan` → slow lean, `aim` → crouch + a shake at the Forge detonation, `relay` → quick taps, `goodbye` → wave loop. A small `PILOT · <state>` mono HUD line near the mascot.
- **Gate / fallback:** `cinematicOn('mascot')` (new toggle). Off (mobile / reduced-motion) → a single static cat parked near the ship's static position; no travel, no mood loops.
- Perf: one scrubbed timeline for travel; the mood loop is `paused:true` and only plays for the on-screen act; transform/opacity only; `gsap.context` reverted.

### 2.2 `SignalBeam` (Contact submit)
- On **successful** form submit in `RelayConsole`, a beam element fires from the submit/relay area up-and-out (one-shot GSAP timeline: scaleY/length + opacity, transform/opacity only) and the mascot plays a `celebrate` mood; then the existing success message shows.
- Gate / fallback: under reduced-motion / mobile, skip the beam + celebrate — the current success text appears immediately.

### 2.3 Ending finale (extend `VoyageCompleteFooter`)
- When the footer enters view (a non-pinned scrubbed/triggered reveal), the **ship departs** (scale down + drift off toward a corner), the **mascot waves goodbye** then fades, and the signal beam (if just fired) resolves into a thin star-trail. The footer links clip-up as today.
- Gate / fallback: reduced-motion / mobile → the current static footer (already shipped), no departure animation.

---

## 3. Phase 4b — Reskinned cat-comms chatbot — ❌ CANCELLED

> **This section was never built and will not be.** Cancelled 2026-06-26 at the owner's request. Retained verbatim only as a record of the scope that was dropped. There is no chatbot, no `geminiService`, no `@google/genai` dependency, and no Gemini key wiring anywhere in the codebase.

- **Rebuild** the floating chat widget + a `geminiService` (both deleted at teardown) under `src/components/story/` and `src/services/`:
  - `geminiService.ts` — calls Gemini (`gemini-2.5-flash` via `@google/genai`, still a dependency) **client-side**, with the system prompt from `src/content/chatbot.ts` (lightly recast to the cat-comms voice while keeping every fact). Reads the key from `process.env.GEMINI_API_KEY` (Vite inlines it).
  - `CommsAssistant.tsx` (under `src/components/story/comms/`) — a floating launcher + panel, cosmic-cyberpunk styled, keyboard-operable, with a thin cat-pilot framing ("Comms · ask the pilot").
- **Graceful degradation:** with no `GEMINI_API_KEY`, the widget still opens and shows a friendly "comms offline — reach Low Chee Fei via the relay/email" fallback instead of erroring. Everything else on the page works regardless.
- **Accessibility:** the launcher and send control are real buttons; the panel is keyboard reachable; messages are real text; respects reduced-motion (no decorative motion required to use it).
- Mount as a floating widget in `App.tsx` (does not depend on the scroll layer).

---

## 4. React-safety, performance, accessibility

- No ScrollTrigger `pin` anywhere; mascot travel is a scrubbed (non-pinned) timeline like the ship; the signal beam + ending are click/trigger-driven one-shots.
- Animate `transform`/`opacity`/`filter` only; all GSAP in `gsap.context` reverted on unmount; reuse `gsap` from `register`; no second Lenis/rAF.
- Every cinematic system gated via `cinematicOn(...)`; off-modes show static/plain equivalents with all content readable; loops pause offscreen.

---

## 5. Internal phasing + testing

- **Phase 4a — living-world finale:** `MascotPilot` (+ `mascot` toggle + active-act detection), `SignalBeam` on contact submit, and the ending departure choreography. **Shipped.**
- ~~**Phase 4b — cat-comms chatbot.**~~ **Cancelled** (see §3).

**Verification (4a):** `tsc`/`vitest`/build clean; live desktop walkthrough (mascot rides the ship and its mood/PILOT line changes per act; contact submit → beam + celebrate + success; ending → ship departs + mascot waves; **no `insertBefore` crash** = no accidental pin; `ScrollTrigger.getAll().filter(t=>t.pin).length === 0`); live mobile + reduced-motion (static cat, plain success, plain footer).

---

## 6. Scope boundaries (YAGNI)

- **In, Phase 4:** the mood-cat mascot (4a), the signal beam + ending finale (4a), plus their fallbacks.
- **Out:** the cat-comms chatbot (4b — cancelled, no chatbot in the product); multi-pose mascot art; sound; the Phase-5 cleanup (dead CSS, unused deps, accumulated Minor notes); any new portfolio data.

---

## 7. Open decisions (resolve during implementation)

1. Exact mascot ride-offset from the ship and the per-mood transform curves.
2. How "active act" is detected from scroll (nearest `SECTION_ACTS` by section midpoint vs. a small threshold table) — pick the simplest that reads correctly.
3. Signal-beam direction/length and whether it originates at the button or the relay dish.
4. ~~How far to recast the chatbot persona toward "cat"~~ — moot; chatbot cancelled.
