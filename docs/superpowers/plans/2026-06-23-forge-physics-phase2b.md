# The Forge Stage — Grab & Throw Physics (Phase 2b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 17 Skills crystals physically battable — they float in zero-g, collide, and can be grabbed and thrown — using `matter-js` (already installed), without breaking the existing hover-label and click-to-inspect interactions.

**Architecture:** A `matter-js` engine (zero gravity) simulates 17 circular bodies + 4 bounding walls in a **scaled 2D space** (matter-js's comfortable pixel range); the bodies map 1:1 to the crystals. `ForgeStageScene` steps the engine each frame and reads body positions/angles onto the meshes (replacing the 2a idle-drift). Pointer drag in screen space is converted to the physics plane via a pure mapping helper: press-on-a-crystal grabs it (it follows the cursor), release throws it with the drag velocity. A small move-threshold disambiguates a *click* (inspect → holo panel) from a *drag* (throw).

**Tech Stack:** `matter-js ^0.20.0` (+ `@types/matter-js`), three `~0.184`, `@react-three/fiber ^9.6.1`, Vitest. Builds on Phase 2a (`ForgeStageScene`, `ForgeStageInteractive`, the holo panel).

**This is Phase 2b.** 2a = interactive + readable (done). 2b = grab/throw physics (this plan). 2c = streak-to-Experience continuity, panel a11y/Escape, crystal recolour-on-theme-toggle, retire `HoloSkills.tsx`. OUT of 2b: those 2c items.

## Global Constraints

- **Reuse `matter-js`** (already a dependency). No new packages. Import as `import Matter from 'matter-js';`.
- **Zero-g, bounded:** `engine.gravity.x = engine.gravity.y = 0`; 4 static walls keep all bodies on-stage.
- **Physics runs in a scaled space:** matter-js bodies use `world-units × PHYS_SCALE` (PHYS_SCALE = 100) so matter-js stays in its tuned pixel range; divide by `PHYS_SCALE` when reading back to 3D.
- **Preserve 2a behavior:** hover bloom + label and click-to-inspect (holo panel) must keep working. A drag must NOT also fire inspect.
- **The shards stay in the `ForgeStageInteractive` lazy subtree** — no new static three/matter import reaches the eager bundle. (`matter-js` is imported only by modules inside that subtree.)
- **Type-check `npx tsc --noEmit` clean; `npm test` green.** Dev server `npm run dev` → port 3000; interactive verification in-browser.
- **`@` alias = repo root.**

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/scene/forge/forgeView.ts` (new) | Pure camera→plane math: `viewBounds(camZ, fovDeg, aspect)` and `screenToWorld(px,py,w,h,bounds)`. |
| `src/scene/forge/forgeView.test.ts` (new) | Vitest for the pure mapping. |
| `src/scene/forge/forgePhysics.ts` (new) | `matter-js` world: `createForgeWorld(positions, bounds)`, `stepForge(world, dtMs)`, `PHYS_SCALE`, grab/throw helpers (`grabAt`, `dragTo`, `release`). |
| `src/scene/forge/forgePhysics.test.ts` (new) | Vitest: body count, zero-g, bodies stay within walls after stepping. |
| `src/scene/forge/ForgeStageScene.tsx` (modify) | Step the engine each frame; read body x/y/angle onto meshes (replaces idle drift); wire pointer drag→grab/throw with click disambiguation. |

---

### Task 1: Pure camera→plane mapping

**Files:**
- Create: `src/scene/forge/forgeView.ts`
- Test: `src/scene/forge/forgeView.test.ts`

**Interfaces:**
- Produces: `viewBounds(camZ: number, fovDeg: number, aspect: number): { halfW: number; halfH: number }` and `screenToWorld(px: number, py: number, w: number, h: number, b: { halfW: number; halfH: number }): { x: number; y: number }`.

- [ ] **Step 1: Write the failing test**

`src/scene/forge/forgeView.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { viewBounds, screenToWorld } from './forgeView';

describe('viewBounds', () => {
  it('computes half-height from camera distance and fov', () => {
    // camZ=8, fov=50 → halfH = 8 * tan(25°) ≈ 3.730
    const b = viewBounds(8, 50, 2);
    expect(b.halfH).toBeCloseTo(3.7304, 3);
    expect(b.halfW).toBeCloseTo(b.halfH * 2, 6); // aspect 2
  });
});

describe('screenToWorld', () => {
  const b = { halfW: 6, halfH: 3 };
  it('maps the canvas center to the origin', () => {
    const p = screenToWorld(500, 250, 1000, 500, b);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });
  it('maps the top-right corner to (+halfW, +halfH)', () => {
    const p = screenToWorld(1000, 0, 1000, 500, b);
    expect(p.x).toBeCloseTo(6, 6);
    expect(p.y).toBeCloseTo(3, 6); // screen y is inverted (top = +y)
  });
  it('maps the bottom-left corner to (-halfW, -halfH)', () => {
    const p = screenToWorld(0, 500, 1000, 500, b);
    expect(p.x).toBeCloseTo(-6, 6);
    expect(p.y).toBeCloseTo(-3, 6);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `forgeView` not found.

- [ ] **Step 3: Implement**

`src/scene/forge/forgeView.ts`:
```ts
/** Half-extents (world units) of the z=0 plane visible to a perspective camera
 *  at (0,0,camZ) looking at the origin, given vertical fov + viewport aspect. */
export function viewBounds(camZ: number, fovDeg: number, aspect: number): { halfW: number; halfH: number } {
  const halfH = camZ * Math.tan((fovDeg * Math.PI) / 360); // tan(fov/2 in rad)
  return { halfW: halfH * aspect, halfH };
}

/** Map a pixel within the canvas (px:0..w left→right, py:0..h top→bottom) to a
 *  world (x,y) on the z=0 plane. Screen y is inverted so up is +y. */
export function screenToWorld(
  px: number,
  py: number,
  w: number,
  h: number,
  b: { halfW: number; halfH: number }
): { x: number; y: number } {
  const nx = (px / w) * 2 - 1; // -1..1
  const ny = -((py / h) * 2 - 1); // +1 (top) .. -1 (bottom)
  return { x: nx * b.halfW, y: ny * b.halfH };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test` (expected: all green) then `npx tsc --noEmit` (clean).

- [ ] **Step 5: Commit**

```bash
git add src/scene/forge/forgeView.ts src/scene/forge/forgeView.test.ts
git commit -m "feat(forge): pure camera→plane mapping (viewBounds, screenToWorld)"
```

---

### Task 2: The matter-js physics world

**Files:**
- Create: `src/scene/forge/forgePhysics.ts`
- Test: `src/scene/forge/forgePhysics.test.ts`

**Interfaces:**
- Consumes: `Matter` from `matter-js`; `viewBounds` result `{ halfW, halfH }` (world units).
- Produces:
  - `PHYS_SCALE = 100`
  - `interface ForgeWorld { engine: Matter.Engine; bodies: Matter.Body[] }`
  - `createForgeWorld(positions: { x: number; y: number }[], bounds: { halfW: number; halfH: number }, radius: number): ForgeWorld` — zero-g engine, one circle body per position (positions in WORLD units; the fn scales them), 4 static walls at the scaled bounds.
  - `stepForge(world: ForgeWorld, dtMs: number): void`
  - `grabAt(world, wx, wy): number | null` (world units → index of the body under the point, or null), `dragTo(world, index, wx, wy): void` (move a grabbed body, tracking velocity), `release(world, index): void` (make dynamic again so its velocity throws it).

- [ ] **Step 1: Write the failing test**

`src/scene/forge/forgePhysics.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { createForgeWorld, stepForge, PHYS_SCALE } from './forgePhysics';

const bounds = { halfW: 6, halfH: 3.7 };
const positions = Array.from({ length: 17 }, (_, i) => ({ x: (i % 5) - 2, y: (i % 3) - 1 }));

describe('createForgeWorld', () => {
  it('creates one dynamic body per position, zero gravity', () => {
    const w = createForgeWorld(positions, bounds, 0.42);
    expect(w.bodies).toHaveLength(17);
    expect(w.engine.gravity.x).toBe(0);
    expect(w.engine.gravity.y).toBe(0);
  });

  it('places bodies at scaled positions', () => {
    const w = createForgeWorld(positions, bounds, 0.42);
    expect(w.bodies[0].position.x).toBeCloseTo(positions[0].x * PHYS_SCALE, 3);
    expect(w.bodies[0].position.y).toBeCloseTo(positions[0].y * PHYS_SCALE, 3);
  });

  it('keeps bodies inside the walls after stepping with outward velocity', () => {
    const w = createForgeWorld(positions, bounds, 0.42);
    // fling them all hard outward
    for (const b of w.bodies) (b as any).force; // no-op to keep import tree-shaking honest
    w.bodies.forEach((b, i) => {
      // Matter is imported indirectly; set velocity via the engine's util through position deltas
      b.velocity.x = (i % 2 ? 1 : -1) * 50;
      b.velocity.y = (i % 2 ? -1 : 1) * 50;
    });
    for (let s = 0; s < 120; s++) stepForge(w, 16);
    const limX = bounds.halfW * PHYS_SCALE + 1;
    const limY = bounds.halfH * PHYS_SCALE + 1;
    for (const b of w.bodies) {
      expect(Math.abs(b.position.x)).toBeLessThanOrEqual(limX);
      expect(Math.abs(b.position.y)).toBeLessThanOrEqual(limY);
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `forgePhysics` not found.

- [ ] **Step 3: Implement**

`src/scene/forge/forgePhysics.ts`:
```ts
import Matter from 'matter-js';

/** matter-js is tuned for pixel-scale; we sim in world-units × this factor. */
export const PHYS_SCALE = 100;

export interface ForgeWorld {
  engine: Matter.Engine;
  bodies: Matter.Body[];
}

/** Build a zero-g world: one circle body per world-unit position, 4 static walls
 *  at the (scaled) view bounds so nothing escapes the stage. */
export function createForgeWorld(
  positions: { x: number; y: number }[],
  bounds: { halfW: number; halfH: number },
  radius: number
): ForgeWorld {
  const engine = Matter.Engine.create();
  engine.gravity.x = 0;
  engine.gravity.y = 0;

  const r = radius * PHYS_SCALE;
  const bodies = positions.map((p) =>
    Matter.Bodies.circle(p.x * PHYS_SCALE, p.y * PHYS_SCALE, r, {
      restitution: 0.7,
      frictionAir: 0.02,
      friction: 0,
    })
  );

  const W = bounds.halfW * PHYS_SCALE;
  const H = bounds.halfH * PHYS_SCALE;
  const t = 40; // wall thickness
  const walls = [
    Matter.Bodies.rectangle(0, -H - t / 2, W * 2 + t * 2, t, { isStatic: true }),
    Matter.Bodies.rectangle(0, H + t / 2, W * 2 + t * 2, t, { isStatic: true }),
    Matter.Bodies.rectangle(-W - t / 2, 0, t, H * 2 + t * 2, { isStatic: true }),
    Matter.Bodies.rectangle(W + t / 2, 0, t, H * 2 + t * 2, { isStatic: true }),
  ];

  Matter.Composite.add(engine.world, [...bodies, ...walls]);
  return { engine, bodies };
}

/** Advance the sim. Clamp dt so a tab-switch stall doesn't explode the world. */
export function stepForge(world: ForgeWorld, dtMs: number): void {
  Matter.Engine.update(world.engine, Math.min(dtMs, 33));
}

/** Index of the body whose centre is within `radius` of the world point, else null. */
export function grabAt(world: ForgeWorld, wx: number, wy: number): number | null {
  const x = wx * PHYS_SCALE;
  const y = wy * PHYS_SCALE;
  let best: number | null = null;
  let bestD = Infinity;
  world.bodies.forEach((b, i) => {
    const d = Math.hypot(b.position.x - x, b.position.y - y);
    if (d < (b.circleRadius ?? 0) * 1.6 && d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/** Drag a grabbed body to a world point; setting position tracks velocity so a
 *  release throws it. Make it non-static while dragging. */
export function dragTo(world: ForgeWorld, index: number, wx: number, wy: number): void {
  const b = world.bodies[index];
  Matter.Body.setPosition(b, { x: wx * PHYS_SCALE, y: wy * PHYS_SCALE });
}

/** Nothing special on release — the velocity from dragTo's position deltas carries
 *  the throw. Kept as an explicit hook for clarity / future tuning. */
export function release(_world: ForgeWorld, _index: number): void {}
```

> Note: `Matter.Body.setPosition` updates `body.positionPrev`, so matter-js derives velocity from the drag automatically — release needs no extra impulse.

- [ ] **Step 4: Run to verify it passes**

Run: `npm test` (expected: green — 17 bodies, zero-g, contained) then `npx tsc --noEmit` (clean).

- [ ] **Step 5: Commit**

```bash
git add src/scene/forge/forgePhysics.ts src/scene/forge/forgePhysics.test.ts
git commit -m "feat(forge): matter-js zero-g world + grab/drag helpers"
```

---

### Task 3: Drive the crystals from physics + grab/throw

**Files:**
- Modify: `src/scene/forge/ForgeStageScene.tsx`

**Interfaces:**
- Consumes: `viewBounds`, `screenToWorld` (Task 1); `createForgeWorld`, `stepForge`, `grabAt`, `dragTo`, `release` (Task 2); `useThree` from `@react-three/fiber` (for viewport size/aspect).

- [ ] **Step 1: Initialize the world and step it each frame**

In `ForgeStageScene.tsx`:
- Import `useThree` from `@react-three/fiber`, and the Task 1/2 helpers.
- Compute bounds once from the camera: the Canvas camera is `position:[0,0,8] fov:50`; get `const { size } = useThree();` for aspect (`size.width/size.height`). Build `const bounds = useMemo(() => viewBounds(8, 50, size.width / size.height), [size.width, size.height]);`.
- Create the world once from the existing `positions` (the 2a `layout()` output, already world-unit Vector3s — pass `{x,y}`): `const world = useMemo(() => createForgeWorld(positions.map(p => ({x:p.x,y:p.y})), bounds, 0.42), [positions, bounds]);` and seed a gentle initial drift by setting each body's `velocity` to a small random value once (in a `useEffect`).
- In `useFrame((state, delta) => { ... })`: call `stepForge(world, delta * 1000)`; then for each mesh `i`, set `m.position.x = world.bodies[i].position.x / PHYS_SCALE; m.position.y = world.bodies[i].position.y / PHYS_SCALE;` (z stays from `positions[i].z`), and `m.rotation.z = world.bodies[i].angle`. KEEP the scale-bloom logic (hovered 1.5 / focused 1.7 / idle 1.0). REMOVE the old `m.position.set(... sin wobble ...)` idle drift.
- Keep the disposal `useEffect` from 2a; ALSO clear the matter world on unmount: `Matter.World.clear(world.engine.world, false); Matter.Engine.clear(world.engine);` (import `Matter`).

- [ ] **Step 2: Add grab / drag / throw with click disambiguation**

Add pointer handlers that convert screen → world and drive the helpers. Track a drag in refs so a *click* (tiny movement) still reaches the existing `onClick`/inspect:
- On each mesh keep `onPointerOver`/`onPointerOut`/`onClick` from 2a, and ADD `onPointerDown={(e) => { e.stopPropagation(); const w = toWorld(e); const idx = grabAt(world, w.x, w.y); drag.current = { idx, startX: e.clientX, startY: e.clientY, moved: false }; (e.target as Element).setPointerCapture?.(e.pointerId); }}`.
- Add a scene-level pointer-move/up via the canvas: simplest is to put `onPointerMove`/`onPointerUp` on a large invisible backdrop `<mesh>` behind the shards OR on each shard. Use refs: a `drag` ref `{ idx: number|null, startX, startY, moved: boolean }`. On move, if `drag.current?.idx != null`, compute world point and `dragTo(world, idx, w.x, w.y)`, and set `moved = Math.hypot(e.clientX-startX, e.clientY-startY) > 6`. On up, `release(world, idx)`; if `!moved` AND idx != null, treat as a click → `onFocus(focusedId === SKILLS[idx].id ? null : SKILLS[idx].id)`; clear `drag.current`.
- Because a real *drag* sets `moved=true`, the existing per-mesh `onClick` (which also calls onFocus) would double-fire inspect on a throw. To prevent that, REMOVE the per-mesh `onClick` and route inspect solely through the pointer-up "tiny movement" branch above (single source of truth for click-vs-drag).
- Helper `const toWorld = (e) => { const r = gl.domElement.getBoundingClientRect(); return screenToWorld(e.clientX - r.left, e.clientY - r.top, r.width, r.height, bounds); };` where `const gl = useThree(s => s.gl);`.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. (Fix minimal typing on the `drag` ref and matter imports.)

- [ ] **Step 4: Verify in the browser**

`npm run dev`; via chrome-devtools (reload the tools if disconnected) open `http://localhost:3000`, scroll into Skills. Confirm: crystals now **float and collide** (zero-g), stay on-stage (don't fly off), hover still blooms+labels, a **real click** (tiny movement) still opens the holo panel, and a **drag-and-release throws** a crystal (it keeps moving, bounces off walls/others, settles). Screenshot the field. (Note: drag/throw needs a *real* mouse drag — synthetic events won't reproduce it; rely on a real drag + this code path.)

- [ ] **Step 5: Commit**

```bash
git add src/scene/forge/ForgeStageScene.tsx
git commit -m "feat(forge): zero-g physics + grab/throw on skill crystals"
```

---

## Self-Review

**Spec coverage (2b scope):**
- Crystals battable / zero-g / collide → `forgePhysics` world + per-frame step (Tasks 2–3). ✓
- Grab + throw via cursor → `grabAt`/`dragTo`/`release` + pointer handlers, drag velocity from `setPosition` (Tasks 2–3). ✓
- Preserve hover + inspect; drag ≠ inspect → click/drag disambiguation by movement threshold, single inspect path (Task 3 Step 2). ✓
- Stays in the lazy subtree (matter-js only imported by `forgePhysics`/`ForgeStageScene`, both inside `ForgeStageInteractive`). ✓
- Bounded so nothing escapes → 4 static walls + contained-after-step test (Task 2). ✓
- *Deferred to 2c:* streak-to-Experience, panel a11y, theme recolour, retire HoloSkills.

**Placeholder scan:** Tasks 1–2 ship complete code + complete tests. Task 3 is an integration task with complete handler logic specified and an explicit browser-verify (real-drag) step — genuine interaction calibration, not vague. No TBD/TODO.

**Type consistency:** `ForgeWorld`/`createForgeWorld`/`stepForge`/`grabAt`/`dragTo`/`release`/`PHYS_SCALE` names are used identically Tasks 2→3. `viewBounds`/`screenToWorld` signatures stable Task 1→3. `positions` are world-unit `THREE.Vector3` (2a) → mapped to `{x,y}` for physics.

---

## Notes for 2c
Streak the crystals toward the Experience beacon as the sticky dwell ends; give the holo panel `role="dialog"` + Escape; recolour crystals on theme toggle via `useThemeColors()` inside the canvas; reach fallback parity (tap-to-inspect on the DOM grid); delete `HoloSkills.tsx`. Owner: verify the 17 `level` values.
