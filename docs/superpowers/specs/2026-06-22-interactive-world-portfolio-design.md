# Interactive World Portfolio — Design Spec

**Date:** 2026-06-22
**Topic:** Turn the portfolio into one continuous, hands-on 3D world where every section is a real-time interactive object.
**Status:** Approved in brainstorming; first implementation scoped to the *Skills* vertical slice.

---

## Context — why this change

The `v2` branch already has a cinematic **voyage** (a passive 3rd-person probe the camera follows through space). The owner wants to go further: stop *watching* and start *playing*. The spark — *"smash a planet and the fragments are each my tech stack"* — generalizes to a thesis:

> Every section, and every element, is a live 3D object that morphs and reacts on hover and scroll. The visitor doesn't read a portfolio; they take it apart with their hands.

Goal: maximally immersive and eye-catching, **without** sacrificing the portfolio's actual job — getting Low Chee Fei hired. That means it must still be readable, performant, mobile-friendly, and accessible. The flat 2D section components (`About`, `Experience`, `HoloSkills`, etc.) are **replaced** by new in-world experiences; the low-level R3F plumbing (Canvas, camera rig, scroll bridge, theme colors, world-event bus) is **reused**.

---

## The core concept — "One Living World"

One unbroken 3D cosmos. **Scroll is a continuous descent** through it. There are six regions; you never cut between scenes — the matter and light from each region physically carries you into the next, so it never jumps in space or tone. Each region is a different *phenomenon in the same universe*, with its own signature interaction:

| # | Section | Region | Signature verb | Reveals |
|---|---------|--------|----------------|---------|
| 00 | Hero | First Contact | **signal-lock** (tune the dormant star in) | Name assembles letter-by-letter; "Software Developer · bridging mobile & enterprise" |
| 01 | About | Origin | **assemble** (fragments magnetise into a core) | CS grad, Swinburne 2025; the human line |
| 02 | **Skills** | **The Forge** | **shatter** (smash a planet → 17 shards) | 17 tech shards; grab one → its details — **VERTICAL SLICE, BUILD FIRST** |
| 03 | Experience | The Beacon | **ignite** (light a dead beacon) | ERP Consultant Intern, ONE ERP Solutions; "NEXT MISSION: LOADING…" |
| 04 | Projects | The Vault | **crack open** (rotate & crack crystal geodes) | TrackPoint 🏆 · Cinemate · Splash Aquatics |
| 05 | Contact | The Signal | **launch** (charge & fire a signal back out) | Message form; "TRANSMISSION SENT"; relays |

Continuity thread: a locked **signal** (Hero) pulls matter into your origin **core** (About); the core ruptures into the skill **shards** (Skills); the brightest shard becomes a **beacon** you ignite (Experience); its light catches crystal **worlds** you crack open (Projects); you gather their light into one **signal** and launch it back, closing the loop (Contact).

---

## Design language

- **Art direction — "Observatory + Iridescent" hybrid.** Dark deep-space void is the *stage* (keeps it premium and keeps text legible); the *interactive objects* — shards, crystals, beacon — are **iridescent / refractive** (prismatic cyan→violet→gold). The wow lives on the things you touch.
  - Stage: void `#070B14`, signal cyan `#00E5FF`, award amber `#FFB347`, text `#E8EDF5`, muted `#5A6A8A` (the existing palette / `useThemeColors`). Light theme stays the "clean lab" inversion.
  - Objects: conic prismatic gradient, additive bloom, refraction where cheap.
- **Content model — hybrid, diegetic.** Headlines/labels live in 3D; detail content appears as **orbital holo-fragments** — when you focus an object, its data (name, category, one-line blurb, project it was used in, signal-strength bar) floats *around* it on an orbit ring, not in a rectangular card. **Never a restyled box.**
- **Motion contract.**
  - *Scroll = the spine, and it's guaranteed.* A visitor who only scrolls sees the entire cinematic (arrive → smash → carry forward). Scroll is **reversible** — scrolling back up re-assembles what you broke.
  - *Mouse = optional play.* Hover blooms, drag throws, click inspects. Explorers get a toy; skimmers lose nothing.
- **Typography** (already in project): Space Grotesk (display), JetBrains Mono (readouts/terminal), Inter (body).

---

## Architecture — how it fits the codebase

Reuse the existing R3F foundation; add a physics layer and a repeatable region pattern.

- **Reused:** single `<Canvas>` / `SceneRoot`, `CameraRig`, `src/scene/scroll.ts` (mutable-ref scroll→render bridge, `progress` + per-section `sections.*`), `src/scene/worldEvents.ts` (DOM↔3D event bus), `useThemeColors`, the lazy-load + `SceneFallback` + `sceneCrashed` degrade path in `App.tsx`.
- **New dependency:** `@react-three/rapier` (rigid-body physics for the shards). Lazy-loaded with the scene. Gated **off** on mobile/reduced-motion in favour of a faked scatter (see fallback).
- **Region pattern (the unit of work).** Each region is a self-contained module with: (a) its hero object(s); (b) a **scroll-mapped beat timeline** driven by `sections.<name>` progress; (c) an interaction layer (pointer events → world-event bus); (d) holo-content via drei `<Html>` (real DOM, so it's accessible) and/or sprite labels. Regions stream in/out as the camera approaches, so only nearby regions pay render cost.
- **Camera / the probe.** The visitor is now the active agent, so the visible probe is **retired** (or demoted to a faint cursor-anchored reticle); the camera itself performs the continuous descent. *Final call deferred to implementation* — see Open Decisions.
- **Data.** Enrich the `Skill` type in `src/types.ts` with `category: string` (e.g. "Mobile · Language"), `blurb: string`, `usedIn: string[]` (project ids), `level: 1|2|3|4|5`; populate all 17 in `src/constants.ts`. `constants.ts` stays the single source of truth and also feeds the chatbot `SYSTEM_INSTRUCTION`, so the bot gets smarter for free.

---

## Vertical slice — Skills: "The Forge" (build this first)

The one region we make *perfect* before replicating the pattern.

**Scroll beats (continuous flow, no pin):**
1. **Enter** — camera reaches a pulsing iridescent planet. HUD: "THE FORGE · 17 elements detected."
2. **Cracks grow** — bright light-cracks spread, scrubbed by scroll (fully reversible so far).
3. **DETONATE** — crossing a scroll threshold fires a flash + shockwave; the crust bursts into **17 crystal shards** (one per skill).
4. **Zero-G drift / play** — shards settle into a contained zero-g field and gently collide.
5. **Inspect** — focusing a shard floats it forward; its orbital holo-fragments appear.
6. **Carry forward** — continued scroll streaks the shards toward the amber Experience beacon. No cut.
   *Reverse:* scrolling up re-magnetises the shards back into the planet (mirrors the About "assemble" verb).

**Objects:** iridescent planet (pre-smash) → 17 labelled shards (post-smash), shard label = skill name.

**Physics (desktop):** Rapier rigid bodies inside an **invisible bounded volume** (shards never leave frame). Detonation applies an outward impulse; light damping yields slow zero-g; collisions are gentle. Pointer: hover → bloom + sharpen label and dim neighbours; drag → throw (apply impulse); click → focus (shard eases to front, slow spin) and show orbital fragments: **name · category · one-line blurb · project chip (e.g. 🏆 TrackPoint) · signal-strength bar (from `level`)**. Click-away or scroll → return to drift.

**Content:** the 17 enriched skills — HTML5, CSS3, JavaScript, Python, Java, C++, C#, SQL (inner) · Figma, Tailwind CSS, PostgreSQL, Firebase, Kotlin, Flutter, Android, Git, VS Code (outer). Example links: Kotlin/Firebase/Android → TrackPoint; Python/JavaScript → Cinemate & Splash Aquatics; SQL/PostgreSQL → Splash Aquatics.

**Fallback (mobile / `prefers-reduced-motion`):** no Rapier. Shards are a pre-animated scatter keyed directly to scroll (the full cinematic still plays); tap a shard → holo fragments; no free throwing. This is the *primary* experience on phones and must be first-class, not an afterthought.

---

## The other five regions (future sub-projects)

Sketched here only for world coherence; **each gets its own spec → plan → build cycle later**, following the region pattern: Hero **signal-lock**, About **magnetise-assemble**, Experience **beacon-ignite**, Projects **crystal-geode-crack** (with Cinemate's live sentiment mini-demo inside its geode), Contact **charge-launch**. Do **not** build these in the first cycle.

---

## Performance, accessibility, degradation

- **Perf:** lazy scene; DPR cap; instanced shards; suspend a region's physics/render when offscreen; bounded bodies; no postprocessing required (additive bloom only where cheap).
- **Accessibility:** holo content renders as **real DOM via drei `<Html>`** (selectable, screen-reader reachable). Provide a plain non-3D skills list as the reduced-motion/no-WebGL fallback. Respect `prefers-reduced-motion` globally (already handled centrally).
- **Recruiter fast-path:** a visible "skip the cinematic" affordance; résumé download and Contact reachable immediately; correct OG/meta tags so shared links preview well.
- **Degradation:** WebGL context loss → existing `SceneFallback` + `sceneCrashed` guard. Rapier load/init failure → fall through to the faked scatter. Never a blank screen.

---

## Testing / verification

- `npx tsc --noEmit` clean.
- `npm run dev`, then walk the Forge region: smash triggers at the threshold; **shard count === `SKILLS.length` (17)**; labels correct; hover/drag/click all work; orbital fragments show enriched data (blurb, project chip, level bar); scroll-back re-assembles.
- Emulate `prefers-reduced-motion` and a mobile viewport (chrome-devtools): verify the faked-scatter cinematic plays, tap-to-inspect works, no physics, no jank.
- Lighthouse pass for a perf budget; confirm contact/résumé reachable with the scene disabled.

---

## Scope boundaries (YAGNI)

- **In, v1:** the shared world foundation (art direction, region pattern, scroll/physics contract, skill-data enrichment) **+ the Forge vertical slice only**.
- **Out, v1:** the other five regions; sound design; semantic skill-relationship graph.
- One region, done perfectly, beats six half-built. Replicate only after the Forge is shipped and felt.

---

## Open decisions (resolve during implementation)

1. **Retire the voyage probe?** Leaning yes (the visitor is now the actor, not a passenger) — but confirm against how the descent camera reads without it.
2. **Skill `level` values** — set per skill honestly with the owner; signal-strength bars must not over- or under-claim.
3. **Detonation trigger feel** — exact scroll threshold and whether a click can *also* trigger it early (bonus, not required).
