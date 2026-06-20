# Technical Spec: Persistent react-three-fiber "Cosmic World" Background + Immersive Section Restyle

**Status:** Approved creative direction (Part A); technical spec for review.
**Date:** 2026-06-20
**Owner:** Low Chee Fei (KrisLowz)

## Locked product decisions (design around these)

- **Goal:** a "wow" creative showcase; desktop-first; MUST degrade gracefully on mobile / reduced-motion / no-WebGL.
- **Code-based 3D** via react-three-fiber + three (NO external 3D model assets — shaders/particles/primitive geometry only).
- **ONE persistent WebGL scene.** Scrolling flies the camera around/into a central glowing energy **core** with orbiting particle rings + network nodes + a meteor/star field. Section waypoints: Hero → About → Skills → Experience → Projects → Contact.
- **Replace** the existing decorative DOM layers (`FogBackground`, `MeshBackground`, `WireframeGlobe`, `MeteorShower`) with the scene. **Keep** interactive foreground (`CustomCursor`, `GhostCursors`, `MagneticButton`, `ReactionButton`, `AIChatBot`, `Navigation`, `ScrollProgressBar`, `SectionHoverGlow`, `ScrollRippleEffect`).
- **Reuse the existing Lenis** smooth-scroll as the single scroll source (NO drei `ScrollControls`). Reuse the existing GSAP reveal engine (`data-anim`) for foreground content.
- **Preserve dual light/dark theming;** the scene palette adapts (dark = deep space, light = dawn nebula).
- **Restyle content sections** for a more immersive full-bleed feel while keeping the copy/data from `constants.ts`.

---

## 1. Overview

Replace the four ambient decorative DOM layers (`FogBackground`, `MeshBackground`, `WireframeGlobe`, `MeteorShower`) with **one persistent react-three-fiber `<Canvas>`** mounted as a fixed, full-viewport, `pointer-events:none` layer at `z-index:-50` — the deepest paint layer of the site. The scene is a single continuous WebGL world: a central glowing energy **core**, orbiting **particle rings**, **network nodes**, and a **meteor/star field**. Scrolling does not animate sections in isolation — it **flies one camera** along a `CatmullRomCurve3` past section "waypoints" (Hero → About → Skills → Experience → Projects → Contact), where the scene reconfigures (nodes become the tech stack, the orbit unwinds into a timeline, monoliths show project images).

The camera is driven by the **existing Lenis + GSAP ScrollTrigger** scroll pipeline (no `drei <ScrollControls>`), read per-frame via a mutable ref so React never re-renders on scroll. All existing interactive foreground is preserved, sitting above the canvas in the existing z-index band (1…10000). Content sections are restyled full-bleed and translucent so the world shows through, but all copy/data still flows from `constants.ts`. The scene re-themes (dark = deep space, light = dawn nebula) by reading the same CSS custom properties the rest of the site uses, observed via a `MutationObserver` on `<html>`.

Everything is gated behind the existing `CONFIG.reducedMotion` / `CONFIG.isMobile` model and degrades to a CSS-gradient fallback on no-WebGL / reduced-motion / low-power. The entire three/R3F tree is `React.lazy` code-split so it never blocks first paint.

## 2. Goals & Non-goals

### Goals
- One persistent, theme-aware WebGL scene behind the entire page, holding ~60fps on desktop.
- Scroll-driven camera "journey" with six section waypoints, frame-synced to the existing Lenis/GSAP scroll (single scroll authority).
- Two-way 3D↔DOM links on Skills (hover) and Projects (hover/click → opens existing `ProjectModal`).
- Graceful, tested degradation: reduced-motion, mobile, no-WebGL, low-power, tab-hidden, offscreen.
- Restyle content sections to full-bleed immersive while preserving all `constants.ts` copy/data and existing `data-anim` reveal hooks.
- Code-split the 3D bundle; preserve current fast first paint and Lighthouse scores.

### Non-goals
- No external 3D model assets (`.glb`/`.gltf`) — shaders, particles, and primitive geometry only. Project images (existing PNGs in `public/assets/`) are the only textures.
- No `drei <ScrollControls>`/`useScroll` (conflicts with Lenis — see §5/§12).
- No second scroll listener or second GSAP/ScrollTrigger registration.
- No rewrite of the `constants.ts` data model beyond **adding** a consolidated `SKILLS` array (the Skills journey needs stable ids; today skills are hardcoded id-less inline arrays in `About.tsx`/`ProfessionalSkills.tsx`).
- No WebGPU/TSL compute path (not needed at 10–30k particles).
- No removal of `GhostCursors` (distinct "live presence" feature — KEEP).

## 3. Architecture

### 3.1 New module layout (`src/scene/*`)
```
src/scene/
  CosmicCanvas.tsx        # default export, React.lazy target. Owns <Canvas>, Suspense, EffectComposer.
  SceneRoot.tsx           # in-canvas scene graph: composes all 3D units; reads theme + scroll refs.
  CameraRig.tsx           # the flight camera: CatmullRomCurve3 + useFrame damping along scroll progress.
  objects/
    CoreObject.tsx        # central glowing energy core (shader sphere, HDR emissive, toneMapped=false).
    ParticleField.tsx     # 10–30k GPU point starfield/meteor dust (single <points> + ShaderMaterial).
    OrbitRings.tsx        # orbiting particle rings around the core (instanced/points on circular paths).
    SkillNodes.tsx        # network nodes that map to SKILLS; raycast hover <-> DOM chips.
    ExperiencePath.tsx    # nodes laid along the flight path (one per EXPERIENCE role) + connecting Line.
    ProjectMonoliths.tsx  # curved panels showing project images; raycast hover/click -> ProjectModal.
    MeteorField.tsx       # periodic meteor streaks (Trail) crossing the view.
  shaders/
    core.vert.ts core.frag.ts
    particles.vert.ts particles.frag.ts
  hooks/
    useScrollProgress.ts  # subscribes to Lenis/ScrollTrigger; returns refs (global + per-section).
    useThemeColors.ts     # reads CSS vars -> THREE.Color set; MutationObserver on <html>.
    useSceneVisibility.ts # IntersectionObserver + Page Visibility -> frameloop 'always'|'never'.
  SceneFallback.tsx       # CSS-gradient/poster DOM layer for no-WebGL / reduced-motion / low-power.
  sceneData.ts            # maps constants.ts (SKILLS/EXPERIENCE/PROJECTS) -> typed scene props + node layout.
  capability.ts           # detectWebGL(), isLowPower(), shouldRenderScene() -> single boolean gate.
  worldEvents.ts          # CustomEvent bus helpers: world:focus / world:blur / project:open.
  config.ts               # scene-only tunables (counts, camera waypoints, damping, bloom params).
```

A new toggle `scene3d: boolean` is added to `CONFIG.toggles` in `src/animations/config.ts` so the scene can be centrally disabled like every other effect (mirrors the existing toggle pattern).

### 3.2 How the Canvas mounts in App.tsx
`src/App.tsx` currently renders the four decorative layers. **Delete those four imports and JSX lines.** Mount the scene as the **first visual child** of `<main>` (the existing `relative` stacking-context root), wrapped in a fixed negative-z container:

```tsx
// App.tsx
const Scene = React.lazy(() => import('./scene/CosmicCanvas'));
// ...
<main className="relative min-h-screen ... cursor-none">
  <SceneFallback />                  {/* always-rendered DOM gradient; covered by canvas when it mounts */}
  {shouldRenderScene() && (
    <Suspense fallback={null}>
      <div className="fixed inset-0 -z-50 pointer-events-none" aria-hidden="true">
        <Scene />
      </div>
    </Suspense>
  )}
  <Preloader />
  <CustomCursor /> ...               {/* everything else unchanged */}
```

Key constraints (grounded in the layering findings):
- Wrapper is a **plain fixed div, `-z-50`, `pointer-events-none`, `aria-hidden`** — no `transform`/`filter`/`opacity<1`/`will-change` on it or any ancestor, or it creates a stacking context that lifts the canvas above content.
- `shouldRenderScene()` (from `capability.ts`) gates mount: WebGL present AND not `CONFIG.reducedMotion` AND not low-power. When false, only `<SceneFallback />` shows.
- Mount happens inside `<main>`, so the canvas lives in the same `data-theme` subtree and React tree as `useSiteAnimations()` — simplest theme/lifecycle coupling.
- Mount the lazy scene **after first paint** so LCP/TTI aren't blocked by WebGL init. `SceneFallback` covers the viewport until the canvas paints (prevents a blank flash).

### 3.3 How it reads Lenis scroll progress + per-section progress
The scene **never** owns a scroll surface. A new file `src/animations/scroll.ts` exposes progress via mutable module refs, populated by ScrollTriggers created inside the **existing `gsap.context`** in `useSiteAnimations()` so StrictMode revert tears them down cleanly:

```ts
// scroll.ts
const progress = { value: 0 };                              // global 0..1
const sections: Record<string, number> = {                  // per-section 0..1
  hero:0, about:0, skills:0, experience:0, projects:0, contact:0 };

export function initScrollProgress() {
  ScrollTrigger.create({ start: 0, end: 'max',
    onUpdate: self => { progress.value = self.progress; } }); // nav.ts idiom
  ([['about','#about'],['skills','#skills'],['experience','#experience'],
    ['projects','#projects'],['contact','#contact']] as const)
    .forEach(([key, sel]) => ScrollTrigger.create({
      trigger: sel, start: 'top bottom', end: 'bottom top', scrub: true,
      onUpdate: self => { sections[key] = self.progress; } }));
}
export const getScrollProgress = () => progress;
export const getSectionProgress = () => sections;
```
Hook `useScrollProgress.ts` returns these refs (NOT React state). `CameraRig` reads `progress.value` and the per-section values inside `useFrame` and damps the camera. Under `CONFIG.reducedMotion`, `getLenis()` is null and no scrub triggers exist — the hook falls back to a static pose. `initScrollProgress()` is called from `useSiteAnimations()` **before** `ScrollTrigger.refresh()`.

> Grounding: `nav.ts` already uses the `start:0,end:'max',onUpdate` idiom; Lenis smooths native scroll so the fixed canvas stays safe; read progress via ref + `invalidate()`, never `useState`.

### 3.4 How it reads theme
No React theme context exists; `ThemeToggle.tsx` is the sole writer and mutates `<html data-theme>` + `.dark` class + `localStorage('theme')`. `useThemeColors.ts`:
1. Seeds from `localStorage('theme')` (avoids one-frame light flash in dark mode), falling back to the resolved `data-theme` attribute.
2. Reads concrete colors via `getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()` → `new THREE.Color(value)` (resolved inside an effect, after mount).
3. Subscribes with `MutationObserver` on `document.documentElement`, `{ attributes:true, attributeFilter:['data-theme','class'] }`; on change, recompute the color set into a ref.
4. Materials read the color ref and **lerp** (`color.lerp(target, t)` in `useFrame`) over ~300ms to match the site's `0.3s` CSS theme transition.

Token parsing gotchas: `--globe-color`/`--fog-color` are `rgba()` (strip alpha for `THREE.Color`); `--spotlight-rgb` is a bare `r, g, b` triplet (wrap in `rgb(...)`).

## 4. Unit breakdown (one purpose each)

| Unit | File | Single purpose |
|---|---|---|
| **CosmicCanvas** | `CosmicCanvas.tsx` | Lazy entry: render `<Canvas dpr={[1,2]} frameloop performance={{min:0.5}}>`, `<PerformanceMonitor>`, `<Suspense>`, `<EffectComposer><Bloom/></EffectComposer>`, mount `<SceneRoot/>`. Owns DPR/adaptive/visibility wiring. |
| **SceneRoot** | `SceneRoot.tsx` | Compose the scene graph; pull theme colors + scroll refs once and pass down. |
| **CameraRig** | `CameraRig.tsx` | The only camera mover. `CatmullRomCurve3` (useMemo) of 6 waypoints; `useFrame` damps `t` toward `getScrollProgress()`, sets `camera.position` from `curve.getPointAt(t)`, `lookAt(curve.getPointAt(t+0.04))`. |
| **useScrollProgress** | `hooks/useScrollProgress.ts` | Surface global + per-section progress refs; reduced-motion fallback. |
| **CoreObject** | `objects/CoreObject.tsx` | Central glowing core: shader sphere, HDR emissive, `toneMapped={false}`, animated via single `uTime` uniform. Blooms. |
| **ParticleField** | `objects/ParticleField.tsx` | 10–30k static-buffer GPU points. One `<points>` + custom `<shaderMaterial>`, `AdditiveBlending`, `depthWrite=false`, vertex-shader motion via `uTime`. |
| **OrbitRings** | `objects/OrbitRings.tsx` | Particle rings orbiting the core. |
| **SkillNodes** | `objects/SkillNodes.tsx` | `<Instances>`/`<Instance>` nodes positioned from `SKILLS`; raycast hover dispatches `world:focus{type:'skill',id}`; listens for DOM hover to highlight its partner node. |
| **ExperiencePath** | `objects/ExperiencePath.tsx` | One node per `EXPERIENCE` role along the flight path + connecting `<Line>`; graceful single-item handling. |
| **ProjectMonoliths** | `objects/ProjectMonoliths.tsx` | Curved panels textured with `project.image` via `useTexture`; raycast click dispatches `project:open{id}`. |
| **MeteorField** | `objects/MeteorField.tsx` | Periodic meteor streaks via drei `<Trail>`; theme-colored. |
| **useThemeColors** | `hooks/useThemeColors.ts` | CSS-var → `THREE.Color` set + MutationObserver; returns a ref materials lerp toward. |
| **useSceneVisibility** | `hooks/useSceneVisibility.ts` | IntersectionObserver + Page Visibility → `frameloop` 'always'/'never'. |
| **SceneFallback** | `SceneFallback.tsx` | DOM CSS-gradient/poster layer (theme-aware), shown when gated off and as the under-canvas backdrop. |
| **capability** | `capability.ts` | `detectWebGL()`, `isLowPower()`, `shouldRenderScene()`. |
| **sceneData** | `sceneData.ts` | Pure mapping `constants.ts` → node positions, labels, texture URLs, waypoint metadata. |
| **worldEvents** | `worldEvents.ts` | Typed wrappers for `world:focus`/`world:blur`/`project:open` CustomEvents. |

## 5. Data flow (constants.ts → scene props)

```
constants.ts ─► sceneData.ts ─► SceneRoot (props) ─► objects/*
  SKILLS[]       → node layout {id,name,position,iconHint} → SkillNodes  (NEW array)
  EXPERIENCE[]   → waypoint nodes {id,role,position}       → ExperiencePath
  PROJECTS[]     → monolith faces {id,title,image}          → ProjectMonoliths
  PROFILE        → contact "arrival" copy (DOM only)
```

**SKILLS consolidation (required, additive):** add `Skill` type to `types.ts` (`{ id:string; name:string; iconClass:string; kind:'tech'|'soft'; desc?:string }`) and a `SKILLS: Skill[]` array to `constants.ts` with stable ids (e.g. `skill-kotlin`). Refactor `About.tsx` orbit and `ProfessionalSkills.tsx` cards to render from it, so each DOM chip and its 3D node share one id. `EXPERIENCE` currently has one active item (a second is commented out) — `ExperiencePath` must render gracefully with one node. `PROJECTS` already has stable `id` + `image` and is scene-ready.

Textures: `useTexture('/assets/TrackPoint.png')` etc. — absolute root paths only (existing files in `public/assets/`). Set `tex.colorSpace = THREE.SRGBColorSpace` and `tex.anisotropy`. Preload behind `<Suspense>`.

## 6. The cosmic journey (per section: camera + scene behavior)

Camera waypoints are 6 control points on the `CatmullRomCurve3`; `t` maps to global scroll progress. Per-section progress drives local reconfiguration. Damp `t` with exponential smoothing (`k = 1 - Math.exp(-rate*delta)`).

| Section | Camera | Scene behavior |
|---|---|---|
| **Hero** | Wide establishing shot; core centered, far back, slow drift. | Core pulses gently; full starfield + orbit rings visible. |
| **About** | Drifts in and slightly around the core (parallax with cursor). | Rings rotate; particles part slightly as camera nears; warm-up glow. |
| **Skills** | Settles among the orbiting ring; nodes face camera. | Orbit nodes become `SkillNodes`. Hover a DOM chip → node highlights; hover a node → chip highlights. Bi-directional via events. |
| **Experience** | Orbit "unwinds" — camera flies along the path through space. | `SkillNodes` disperse; `ExperiencePath` nodes light up sequentially as the camera passes, connected by a glowing `<Line>`. |
| **Projects** | Approaches floating monoliths/portals. | `ProjectMonoliths` show `project.image` on curved surfaces; hovered monolith brightens; **click → `project:open{id}` → existing `ProjectModal`**. |
| **Contact** | Pulls back; particles converge toward core. | Warm "arrival" — bloom intensifies, palette warms, particles gather. |

## 7. Interaction model

- **Cursor parallax:** global `pointermove` listener writes a normalized `{x,y}` to a ref; `CameraRig` adds a small damped offset. Canvas stays `pointer-events:none`.
- **Hover links (Skills):** raycast from the global pointer ref against the active section's nodes (only when Skills in view). DOM→3D: chips get `data-skill-id`; on `mouseenter` dispatch `world:focus{type:'skill',id}`; node highlights. 3D→DOM: raycast hit dispatches the same event; chip highlights via listener. Decoupled from React state.
- **Click (Projects):** raycast on `pointerup` while Projects in view → `project:open{id}`. `ProjectsShowcase` listens and calls its existing `openDetailModal(project)`. Card click and monolith click share one path into `ProjectModal`.
- DOM hooks to add: `data-skill-id` (`About.tsx`, `ProfessionalSkills.tsx`), `data-exp-id` (`Experience.tsx`), `data-project-id` (`ProjectsShowcase.tsx`).

## 8. Performance strategy

- **DPR clamp:** `<Canvas dpr={[1,2]}>` — never raw `devicePixelRatio`.
- **Adaptive quality:** drei `<PerformanceMonitor onChange flipflops={3} onFallback>` + `<AdaptiveDpr pixelated/>` + `<AdaptiveEvents/>`. On decline, **disable bloom first**, then drop DPR; restore on incline.
- **frameloop:** `'always'` while visible (continuous motion can't use `'demand'`). `useSceneVisibility` flips to `'never'` offscreen (IntersectionObserver) or tab-hidden (Page Visibility). `invalidate()` once on resume.
- **GPU-only particles:** positions uploaded **once** to a static `bufferAttribute`; animate entirely in the vertex shader via one `uTime` uniform. Never mutate attribute arrays on CPU per frame. `AdditiveBlending` + `depthWrite={false}`.
- **Bloom:** plain `<Bloom mipmapBlur luminanceThreshold≈0.9–1.0>` — NOT `<SelectiveBloom>` (slower). Only core/rings/meteors glow via `toneMapped={false}` + HDR emissive (>1); particles/background stay in 0–1.
- **Code-split:** entire three/R3F/drei/postprocessing tree behind `React.lazy` + `<Suspense>`; optionally `manualChunks` the three vendor.
- **Hygiene:** reuse geometries/materials; `dispose()` everything on unmount (three doesn't GC GPU resources); single `<points>` = 1 draw call. Target 10–30k particles desktop; mobile renders the fallback.

## 9. Fallback & accessibility

- **Gate before mount:** `shouldRenderScene()` = WebGL present AND not `prefers-reduced-motion` AND not low-power. False → only `<SceneFallback/>`.
- **Reduced-motion** is a first-class branch: no `<Canvas>`, no rAF; static gradient. Listen for `matchMedia` change to update live.
- **No-WebGL / context loss:** off-DOM `getContext` detection; `webglcontextlost`/`webglcontextrestored` handlers; unrecoverable loss → `SceneFallback`.
- **No init flash:** `SceneFallback` always renders behind the canvas wrapper.
- **A11y:** canvas wrapper `aria-hidden`, non-focusable; all content stays real DOM — screen-reader/keyboard journeys identical with or without WebGL.
- **Lazy mount** after first paint.
- Optional user-facing "reduce effects" toggle persisted to `localStorage` (mirrors `ThemeToggle`).

## 10. Theming

Single source of truth = CSS vars in `style.css`. Scene roles map:
- **Dark (deep space):** background `--bg-primary #020617`; core/ring emissive `--accent-primary #818cf8` / `--accent-secondary #a78bfa`; particle/meteor glow `--meteor-color #22d3ee`; nebula tint from `--blob-1/2/3`.
- **Light (dawn nebula):** background `--bg-primary #f8fafc`; accents `--accent-primary #4f46e5` / `--accent-secondary #8b5cf6`; particles `--meteor-color #6366f1`; pastel nebula.

`useThemeColors` lerps materials over ~300ms on theme change. Because `toneMapped={false}` bypasses tone mapping, **bloom HDR emissive colors must be chosen per theme** (light needs lower emissive intensity to avoid blowout). `SceneFallback` gradient defined in `style.css` in both blocks.

## 11. Dependencies to add (pinned, verified June 2026)

```jsonc
// dependencies
"@react-three/fiber": "^9.6.1",          // React 19 line; peer react ">=19 <19.3" (project is 19.2 ✓)
"@react-three/drei": "^10.7.7",          // peers react ^19, fiber ^9, three >=0.159
"@react-three/postprocessing": "^3.0.4", // peers fiber ^9, react ^19; bundles postprocessing 6.39.x
"three": "~0.184.0",                     // TILDE, not caret — postprocessing 6.39.1 caps three <0.185.0
// devDependencies
"@types/three": "^0.184.1"               // must track three minor exactly
```
Do **not** bump React to 19.3+ (violates fiber peer) or three to 0.185+ (breaks postprocessing) until those widen. Run `npx tsc --noEmit` after install. Note: CLAUDE.md's "CDN globals" claim is **partly stale** — gsap/lenis already resolve from npm via Vite; add three the same npm way. (Tailwind/Typed.js/Devicon remain CDN per index.html.)

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `drei <ScrollControls>` fights Lenis (double-scroll/desync) | Don't use it. Drive camera from shared Lenis/ScrollTrigger progress ref. |
| Reading progress via `useState` re-renders every frame | Read via mutable ref in `useFrame`; only `invalidate()` per scroll tick. |
| New ScrollTriggers leak on StrictMode double-mount | Create inside the existing `gsap.context`; `ctx.revert()` tears them down. |
| Importing gsap from `'gsap'` not `register.ts` | Always import from `src/animations/register.ts` (single synced instance). |
| three 0.185+ breaks postprocessing | Pin `three` with tilde `~0.184.0`. |
| Bloom too heavy / nothing glows | Plain Bloom + `toneMapped={false}` HDR core; `luminanceThreshold≈0.9–1.0`; disable bloom first under decline. |
| Deleting `MeshBackground` leaves blank flash | `SceneFallback` gradient always behind the canvas. |
| Scene doesn't re-theme | `useThemeColors` MutationObserver on `<html>`; lerp materials. |
| WebGL loop regresses mobile/low-power | Gate via `shouldRenderScene()`; fallback DOM instead. |
| Canvas wrapper transform/filter creates stacking context | Plain fixed div, negative z, no transform/filter/opacity/will-change. |
| Skills data id-less/duplicated | Consolidate `SKILLS` array with ids first; key nodes+chips by id. |
| Single EXPERIENCE entry → empty "journey" | `ExperiencePath` renders gracefully with one node; recommend adding entries. |
| Canvas pointer events break CustomCursor/tilt | Keep `pointer-events:none`; raycast from global pointer ref. |
| VRAM leak across StrictMode mount/unmount | `dispose()` all GPU resources on unmount; watch `renderer.info.memory`. |
| Bundle weight regresses first paint | `React.lazy` + dynamic import; mount after first paint. |
| `@types/three` mismatch → spurious TS errors | Track installed three minor (0.184.x) exactly. |

## 13. Phased build plan (each phase independently shippable)

### Phase 1 — Foundation: deps, lazy canvas, gating, fallback
**Goal:** Stand up an empty, code-split, theme-aware WebGL canvas behind the page that degrades correctly, with the four old decorative layers removed — no scroll/scene content yet.
- Add pinned deps; `npx tsc --noEmit` passes.
- `src/scene/capability.ts` + `src/scene/SceneFallback.tsx` (theme-aware gradient in `style.css` light+dark blocks).
- `src/scene/CosmicCanvas.tsx`: React.lazy default export, `<Canvas dpr={[1,2]} performance={{min:0.5}}>` with empty `<SceneRoot/>` + a visible test mesh; `aria-hidden`, `pointer-events:none`, `-z-50` fixed wrapper.
- `App.tsx`: delete the 4 decorative layers; mount `<SceneFallback/>` + Suspense-wrapped gated `<Scene/>`; add `scene3d` toggle to `CONFIG.toggles`.
- Verify: scene on desktop, fallback under reduced-motion/no-WebGL/mobile; foreground overlays work; no "too many WebGL contexts" under StrictMode.

### Phase 2 — Scroll-driven camera rig
**Goal:** Fly one camera along a curve driven by the existing Lenis/GSAP scroll, six waypoints, frame-synced and reduced-motion-safe.
- `src/animations/scroll.ts`: `initScrollProgress()` (global start:0/end:max + per-section scrub triggers); `getScrollProgress()`/`getSectionProgress()` refs; booted inside `useSiteAnimations()` gsap.context.
- `src/scene/hooks/useScrollProgress.ts` (refs, not state); reduced-motion fallback.
- `src/scene/CameraRig.tsx`: CatmullRomCurve3 of 6 waypoints; useFrame damping; cursor-parallax offset.
- `src/scene/config.ts` waypoints + damping.
- Verify: scrolling flies camera smoothly; reveals + camera stay synced; no second scroll listener; StrictMode leaves no leaked triggers.

### Phase 3 — Core, particle field, bloom, theming
**Goal:** Render the visual heart — glowing core, GPU particle/star field, orbit rings, meteors — with selective bloom and live theming.
- `CoreObject` + `shaders/core.*`; `ParticleField` + `shaders/particles.*`; `OrbitRings`; `MeteorField` (Trail).
- EffectComposer + plain Bloom in CosmicCanvas; only core/rings/meteors `toneMapped=false` HDR.
- `useThemeColors` (CSS-var→THREE.Color + MutationObserver; ~300ms lerp; per-theme emissive).
- Verify: core glows; ~60fps desktop; theme toggle crossfades scene; no light-mode blowout.

### Phase 4 — Skill nodes + bi-directional DOM links
**Goal:** At Skills, orbit nodes become the tech stack, hover-linked both ways to DOM chips, with a consolidated data source.
- `types.ts` `Skill` type; `constants.ts` `SKILLS[]` with ids; refactor `About.tsx`/`ProfessionalSkills.tsx` to render from it with `data-skill-id`.
- `sceneData.ts` mapping; `SkillNodes` via Instances.
- `worldEvents.ts`; DOM→3D dispatch on chip hover; 3D→DOM raycast dispatch; chips highlight via listener.
- Verify: hover chip ↔ node both ways; no canvas pointer-events; reduced-motion unaffected.

### Phase 5 — Experience path + Project monoliths + modal wiring
**Goal:** Unwind orbit into a timeline flight, then approach project monoliths whose clicks open the existing `ProjectModal`.
- `ExperiencePath` (one node/role + Line; graceful single-item); `data-exp-id`.
- `ProjectMonoliths` (curved panels, `useTexture('/assets/...')` SRGB+anisotropy; raycast hover/click).
- Wire click→`project:open{id}`: `ProjectsShowcase` listens → `openDetailModal`; `data-project-id`; shared path into `ProjectModal`.
- Verify: camera passes lit timeline; monoliths show images; click opens correct modal; textures preload.

### Phase 6 — Immersive section restyle
**Goal:** Restyle sections full-bleed and translucent so the world shows through, preserving all `constants.ts` copy and reveal hooks.
- Move section `max-w-*` to inner column; translucent/glass section + card backgrounds.
- Keep all `data-anim`/`data-tint`/`data-hero` hooks; tune `data-tint` to scene palette; Contact "arrival" styling.
- Verify: copy/data unchanged; reveals fire; text contrast accessible over moving background in both themes.

### Phase 7 — Performance & accessibility hardening
**Goal:** Make the scene jank-free and battery-friendly; verify graceful degradation end-to-end.
- PerformanceMonitor (DPR scaling, flipflops, onFallback) + AdaptiveDpr + AdaptiveEvents; bloom disabled-first on decline.
- `useSceneVisibility`; `webglcontextlost/restored` → SceneFallback; `dispose()` all GPU on unmount.
- Optional user-facing "reduce effects" toggle (localStorage).
- Verify: Lighthouse first-paint/LCP not regressed; 60fps desktop; GPU idles offscreen/hidden; no VRAM growth across StrictMode remounts; reduced-motion/no-WebGL/mobile render fallback.

## 14. Open questions — proposed defaults (override at review)

1. **GhostCursors:** KEEP (distinct "live presence" feature). *Default: keep.*
2. **Restyle aggressiveness (§6/Phase 6):** translucent **glass panels with backdrop-blur that stay readable** — world visible behind content but text always legible (vs. fully transparent, which risks contrast). *Default: glass-but-readable.* — **wants user taste input.**
3. **EXPERIENCE entries:** only one active role today. *Default: render a single node intentionally, and recommend you add/uncomment real roles so the "timeline flight" has multiple waypoints.* — **needs your content.**
4. **Particle count / bloom:** *Default: start ~20k particles + moderate bloom, tune via PerformanceMonitor; allow up to ~50k gated.*
5. **Manual "reduce effects" toggle in v1:** *Default: include it in Phase 7 (cheap, good UX).* 
6. **Skills nodes source:** *Default: a separate node set that fades in at the Skills waypoint (robust); morphing directly from OrbitRings particles is a stretch goal.*
