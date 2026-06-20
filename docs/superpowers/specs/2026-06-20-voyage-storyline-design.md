# Design Spec: "Signal from a Developer" — the Voyage

**Status:** Storyline + framing approved; technical spec for review.
**Date:** 2026-06-20
**Owner:** Low Chee Fei (KrisLowz)

## Concept

Turn the portfolio into a single continuous **narrative voyage**. A visible **probe**
sails through *Low's universe*; the camera **follows it (3rd-person)** in a slow,
**epic / cinematic** style. Scrolling drives the probe forward — each portfolio
section is a "world" the probe arrives at and a discovery is revealed. Content is
presented as **in-world holograms/scenes**, not text-on-cards.

Builds on the existing 3D scene (glowing core, particle field, camera flight path,
project monoliths, skill-stars, experience nodes). The current camera-on-path
becomes a **probe-on-path + follow-cam**. No external 3D model assets — the probe
is built from R3F geometry.

## The voyage (acts → existing sections)

| Act | Section | Scene (visual, scroll-driven) |
|---|---|---|
| 0 · Boot & Launch | Hero | Deep space; HUD boots, identity decrypts ("Low Chee Fei · Software Developer"); scroll **warps** the probe toward the core star. |
| 1 · Origin World | About | Probe arrives at a planet, fires a **scan beam**; holographic readouts bloom — Swinburne, award-winning, bridges mobile ⇄ enterprise. |
| 2 · Skill Nebula | Skills | Probe flies into the nebula of tech-stars; **chart the constellation** (hover/connect → stack + soft skills). |
| 3 · Trajectory | Experience | Probe follows a beacon path; passing each **ignites a beacon** → mission log (ERP Consultant…). |
| 4 · Project Worlds | Projects | Probe reaches a cluster of worlds; **orbit/dive into each portal** (TrackPoint, Cinemate, Splash Aquatics) → existing ProjectModal. |
| 5 · The Beacon | Contact | Probe reaches a comms relay; **send a signal** out into the cosmos (contact form). |

## Architecture

New/changed units (under `src/scene/`), each one purpose:

- **Probe.tsx** *(new)* — a stylized glowing craft from primitives (capsule/arrow + emissive + additive engine glow). Positioned each frame at `curve.getPointAt(t)` (t = damped scroll progress), oriented along the path tangent.
- **CameraRig.tsx** *(rework)* — follow-cam: camera sits at `probePos + offset` (behind/above), looks at the probe (slight lead). Damped for cinematic smoothness; cursor adds subtle sway. Replaces camera-on-path.
- **scroll.ts** — already exposes global + per-section progress; reused to drive the probe `t` and per-act reveals.
- **Per-act scene reveals** — extend existing objects: a **ScanBeam** + planet for Act 1; beacons = existing ExperiencePath nodes igniting on arrival; project worlds = existing ProjectMonoliths; the core = the Hero star.
- **Content-as-hologram** — the DOM sections (already frameless/luminous from the Living Constellation redesign) reveal **on the probe's arrival** at each world, scroll-pinned/scrubbed, so copy is readable and accessible while the scene plays behind.
- **Cinematic layer** — warp streaks at launch/transitions, engine trail, slow easing (CustomEase), arrival "slow-downs" (the probe decelerates at each world via the scroll mapping).

Scroll choreography: scroll = probe travel. Each world is a **pinned/scrubbed beat** (the journey holds while the arrival scene plays), via GSAP ScrollTrigger pin+scrub (proven by the Projects horizontal prototype). Reduced-motion / mobile → the probe rig is skipped and content shows statically (existing fallbacks).

## Phased build

- **A — Probe + follow-cam:** visible probe rides the path; camera follows 3rd-person; verify the cinematic feel. (Foundational.)
- **B — Cinematic pacing:** warp at launch, arrival decelerations, pinned act beats, CustomEase camera moves.
- **C — Per-act scene reveals:** Act 1 planet + scan beam, beacon ignitions, project-world arrivals, content holograms tied to arrival.
- **D — Polish:** engine trail, warp streaks, HUD boot, sound-off (optional).

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Follow-cam + Lenis pin jank | Reuse the proven pin+scrub pattern; damp the cam; verify per phase. |
| GPU load (probe + trail on integrated GPUs) | Keep the probe lightweight (primitives, no postprocessing dependency); honor the existing DPR-1 / no-bloom-fallback / context-loss degrade. |
| Readability of in-world hologram copy | Keep content as frameless DOM with glow-scrims (Living Constellation pattern); never bake copy into WebGL. |
| Scope (large) | Phase it; prototype A first and validate before B–D. |

## Non-goals
- No external 3D model files (probe is code geometry).
- No audio in v1 (optional later).
- No rewrite of content/data (constants.ts unchanged).
