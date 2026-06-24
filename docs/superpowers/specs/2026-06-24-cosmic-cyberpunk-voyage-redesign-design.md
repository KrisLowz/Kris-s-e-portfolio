# Cosmic Cyberpunk Portfolio Voyage — Redesign Design Spec

**Date:** 2026-06-24
**Status:** Approved in brainstorming; ready for implementation planning (writing-plans).
**Supersedes:** the v2 `interactive-world-portfolio` direction and its predecessors
(`docs/superpowers/specs/2026-06-20-cosmic-portfolio-3d-design.md`,
`docs/superpowers/specs/2026-06-20-voyage-storyline-design.md`,
`docs/superpowers/specs/2026-06-22-interactive-world-portfolio-design.md`).
Those R3F-voyage / Forge specs and their plans become historical and are not built.

**Source docs (adopted, not repeated here):**
- `docs/2026-06-23-cosmic-cyberpunk-scroll-storyline.md` — the full movie-script story flow.
- `docs/2026-06-24-cosmic-cyberpunk-interaction-spec.md` — per-scene components, scroll triggers, timelines, fallbacks. **This is the beat-level reference; the present spec is the architectural umbrella over it.**
- `docs/2026-06-23-cosmic-cyberpunk-portfolio-asset-plan.md` — asset direction.
- `docs/2026-06-23-generated-world-assets.md` — the generated asset inventory.
- `docs/2026-06-23-scroll-driven-realtime-motion-reference.md` — generic motion patterns checklist.

---

## 1. Context — why this redesign

The owner wants to discard the current portfolio's design and layout entirely and rebuild
it as a **scroll-driven cinematic**: a cute cyberpunk cat pilots a small spaceship through a
cosmic universe, and each scroll section is one act of the journey (boot → hero → origin →
skills → experience → projects → contact → ending). The site should feel like a silent
animated short film controlled by scroll — while still doing its real job: getting Low Chee
Fei hired (readable, performant, mobile-friendly, accessible).

Two decisions were locked during brainstorming:

1. **Full teardown.** Rebuild from a near-empty `App.tsx`. Keep only the toolchain
   (Vite + Tailwind + TypeScript), the **factual portfolio content** (real name, projects,
   experience, skills), and the generated **`/assets/world/` art**. Every component, the
   motion engine, theming, and data modules are rebuilt fresh.
2. **DOM-cutout + GSAP rendering (no 3D engine in v1).** Every scene is layered transparent
   PNG-cutout `<img>` sprites plus real HTML content, choreographed by GSAP/ScrollTrigger
   over Lenis smooth scroll. Lasers, particles, and the starfield are lightweight canvas-2D.
   3D-feeling moments (meteor break, portal warp, planet rotation) are achieved with 2D
   transforms, scale, and parallax. React Three Fiber is **not** used in v1; a canvas/WebGL
   backdrop may be added later as Phase-5 polish without re-architecting.

---

## 2. The vision (one paragraph)

The visitor is the camera; the cat is the pilot; the spaceship is the cursor through the
universe. A cold-open boot sequence hands off to a hero launch; the ship warps to an origin
world where the profile is scanned open; it enters an asteroid field and shatters a meteor
into skill crystals; it docks at a mission archive of experience logs; it flies a horizontal
route through project worlds it can open; it reaches a relay console to send a message; then
it departs into the starfield. Content stays short and readable in the main scroll; depth
lives behind clicks (crystal flip, project modal).

---

## 3. Tech foundation (rebuilt, lean)

- **Framework:** React 19 + TypeScript + Vite (kept). Tailwind CSS via PostCSS (kept).
- **Motion core (`src/motion/`):** Lenis (smooth scroll) + GSAP 3 + ScrollTrigger + SplitText,
  booted once inside a self-cleaning `gsap.context` from `App.tsx`.
  - `config.ts` — central tokens: named eases, durations, staggers, parallax intensities,
    plus resolved `reducedMotion` / `isTouch` / `isMobile` flags and per-system on/off toggles.
  - `engine.ts` — a small attribute-driven reveal layer re-derived from the proven v1 design:
    `data-anim="fade-up | fade-in | scale | pop | clip | clip-left | chars | words | lines | draw | draw-y"`,
    plus `data-stagger`, `data-speed` (parallax), `data-float`, `data-velocity`, `data-tint`.
    Reduced motion renders final states and wires nothing.
  - `scroll.ts` — exposes global + per-section scroll progress as mutable refs for scene timelines.
- **AI chatbot:** kept, re-skinned as the cat "comms assistant" floating widget; calls Gemini
  (`@google/genai`) client-side with a `SYSTEM_INSTRUCTION` fed from the content modules.
  Degrades gracefully without `GEMINI_API_KEY`.
- **Custom cursor:** spaceship-reticle on fine-pointer devices; default cursor hidden globally.

## 4. Data model (`src/content/`, typed by `src/types.ts`)

Single source of truth; also feeds the chatbot `SYSTEM_INSTRUCTION`.

- `PROFILE` — name, title, headline, supporting copy, email, location, status, CV path, socials.
- `ABOUT` — `packet` (label/value identity rows), `statement` (split bio lines), `traits[]`.
- `SKILLS` — each: `id`, `name`, `iconClass` (Devicon), `ring: 'inner' | 'outer'`,
  `category`, `blurb`, `usedIn: string[]` (project ids), `level: 1|2|3|4|5`.
  - Inner ring (8): HTML5, CSS3, JavaScript, Python, Java, C++, C#, SQL.
  - Outer ring (9): Figma, Tailwind CSS, PostgreSQL, Firebase, Kotlin, Flutter, Android, Git, VS Code.
  - **Total 17** (the meteor must break into exactly `SKILLS.length` crystals).
- `PROJECTS` — TrackPoint (🏆 award), Cinemate, Splash Aquatics; each with overview, challenge,
  solution, tech stack, screenshots, achievement, planet identity.
- `EXPERIENCE` — real records, plus one static origin record (2022 start) and one static
  open-to-work record (2025/now).
- `STORY_ACTS` — ordered act metadata: `id`, `label`, `mascotState`, `tint`, `transitionIn/out`.
- `WORLD_ASSETS` (`src/story/worldAssets.ts`) — the path map for all `/assets/world/` sprites.

## 5. App skeleton & layering

`App.tsx` composes, in order:

1. `StoryBootPreloader` — the cold-open boot scene (replaces a generic loader).
2. `StoryWorldLayer` — persistent sprites that travel **between** sections (spaceship, mascot,
   wormhole, black-hole). Prevents each section owning its own copy. Pointer-events disabled
   except for explicit interactive elements.
3. The eight scene sections in order (Hero … Ending).
4. `StoryHUD` + `SectionRouteProgress` — mini star-map nav: current act glows, route line
   draws with scroll, nodes scroll-to via Lenis.
5. Floating recruiter fast-path widgets (CV download, Contact) + the re-skinned chatbot.

**Z-index bands** (from the interaction spec): −50 backdrop · −20 global story sprites ·
0 section background assets · 10 section content · 40 nav/HUD · 80 transitions/portal · 100 modals.

## 6. The voyage — eight scenes

Beat sheets, ScrollTrigger configs, and timelines are defined in the interaction spec and
adopted verbatim. Summary:

| # | Scene | Component | Signature motion grammar | Primary interaction | Mobile / reduced-motion |
|---|-------|-----------|--------------------------|---------------------|-------------------------|
| 0 | Boot | `StoryBootPreloader` | HUD startup lines → cyan-white flash into Hero | — | not rendered; show Hero immediately |
| 1 | Hero Launch | `HeroLaunch` | `chars` name, ship drift, scroll-accelerate → wormhole exit | CTA buttons | no pin; static ship; `words` name |
| 2 | Origin Dossier | `OriginDossier` | scan-beam sweep + `clip-left` dossier decrypt; planet parallax | hover trait/scan | static planet; rows visible |
| 3 | Skill Meteor | `SkillMeteorScene` | pinned scrub: charge → laser → meteor break → crystals orbit | crystal click → zoom + flip detail | flip-card grid; no pin |
| 4 | Mission Archive | `MissionArchive` | dock + `draw-y` timeline + per-record decrypt | hover → node/beacon glow | static timeline |
| 5 | Project Worlds | `ProjectWorldRoute` | horizontal pinned portal route | portal click → black-hole → modal | vertical cards; simple modal |
| 6 | Relay Console | `RelayConsole` | console boot + signal-ring pulse | submit → dish rotate + signal beam + mascot celebrate | success text; no beam |
| 7 | Ending | `VoyageCompleteFooter` | ship departs, mascot waves, footer clip-up | — | static footer |

## 7. Component architecture (`src/components/story/`)

Adopt the interaction spec's tree. Global: `StoryWorldLayer`, `StoryHUD`,
`AnimatedSectionHeading`, `MascotPilot`, `SpaceshipSprite`, `WarpTransition`,
`SectionRouteProgress`. Per-scene folders: `about/` (OriginDossier, DossierRow, ScanBeam),
`skills/` (SkillMeteorScene, SkillCrystal, SkillCrystalDetail, LaserBeam, SkillOrbit),
`experience/` (MissionArchive, MissionRecord, ArchiveTimeline), `projects/`
(ProjectWorldRoute, ProjectPortalCard, ProjectPortalTransition, ProjectModal), `contact/`
(RelayConsole, SignalBeam). Each unit: one purpose, props-driven, content in real DOM.

## 8. Cross-cutting requirements

- **Accessibility:** every clickable sprite is a real `<button>`/`<a>`; decorative images use
  `alt="" aria-hidden="true"`; skill crystals and project portals derive accessible names from
  data; modals trap focus and restore it to the opener; Escape closes crystal detail and
  project modal; reduced motion shows all content without requiring scroll precision.
- **Performance:** cutouts are transformable `<img>` layers (not CSS backgrounds);
  `loading="lazy"` for below-fold sprites (not boot/hero); `will-change: transform, opacity`
  only on active animated layers; animate only `transform`/`opacity`/`filter`; pause ambient
  loops when a section leaves the viewport; mobile disables pinned long scenes + heavy particles.
- **Mobile:** no pinned horizontal scroll for core content; pinned scenes become static or
  short non-pinned intros; crystals/projects become tap cards.
- **Reduced motion:** boot skipped; scenes render final states; transitions become crossfades.
- **Recruiter fast-path:** a visible "skip the voyage" affordance; CV download and Contact
  reachable immediately; correct OG/meta so shared links preview well.
- **Degradation:** missing `GEMINI_API_KEY` → chatbot fallback message; everything else works.

## 9. Phased build roadmap

The redesign is decomposed into phases; **each phase gets its own writing-plans plan.** The
first implementation plan covers **Phase 0 + Phase 1** — the vertical slice that gets a
readable, on-theme site standing.

- **Phase 0 — Teardown + foundation.** Strip `App.tsx` to a shell; remove retired components;
  build the motion core (`config`/`engine`/`scroll`), cosmic theme tokens, `src/content/`
  data modules, `WORLD_ASSETS`, the layering skeleton (`StoryWorldLayer`, `StoryHUD`,
  `SectionRouteProgress`), the boot preloader, and the spaceship cursor.
- **Phase 1 — Readable static voyage.** All six content sections standing with
  `AnimatedSectionHeading` + static cutout layers and correct content. On-theme, accessible,
  recruiter-safe. **First shippable baseline.**
- **Phase 2 — Section timelines + `WarpTransition`.** Hero launch, Origin scan, Mission
  archive reveal, Relay console reveal; wormhole transitions between sections.
- **Phase 3 — Interactive scenes.** Skill meteor break + crystal click/flip detail; Project
  portal → black-hole modal transition.
- **Phase 4 — Living world.** Mascot pilot state choreography, spaceship travel between
  sections, ending scene + signal beam.
- **Phase 5 — Polish.** Mobile passes, reduced-motion fallbacks, perf/Lighthouse profiling,
  removal of any stale selectors; optional canvas/WebGL backdrop.

## 10. Resolved decisions

1. **AI chatbot:** KEEP, re-skinned as the cat comms assistant; `SYSTEM_INSTRUCTION` fed by content.
2. **Theme:** DARK-ONLY (cosmic). A light "clean lab" mode is deferred to a later cycle.
3. **Old social widgets (ReactionButton, GhostCursors, and other v1 decorative layers):** DROP.
4. **Mascot:** single cutout sprite animated via CSS/GSAP transforms in v1; multi-pose art is
   a future enhancement; `cyber-cat-turnaround-cutout.png` is a modeling reference only.

## 11. Testing / verification

- `npx tsc --noEmit` clean.
- `npm run dev`, then walk each act: boot → hero launch → origin scan → meteor break (crystal
  count === `SKILLS.length` (17); labels correct; click flips to detail with blurb/level/project
  chips) → mission archive → project portal modal (open/close, focus restore) → relay submit
  (success state) → ending. Confirm scroll-back reversibility on Hero and Skills.
- Emulate `prefers-reduced-motion` and a mobile viewport (chrome-devtools): boot skipped, no
  pins, tap-to-flip works, all content readable, no jank.
- Keyboard: crystals and project portals operable; Escape closes; focus restores to opener.
- Lighthouse meets a perf budget; CV + Contact reachable with motion disabled.

## 12. Scope boundaries (YAGNI)

- **In, v1:** the full eight-scene voyage built through Phases 0–5 as DOM-cutout + GSAP.
- **Out, v1:** React Three Fiber / WebGL scenes; multi-pose mascot art; light theme; sound
  design; the legacy Forge/R3F-voyage code (deleted, not ported).
- One phase shipped and felt before starting the next.

## 13. Open decisions (resolve during implementation)

1. Exact skill `level` values — set honestly with the owner so signal bars don't over/under-claim.
2. Detonation/meteor-break scroll threshold feel, and whether a click may trigger it early (bonus).
3. Whether the horizontal Projects route or a vertical fallback reads better on mid-size laptops.
