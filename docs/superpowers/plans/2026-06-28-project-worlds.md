# Projects "Warp into Project Worlds" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Projects section as a scroll-driven 3D space scene where the ship cruises past three themed portals (one per project); clicking a portal warp-transitions into that project's focused "world" with an overview, challenge→solution, tech stack, an award beacon, and a 3D screenshot cover-flow carousel.

**Architecture:** A single self-contained `Projects.tsx` section that mirrors the existing `Experience.tsx` pattern — a GSAP-pinned 100svh stage that writes scroll progress to a ref, a dynamic-imported three.js scene that reads it, and a reduced-motion / no-WebGL static fallback. A small state machine switches between two modes — **cruise** (fly past portals) and **world** (focused project detail) — with a wormhole **warp** transition between them. Dense text lives in HTML "holo-panels" positioned over the canvas; 3D is reserved for the portals, warp, orbiting tech, award beacon, and the screenshot carousel.

**Tech Stack:** React 19 + TypeScript, three.js `^0.185.0` (dynamic import), GSAP ScrollTrigger (CDN global `window.gsap` / `window.ScrollTrigger`), Tailwind via CDN. No bundler-level type-check; Vite/esbuild only.

## Global Constraints

- **No test runner / linter exists.** Per-task verification = `npm run build` must print `✓ built` AND a described visual check in `npm run dev`. There are NO unit tests in this repo; do not invent a test framework.
- **three.js is dynamic-imported** (`await import('three')`); on import/WebGL/context-loss failure, `setFailed(true)` and render the static fallback. Mirror `Experience.tsx`.
- **Canvas is `pointer-events: none`** and sits above content (`z-10`); all interaction is via `window` `pointermove`/`pointerdown` listeners + raycast, gated to the canvas rect, skipping `e.target.closest('a, button, [data-exp-ui]')`. HTML overlays that must be clickable carry `data-exp-ui`.
- **Lifecycle hardening (copy from `Experience.tsx`):** `IntersectionObserver` + `visibilitychange` pause the RAF loop; `ResizeObserver` resizes renderer + camera; on unmount dispose every tracked geometry/material/texture, remove the canvas, `forceContextLoss()`, `renderer.dispose()`. Use the `track<T>()` helper.
- **Reduced motion** (`prefers-reduced-motion`) → render the static fallback, no pin, no canvas.
- **Palette:** dark space, same tokens as Experience — bg `#05030f`, panels `#0a0814`, accents cyan `#22D3EE` / magenta `#FF2BD6`; fonts `font-display` for headings.
- **Content source:** read from `PROFILE`/`PROJECTS` in `src/constants.ts` — do NOT hardcode project copy. This plan adds NO new project facts (it only presents existing data), so `PORTFOLIO_CONTENT.md` and `SYSTEM_INSTRUCTION` do not need updating; only section chrome strings ("Destinations // Projects", "Enter", "Exit") are new UI labels.
- **Per-project theme** (define in `Projects.tsx`, keyed by `project.id`): `trackpoint` → amber `0xf59e0b`; `cinemate` → violet `0x8b5cf6`; `splashaquatics` → teal `0x06b6d4`.
- **Mount** `<Projects />` after `<Experience />` in `src/App.tsx`.
- **Reuse, don't duplicate:** `buildShip`, `makeFlameTexture`, `makeGlowTexture`, `rimMaterial` are already exported from `Spaceship3D.tsx`. The backdrop helpers (`makeStarLayer`, `makeNebulaTexture`, `makePlanetTexture`, `makeStreakTexture`) live in `Experience.tsx` and must be exported there (Task 2) and imported into `Projects.tsx`.

---

## File Structure

- **Create:** `src/components/Projects.tsx` — the entire section: scroll-pin effect, 3D scene (cruise + world + carousel), HTML overlays, and static fallback. One file, consistent with `Experience.tsx`/`Spaceship3D.tsx`. Expected ~600–700 lines.
- **Modify:** `src/App.tsx` — import and render `<Projects />` after `<Experience />`.
- **Modify:** `src/components/Experience.tsx` — add `export` to the four backdrop helpers (`makeStarLayer`, `makeNebulaTexture`, `makePlanetTexture`, `makeStreakTexture`). Zero behaviour change.
- **Reference (read, do not edit):** `src/components/Experience.tsx:200-360` (scene/pin/dispose boilerplate to mirror), `src/components/Spaceship3D.tsx` (exported helpers), `src/constants.ts` (`PROJECTS` shape).

### Data mapping (`PROJECTS[i]` → UI)
| Field | Used by |
|---|---|
| `id` | theme accent lookup |
| `title`, `subtitle` | portal preview card + world header |
| `tags[]` | preview card chips |
| `description` | preview card body |
| `overview` | world Overview panel |
| `challenges[]` + `solutions[]` | world Challenge→Solution module (paired by index) |
| `techStackDetails[]` (`{category, tools[]}`) | world Tech module (orbiting chips, grouped) |
| `achievements[]` | world award beacon + achievements list |
| `screenshots[]` | world screenshot cover-flow carousel |
| `image` | portal preview thumbnail (optional) |

### State machine (in the RAF loop, via refs)
`modeRef: 'cruise' | 'warpIn' | 'world' | 'warpOut'`, `worldIdxRef: number` (which project, -1 in cruise), `warpT` (0..1 transition), `focusProgRef` (cruise progress captured at entry, for "scroll exits" parity with Experience).
- cruise: scroll drives the portal rail; nearest portal "active".
- click active portal → `warpIn` (warpT 0→1 over ~0.6 s, wormhole streak + camera dive) → `world`.
- world: cruise hidden/dimmed; project-world panels + carousel shown; Exit → `warpOut` (warpT 1→0) → `cruise`.

---

### Task 1: Section scaffold, mount, and static fallback

**Files:**
- Create: `src/components/Projects.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `export default Projects` (a `React.FC`). Reads `PROJECTS` from `../constants`. Defines `const THEME: Record<string, number> = { trackpoint: 0xf59e0b, cinemate: 0x8b5cf6, splashaquatics: 0x06b6d4 }`.

- [ ] **Step 1: Create the component with the pin effect, empty canvas mount, and the full static fallback.**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../constants';

declare global { interface Window { gsap: any; ScrollTrigger: any } }

const THEME: Record<string, number> = { trackpoint: 0xf59e0b, cinemate: 0x8b5cf6, splashaquatics: 0x06b6d4 };
const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

const Projects: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [failed, setFailed] = useState(false);
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // scroll pin (mirror Experience.tsx): scrub writes progress for the 3D scene
  useEffect(() => {
    if (reduced) return;
    const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current, start: 'top top',
        end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 2.4 : 3.2),
        scrub: 1, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self: any) => { progressRef.current = self.progress; },
      });
    }, trackRef);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced || failed) {
    return (
      <section id="projects" aria-labelledby="proj-heading" className="relative w-full bg-[#05030f] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
          <h2 id="proj-heading" className="mt-4 font-display text-4xl font-extrabold text-[#F5F3FF] sm:text-6xl">Worlds I&apos;ve built</h2>
          <div className="mt-12 space-y-16">
            {PROJECTS.map((p) => (
              <article key={p.id} className="rounded-3xl border border-white/10 bg-[#0a0814]/80 p-6 sm:p-8">
                <h3 className="font-display text-2xl font-extrabold text-[#F5F3FF]">{p.title}</h3>
                <p className="text-[#22D3EE]">{p.subtitle}</p>
                <p className="mt-3 text-[#A8A3C2]">{p.overview}</p>
                {p.achievements?.length ? (
                  <ul className="mt-4 space-y-1 text-sm text-[#dcd9ee]">{p.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                ) : null}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF2BD6]">Challenges</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#A8A3C2]">{p.challenges?.map((c) => <li key={c}>{c}</li>)}</ul></div>
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]">Solutions</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#A8A3C2]">{p.solutions?.map((s) => <li key={s}>{s}</li>)}</ul></div>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">{p.tags.map((t) => <li key={t} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]">{t}</li>)}</ul>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {p.screenshots.slice(0, 8).map((s) => <img key={s} src={s} alt="" loading="lazy" className="aspect-[9/16] w-full rounded-lg object-cover" />)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} id="projects" aria-labelledby="proj-heading" className="relative bg-[#05030f]">
      <div ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-[#05030f]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,#0a0a24_0%,#06051a_50%,#03020c_100%)]" />
        <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-16 sm:px-10 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
          <h2 id="proj-heading" className="mt-3 font-display text-4xl font-extrabold leading-tight text-[#F5F3FF] sm:text-6xl">Worlds I&apos;ve built</h2>
        </div>
        <ul className="sr-only">{PROJECTS.map((p) => <li key={p.id}><strong>{p.title}</strong>: {p.overview}</li>)}</ul>
      </div>
    </section>
  );
};

export default Projects;
```

- [ ] **Step 2: Mount it in `App.tsx`.**

In `src/App.tsx`, add `import Projects from './components/Projects';` after the Experience import, and `<Projects />` immediately after `<Experience />`.

- [ ] **Step 3: Build check.** Run: `npm run build` → Expected: `✓ built`.

- [ ] **Step 4: Visual check.** `npm run dev`; scroll to the bottom; confirm the "Destinations // Projects" heading appears over a dark space gradient (canvas empty for now). Toggle OS reduced-motion (or temporarily `const [reduced] = useState(true)`) and confirm the static fallback lists all 3 projects with challenges/solutions/tags/screenshot grid; revert.

- [ ] **Step 5: Commit.**
```bash
git add src/components/Projects.tsx src/App.tsx
git commit -m "feat(projects): section scaffold, scroll-pin, and static fallback"
```

---

### Task 2: Cruise — backdrop + ship + 3 portals on a scroll rail + preview cards

**Files:**
- Modify: `src/components/Experience.tsx` (export 4 backdrop helpers)
- Modify: `src/components/Projects.tsx` (add the 3D scene)

**Interfaces:**
- Consumes: `buildShip, makeFlameTexture, makeGlowTexture, rimMaterial` from `./Spaceship3D`; `makeStarLayer, makeNebulaTexture, makePlanetTexture, makeStreakTexture` from `./Experience`.
- Produces (inside the effect): `builtPortals: { group, ring, glow, idx, hit }[]`, `RAIL_A=4, RAIL_B=-(8*PROJECTS.length+4)`, `portalAt(i)=i*8`, the `track<T>()` disposer, `progressRef`-driven `rail.position.x`.

- [ ] **Step 1: Export the backdrop helpers from `Experience.tsx`.** Prepend `export ` to `function makeStarLayer`, `function makeStreakTexture`, `function makeNebulaTexture`, `function makePlanetTexture`. No other change.

- [ ] **Step 2: Build check.** Run: `npm run build` → Expected: `✓ built` (Experience unchanged at runtime).

- [ ] **Step 3: Add the 3D effect to `Projects.tsx`.** Insert a second `useEffect` (after the pin effect). Copy the scene/renderer/lights/`track`/IO/RO/visibility/dispose boilerplate verbatim from `Experience.tsx:205-235` and `:316-345` and `:560-580` (camera `PerspectiveCamera(42, w/h, 0.1, 100)` at `(0,1.3,10)` looking at origin). Then build the backdrop + ship + portals:

```tsx
// inside the async effect, after lights + track set up:
const flameTex = track(makeFlameTexture(THREE));
const glowTex = track(makeGlowTexture(THREE));

// backdrop (reuse): 3 star layers + nebula (lighter than Experience — projects are the focus)
const starDefs = [
  { n: 150, sx: 70, sy: 36, z0: -17, z1: -11, c: 0x8fa6ff, sz: 1.4, par: 0.02 },
  { n: 150, sx: 64, sy: 32, z0: -10, z1: -5, c: 0xbfe6ff, sz: 2.0, par: 0.05 },
  { n: 110, sx: 56, sy: 28, z0: -5, z1: -1.5, c: 0xeafcff, sz: 2.6, par: 0.09 },
];
const starLayers = starDefs.map((d) => { const L = makeStarLayer(THREE, isMobile ? Math.round(d.n * 0.6) : d.n, d.sx, d.sy, d.z0, d.z1, d.c, d.sz); track(L.geo); track(L.mat); scene.add(L.points); return { ...L, par: d.par }; });

// ship escorts bottom-left (reuse hero model)
const { ship, flames } = buildShip(THREE, isMobile, track, flameTex);
ship.scale.setScalar(0.7); scene.add(ship);
const SHIP_BASE = new THREE.Vector3(-3.6, -1.9, 2.6);

// portal rail
const STEP = 8;
const rail = new THREE.Group(); scene.add(rail);
const RAIL_A = 4, RAIL_B = -(STEP * PROJECTS.length + 4);
const builtPortals = PROJECTS.map((p, i) => {
  const accent = THEME[p.id] ?? 0x22d3ee;
  const g = new THREE.Group(); g.position.x = i * STEP;
  // segmented neon ring = torus + a thinner bright inner torus
  const ringMat = track(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 }));
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(1.4, 0.12, 16, 64)), ringMat); g.add(ring);
  const innerMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
  const inner = new THREE.Mesh(track(new THREE.TorusGeometry(1.18, 0.03, 12, 64)), innerMat); g.add(inner);
  // event-horizon disc (additive glow) that brightens when active
  const glowMat = track(new THREE.SpriteMaterial({ map: glowTex, color: accent, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
  const glow = new THREE.Sprite(glowMat); glow.scale.set(3.2, 3.2, 1); glow.position.z = -0.2; g.add(glow);
  rail.add(g);
  const hit = new THREE.Mesh(track(new THREE.SphereGeometry(1.5, 8, 8)), track(new THREE.MeshBasicMaterial({ visible: false }))); hit.position.x = i * STEP; rail.add(hit);
  return { group: g, ring, glow, glowMat, idx: i, hit, accent };
});
```

- [ ] **Step 4: Drive the cruise in the RAF tick** (mirror Experience's tick header — `dt`, `t`, `p = progressRef.current`):

```tsx
rail.position.x = RAIL_A + p * (RAIL_B - RAIL_A);
const railX = rail.position.x;
for (const L of starLayers) { L.mat.uniforms.uTime.value = t; L.points.position.x = -railX * L.par; }
ship.position.set(SHIP_BASE.x, SHIP_BASE.y + Math.sin(t * 1.4) * 0.12, SHIP_BASE.z);
ship.rotation.set(Math.sin(t * 0.9) * 0.05, 0, Math.sin(t * 1.1) * 0.06);
const flick = 0.8 + 0.2 * Math.sin(t * 26);
flames.forEach((fl: any, i: number) => { fl.scale.set(0.7 * flick, 0.5 * flick, 1); fl.material.opacity = 0.85; });
let activeIdx = -1, bestAbs = 3;
builtPortals.forEach((pt) => {
  const worldX = pt.idx * STEP + railX;
  const act = Math.max(0, 1 - Math.abs(worldX) / 3);
  if (Math.abs(worldX) < bestAbs) { bestAbs = Math.abs(worldX); activeIdx = act > 0.4 ? pt.idx : activeIdx; }
  pt.group.scale.setScalar(0.7 + act * 0.4);
  pt.group.rotation.z += dt * (0.2 + act * 0.5);
  pt.glowMat.opacity = 0.15 + act * 0.5;
  // preview card position (HTML, Task uses previewRefs[idx])
  const card = previewRefs.current[pt.idx];
  if (card) { pt.group.getWorldPosition(tmp).project(camera); card.style.left = (tmp.x * 0.5 + 0.5) * 100 + '%'; card.style.top = (1 - (tmp.y * 0.5 + 0.5)) * 100 + '%'; card.style.opacity = String(act); card.style.pointerEvents = act > 0.5 ? 'auto' : 'none'; }
});
renderer.render(scene, camera);
```

- [ ] **Step 5: Add HTML preview cards** (above the heading block in the returned JSX), one per project, positioned imperatively like Experience's panels:

```tsx
{PROJECTS.map((p, i) => (
  <div key={p.id} ref={(el) => (previewRefs.current[i] = el)} className="absolute z-20 w-64 -translate-x-1/2 -translate-y-[150%]" style={{ left: '50%', top: '50%', opacity: 0, pointerEvents: 'none' }}>
    <div data-exp-ui className="rounded-2xl border border-white/12 bg-[#0a0814]/90 p-4 text-center shadow-[0_16px_44px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <h3 className="font-display text-lg font-extrabold text-[#F5F3FF]">{p.title}</h3>
      <p className="text-sm text-[#22D3EE]">{p.subtitle}</p>
      <ul className="mt-2 flex flex-wrap justify-center gap-1.5">{p.tags.slice(0, 4).map((t) => <li key={t} className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-[#dcd9ee]">{t}</li>)}</ul>
      <button data-exp-ui className="proj-enter mt-3 rounded-full border border-[#22D3EE]/50 bg-[#22D3EE]/10 px-4 py-1.5 text-xs font-bold text-[#22D3EE]" data-idx={i}>▶ Enter</button>
    </div>
  </div>
))}
```
Add `const previewRefs = useRef<(HTMLDivElement|null)[]>([])` and `const tmp = new THREE.Vector3()` (the latter inside the effect).

- [ ] **Step 6: Build check.** Run: `npm run build` → Expected: `✓ built`.

- [ ] **Step 7: Visual check.** `npm run dev`, scroll into Projects: confirm a starfield + ship (bottom-left) + three tinted portals (amber/violet/teal) flowing right→left as you scroll, each spinning up and showing its preview card with an "Enter" button when centered.

- [ ] **Step 8: Commit.**
```bash
git add src/components/Experience.tsx src/components/Projects.tsx
git commit -m "feat(projects): portal cruise — backdrop, ship, 3 themed portals + preview cards"
```

---

### Task 3: Warp-in transition + Project World shell + exit

**Files:** Modify `src/components/Projects.tsx`

**Interfaces:**
- Produces: `modeRef = useRef<'cruise'|'warpIn'|'world'|'warpOut'>('cruise')`, `worldIdxRef = useRef(-1)`, `[worldIdx, setWorldIdx] = useState(-1)` (drives the HTML world panel), `enterWorld(i)`, `exitWorld()`, `warpT` (in-effect), a wormhole streak built from `makeStreakTexture`.

- [ ] **Step 1: Add mode state + enter/exit handlers (component scope).**
```tsx
const modeRef = useRef<'cruise' | 'warpIn' | 'world' | 'warpOut'>('cruise');
const worldIdxRef = useRef(-1);
const [worldIdx, setWorldIdx] = useState(-1);
const enterWorld = (i: number) => { worldIdxRef.current = i; modeRef.current = 'warpIn'; setWorldIdx(i); };
const exitWorld = () => { modeRef.current = 'warpOut'; setWorldIdx(-1); };
```

- [ ] **Step 2: Wire the click router (in the effect, mirror Experience's `onPointerDown`).** A click that hits an active portal's `hit` proxy while in `cruise` calls `enterWorld(idx)`; the HTML `▶ Enter` button (carries `data-exp-ui` + `data-idx`) also calls it via a React `onClick`. Skip when `modeRef.current !== 'cruise'`.
```tsx
const onPointerDown = (e: PointerEvent) => {
  const el = e.target as HTMLElement | null;
  if (el && el.closest('a, button, [data-exp-ui]')) return;
  if (modeRef.current !== 'cruise') return;
  const rect = canvas.getBoundingClientRect(); if (!rect.width) return;
  const fx = (e.clientX - rect.left) / rect.width, fy = (e.clientY - rect.top) / rect.height;
  if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;
  ndc.set(fx * 2 - 1, -(fy * 2 - 1)); raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(builtPortals.map((b) => b.hit), false)[0];
  if (hit) { const idx = builtPortals.findIndex((b) => b.hit === hit.object); const worldX = idx * STEP + rail.position.x; if (Math.abs(worldX) < 3) enterWorld(idx); }
};
window.addEventListener('pointerdown', onPointerDown);
```
Give the `▶ Enter` button a React `onClick={() => enterWorld(i)}` in the JSX from Task 2.

- [ ] **Step 3: Build the wormhole warp streak** (a stretched additive plane the camera dives through):
```tsx
const warpTex = track(makeStreakTexture(THREE));
const warpMat = track(new THREE.MeshBasicMaterial({ map: warpTex, color: 0x9be6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
const warpTunnel = new THREE.Mesh(track(new THREE.CylinderGeometry(0.2, 3.5, 14, 24, 1, true)), warpMat);
warpTunnel.rotation.x = Math.PI / 2; warpTunnel.visible = false; scene.add(warpTunnel);
let warpT = 0;
```

- [ ] **Step 4: Drive the mode machine in the tick** (replace the unconditional `renderer.render` from Task 2 with mode-aware logic). Cruise logic (Task 2) runs only when `mode==='cruise'` or transitions. Camera dives toward the active portal during `warpIn`:
```tsx
const mode = modeRef.current;
if (mode === 'warpIn') { warpT = Math.min(1, warpT + dt / 0.6); if (warpT >= 1) modeRef.current = 'world'; }
else if (mode === 'warpOut') { warpT = Math.max(0, warpT - dt / 0.5); if (warpT <= 0) { modeRef.current = 'cruise'; worldIdxRef.current = -1; } }
// warp visuals
warpTunnel.visible = warpT > 0.01; warpMat.opacity = Math.sin(Math.min(1, warpT) * Math.PI) * 0.8;
warpTunnel.position.z = 6 - warpT * 12; warpTunnel.rotation.y += dt * 6;
// camera: cruise base, pushed forward (into the portal) by warpT, settling in 'world'
const camZ = 10 - warpT * 7;          // dive in
camera.position.set(0, 1.3 - warpT * 0.6, camZ); camera.lookAt(0, 0, 0);
// hide cruise actors while in world
const inWorld = mode === 'world' || warpT > 0.5;
rail.visible = !inWorld; ship.visible = !inWorld;
```
Keep the cruise per-portal/preview/star updates guarded by `if (!inWorld) { ...Task 2 cruise block... }`.

- [ ] **Step 5: Add the Project World HTML shell** (rendered when `worldIdx >= 0`), with header, overview, tech chips, achievements, and an Exit button. Carousel comes in Task 4 (leave a placeholder div with `id="proj-carousel-slot"`).
```tsx
{worldIdx >= 0 && (() => { const p = PROJECTS[worldIdx]; const accent = hex(THEME[p.id] ?? 0x22d3ee); return (
  <div data-exp-ui className="absolute inset-0 z-30 overflow-y-auto px-6 py-16 sm:px-12">
    <div className="mx-auto max-w-3xl">
      <button data-exp-ui onClick={exitWorld} className="mb-6 rounded-full border border-white/15 px-4 py-1.5 text-xs font-bold text-[#C3BFD6] hover:bg-white/10">← Exit</button>
      <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{p.subtitle}</p>
      <h3 className="mt-1 font-display text-3xl font-extrabold text-[#F5F3FF] sm:text-5xl">{p.title}</h3>
      {p.achievements?.length ? <ul className="mt-4 space-y-1 text-sm text-[#ffe8a3]">{p.achievements.map((a) => <li key={a}>{a}</li>)}</ul> : null}
      <p className="mt-5 leading-relaxed text-[#C3BFD6]">{p.overview}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#FF2BD6]/25 bg-[#160a18]/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF2BD6]">The challenge</p><ul className="mt-2 space-y-2 text-sm text-[#A8A3C2]">{p.challenges?.map((c) => <li key={c}>{c}</li>)}</ul></div>
        <div className="rounded-2xl border border-[#22D3EE]/25 bg-[#08161a]/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]">The solution</p><ul className="mt-2 space-y-2 text-sm text-[#A8A3C2]">{p.solutions?.map((s) => <li key={s}>{s}</li>)}</ul></div>
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]/80">Tech deployed</p>
      <div className="mt-2 space-y-2">{p.techStackDetails?.map((g) => (<div key={g.category} className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase text-[#7c5cff]">{g.category}</span>{g.tools.map((t) => <span key={t} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-2.5 py-0.5 text-[11px] font-semibold text-[#dffaff]">{t}</span>)}</div>))}</div>
      <div id="proj-carousel-slot" className="mt-10" />
    </div>
  </div>
); })()}
```

- [ ] **Step 6: Cleanup** — add `window.removeEventListener('pointerdown', onPointerDown)` to the effect's `cleanup`.

- [ ] **Step 7: Build check.** Run: `npm run build` → Expected: `✓ built`.

- [ ] **Step 8: Visual check.** Enter a centered portal (click ring or "Enter"): a wormhole streak plays, camera dives, and the project's world panel (header, overview, challenge/solution, tech) appears. "Exit" warps back to the cruise.

- [ ] **Step 9: Commit.**
```bash
git add src/components/Projects.tsx
git commit -m "feat(projects): warp-in transition, project-world panels, and exit"
```

---

### Task 4: Screenshot cover-flow carousel (centerpiece)

**Files:** Modify `src/components/Projects.tsx`

**Interfaces:**
- Produces: per-world screenshot textures loaded on entry / disposed on exit; an in-scene cover-flow of planes; `carIndexRef`, `carTargetRef`; HTML prev/next buttons + drag. Renders into the world overlay (replaces the `#proj-carousel-slot` placeholder with real controls; the 3D planes live in the canvas scene).

- [ ] **Step 1: Build the carousel rig in the effect** (a `THREE.Group`, hidden until `world`). Pre-make `MAX = 18` reusable plane meshes (covers the largest `screenshots` array) with their own materials; assign textures on entry.
```tsx
const carGroup = new THREE.Group(); carGroup.visible = false; scene.add(carGroup);
const loader = new THREE.TextureLoader();
const MAX = 18;
const cards = Array.from({ length: MAX }, () => {
  const m = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
  disposables.push(m);
  const mesh = new THREE.Mesh(track(new THREE.PlaneGeometry(2.1, 3.7)), m); mesh.visible = false; carGroup.add(mesh);
  return { mesh, m, tex: null as any };
});
let carCount = 0; const carIndexRef = { current: 0 }; const carTargetRef = { current: 0 };
const loadShots = (shots: string[]) => {
  carCount = Math.min(shots.length, MAX);
  for (let i = 0; i < carCount; i++) { const t2 = loader.load(shots[i]); cards[i].tex = t2; cards[i].m.map = t2; cards[i].m.needsUpdate = true; cards[i].mesh.visible = true; }
  for (let i = carCount; i < MAX; i++) cards[i].mesh.visible = false;
  carIndexRef.current = 0; carTargetRef.current = 0;
};
const unloadShots = () => { for (let i = 0; i < MAX; i++) { if (cards[i].tex) { cards[i].tex.dispose(); cards[i].tex = null; cards[i].m.map = null; } cards[i].mesh.visible = false; } carCount = 0; };
```

- [ ] **Step 2: Load on enter / unload on exit.** In the mode machine: when transitioning into `world` (the frame `mode` first becomes `'world'`), call `loadShots(PROJECTS[worldIdxRef.current].screenshots)`; when `warpOut` completes (back to `cruise`), call `unloadShots()`. Guard with a `let shotsLoaded = false` flag so it runs once per entry.

- [ ] **Step 3: Animate the cover-flow each frame when `mode==='world'`.** Center card faces forward + large; neighbors fan back/aside; ease `carIndexRef` toward `carTargetRef`.
```tsx
carGroup.visible = mode === 'world';
if (mode === 'world') {
  carGroup.position.set(0, -0.4, 4.2); // in front of the (now z=3) camera
  carIndexRef.current += (carTargetRef.current - carIndexRef.current) * Math.min(1, dt * 6);
  for (let i = 0; i < carCount; i++) {
    const off = i - carIndexRef.current; const a = Math.abs(off);
    const mesh = cards[i].mesh;
    mesh.position.set(off * 1.5, 0, -a * 0.8);
    mesh.rotation.y = -off * 0.5;
    mesh.scale.setScalar(Math.max(0.4, 1 - a * 0.18));
    cards[i].m.opacity = Math.max(0, 1 - a * 0.35);
    mesh.renderOrder = 100 - Math.round(a);
  }
}
```

- [ ] **Step 4: Controls.** Replace the `#proj-carousel-slot` placeholder with prev/next buttons + a counter, plus drag on the canvas. Buttons set `carTargetRef.current = clamp(±1)`. Add to the world overlay:
```tsx
<div className="mt-10">
  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]/80">Gallery</p>
  <div data-exp-ui className="mt-2 flex items-center gap-3">
    <button data-exp-ui onClick={() => prevShot()} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white hover:bg-white/10">‹</button>
    <span className="text-sm text-[#A8A3C2]"><span ref={shotLabelRef}>1</span> / {PROJECTS[worldIdx].screenshots.length}</span>
    <button data-exp-ui onClick={() => nextShot()} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white hover:bg-white/10">›</button>
  </div>
</div>
```
Add component-scope `const shotLabelRef = useRef<HTMLSpanElement>(null)` and stash `prevShot/nextShot` on a ref so the effect and JSX share them: `const carCtl = useRef<{prev:()=>void; next:()=>void}>({prev(){},next(){}})`; the effect assigns `carCtl.current.prev = () => { carTargetRef.current = Math.max(0, Math.round(carTargetRef.current) - 1); }` and `.next` similarly bounded by `carCount-1`; JSX calls `carCtl.current.prev()`. Update `shotLabelRef.textContent` to `Math.round(carIndexRef.current)+1` each frame.

- [ ] **Step 5: Drag + click-enlarge.** In `onPointerMove`, when `mode==='world'` and a pointer drag is active (track `pointerdown`→`pointermove`→`pointerup` on `window`), nudge `carTargetRef` by `-dx * k`. Clicking the centered card (raycast `cards[i].mesh`) opens a full-screen lightbox (`[lightboxSrc, setLightboxSrc]` state → an `data-exp-ui` fixed overlay `<img>` with a close button).

- [ ] **Step 6: Build check.** Run: `npm run build` → Expected: `✓ built`.

- [ ] **Step 7: Visual check.** Enter a project; confirm its screenshots appear as a cover-flow (center large, neighbors fanned); prev/next + drag flick through them; the counter updates; clicking the center shot opens a lightbox; exiting and re-entering a different project shows that project's shots (textures swapped, not accumulated).

- [ ] **Step 8: Commit.**
```bash
git add src/components/Projects.tsx
git commit -m "feat(projects): 3D screenshot cover-flow carousel with lazy textures + lightbox"
```

---

### Task 5: Challenge→Solution visual beat, award beacon, hover polish

**Files:** Modify `src/components/Projects.tsx`

- [ ] **Step 1: Award beacon.** For the active portal in cruise, if `PROJECTS[idx].achievements?.length`, add a small pulsing gold sprite (`makeGlowTexture`, color `0xffd36b`) above the ring; scale-pulse with `Math.sin`. Build it per-portal in Task 2's loop guarded by `p.achievements?.length`.

- [ ] **Step 2: Challenge→Solution beat.** In the world overlay, animate the two cards in on entry: add classes so the challenge card slides from the left and the solution card from the right with a CSS transition keyed on a `worldIn` state set `true` ~50 ms after `setWorldIdx` (via `requestAnimationFrame`), `false` on exit. Pure CSS (translate/opacity) — no new 3D.

- [ ] **Step 3: Portal hover.** In `onPointerMove` (cruise mode), raycast `builtPortals.map(b=>b.hit)`; on hover set `stageRef.current.style.cursor='pointer'` and bump that portal's `glowMat.opacity` target. Mirror Experience's hover easing.

- [ ] **Step 4: Build check.** Run: `npm run build` → Expected: `✓ built`.

- [ ] **Step 5: Visual check.** Award projects (TrackPoint) show a gold beacon on their portal; entering a world slides the challenge/solution cards in; hovering a portal shows a pointer cursor + brighter glow.

- [ ] **Step 6: Commit.**
```bash
git add src/components/Projects.tsx
git commit -m "feat(projects): award beacon, challenge→solution reveal, portal hover"
```

---

### Task 6: Mobile tuning, fallback parity, final pass

**Files:** Modify `src/components/Projects.tsx`

- [ ] **Step 1: Mobile.** Confirm `isMobile` lowers star counts (done), portal/torus segments, and carousel spacing (`off * 1.2` instead of `1.5`, card plane `1.7×3.0`). Reduce `MAX` texture loads only if needed (keep 18). Verify the pin `end` factor (`2.4` mobile) gives room for 3 portals.

- [ ] **Step 2: Fallback parity.** Re-read the Task 1 static fallback; ensure every world field (overview, challenges, solutions, tech, achievements, screenshots) is present and accessible; confirm `sr-only` list exists.

- [ ] **Step 3: Content-sync check.** Confirm no project copy was hardcoded (all from `PROJECTS`); only chrome labels are new → no `PORTFOLIO_CONTENT.md` / `SYSTEM_INSTRUCTION` change required (per Global Constraints).

- [ ] **Step 4: Build check.** Run: `npm run build` → Expected: `✓ built`.

- [ ] **Step 5: Visual check.** Resize to a narrow viewport (or DevTools device mode): cruise, enter, carousel, and exit all work; reduced-motion fallback still complete.

- [ ] **Step 6: Commit.**
```bash
git add src/components/Projects.tsx
git commit -m "feat(projects): mobile tuning + fallback parity"
```

---

## Notes for the implementer
- **Verify visually, not with unit tests** — there are none. After each task, `npm run build` then look at the running app (the maintainer uses a Chrome-DevTools screenshot loop; you can too, or just open `localhost`).
- **The scroll harness is shared** — the Journey/About/Skills section before this one is a long GSAP pin; when testing, scroll to the very bottom and back up to reach Projects, and remember GSAP `scrub` lags ~1s after a programmatic `scrollTo`.
- **Don't run all screenshot textures at once** — 3 projects × ~15 shots. Load only the entered project's set (Task 4) and dispose on exit.
- **Keep the canvas `pointer-events:none`** — every clickable HTML element in this section needs `data-exp-ui` (or be an `<a>`/`<button>`) so the window click-router skips it.
