# The Forge — Smash Cinematic (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Skills section's 3D visuals with a scroll-driven "planet smash" — an iridescent planet that charges, detonates, and bursts into 17 drifting crystal shards that streak toward the next region — driven entirely by scroll progress (no physics engine, fully reversible).

**Architecture:** A single `Forge` R3F object reads `sections.skills` scroll progress each frame and feeds a **pure** choreography function (`computeForge`) that returns the planet state + 17 shard transforms. The object mirrors those transforms onto a planet mesh and 17 shared-geometry iridescent shard meshes. No pointer interaction, no React re-renders (mutable-ref pattern, identical to the existing `Planet`/`SkillNodes` objects). Runs only where the scene already runs (capable desktops); the existing `HoloSkills` DOM `#skills` section remains the universal readable fallback.

**Tech Stack:** React 19 + TypeScript, three.js `~0.184`, `@react-three/fiber ^9.6.1`, `@react-three/drei ^10.7.7`, Vite 6. Vitest (added here) for pure-logic tests.

**This is Phase 1 of 2.** Phase 1 = the smash *cinematic* (this plan), which is also the foundation and the mobile/reduced-motion experience's desktop counterpart. Phase 2 (separate plan) adds the hands-on play: a DOM hit-layer + matter-js screen-space physics, hover/drag/click, orbital holo-fragments, the `Skill` data enrichment, and retiring the `HoloSkills` DOM.

## Global Constraints

- **Scroll is read, never stored:** 3D objects read `getSectionProgress()` / `getScrollProgress()` from `src/animations/scroll` and consume them in `useFrame`. No React state for animation; no second scroll listener.
- **Colors come from `useThemeColors()`** — stable `THREE.Color` instances mutated/lerped in place each frame. Pass them directly as shader uniform `value`s; never read CSS in the render loop.
- **Glow is baked into materials:** `toneMapped={false}` + additive/emissive, independent of the optional bloom pass (matches every existing object).
- **Never use `window.gsap`** — import `gsap` from `src/animations` if needed.
- **Do not touch the capability gate / fallback path:** `shouldRenderScene`, `SceneFallback`, and the `sceneCrashed` guard in `App.tsx` stay as-is. The Forge inherits the desktop-only gate automatically by living inside `SceneRoot`.
- **Type-check is the build gate:** `npx tsc --noEmit` must stay clean (project has `noEmit` only; no emit step).
- **`@` path alias resolves to the repo root** (see `vite.config.ts` / `tsconfig.json`).
- **Versions (verbatim):** react `^19.2.0`, three `~0.184.0`, `@react-three/fiber ^9.6.1`, `@react-three/drei ^10.7.7`. Dev server: `npm run dev` → port **3000**, host 0.0.0.0.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/scene/forge/forgeLayout.ts` (new) | Pure: deterministic 17 shard *seeds* from `SKILLS`, and `computeForge(progress, seeds, time, beacon)` → planet + shard transforms. The testable core. |
| `src/scene/forge/forgeLayout.test.ts` (new) | Vitest unit tests for the above. |
| `src/scene/materials/iridescent.ts` (new) | Factory for the iridescent (cyan→violet→gold fresnel) `ShaderMaterial`. Reusable by later regions. |
| `src/scene/objects/Forge.tsx` (new) | The R3F object: planet + 17 shards, driven by `computeForge`. |
| `src/scene/SceneRoot.tsx` (modify) | Mount `<Forge>`; remove the old `<SkillNodes>` + `<SkillConstellationLines>` (the Forge replaces them). |
| `vitest.config.ts` (new) | Minimal Vitest config (node env). |
| `package.json` (modify) | Add `vitest` devDep + `"test"` script. |

---

### Task 1: Add Vitest for pure-logic tests

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Create: `vitest.config.ts`
- Create: `src/scene/forge/__smoke__.test.ts` (temporary smoke test)

**Interfaces:**
- Produces: a working `npm test` command for Tasks 2–3.

- [ ] **Step 1: Add the dependency and script**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```
Add to `"devDependencies"` (alphabetical):
```json
"vitest": "^2.1.9"
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: completes; `node_modules/.bin/vitest` exists.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Write a smoke test**

`src/scene/forge/__smoke__.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Delete the smoke test and commit**

Delete `src/scene/forge/__smoke__.test.ts` (Task 2 adds the real one).
```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add vitest for pure-logic unit tests"
```

---

### Task 2: Shard seeds — deterministic layout from SKILLS

**Files:**
- Create: `src/scene/forge/forgeLayout.ts`
- Test: `src/scene/forge/forgeLayout.test.ts`

**Interfaces:**
- Consumes: `SKILLS` from `src/constants.ts` (each has `id`, `name`).
- Produces: `interface ShardSeed { id: string; dir: THREE.Vector3; spin: THREE.Vector3; dist: number; phase: number }` and `buildShardSeeds(): ShardSeed[]` (length === `SKILLS.length`, ids in `SKILLS` order, `dir` unit-length).

- [ ] **Step 1: Write the failing test**

`src/scene/forge/forgeLayout.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { SKILLS } from '../../constants';
import { buildShardSeeds } from './forgeLayout';

describe('buildShardSeeds', () => {
  it('produces one seed per skill, in order', () => {
    const seeds = buildShardSeeds();
    expect(seeds).toHaveLength(SKILLS.length);
    expect(seeds.map((s) => s.id)).toEqual(SKILLS.map((s) => s.id));
  });

  it('gives every shard a unit outward direction', () => {
    for (const s of buildShardSeeds()) {
      expect(s.dir.length()).toBeCloseTo(1, 5);
    }
  });

  it('is deterministic across calls', () => {
    const a = buildShardSeeds();
    const b = buildShardSeeds();
    expect(a[3].dir.toArray()).toEqual(b[3].dir.toArray());
    expect(a[3].dist).toEqual(b[3].dist);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `buildShardSeeds` not exported / module not found.

- [ ] **Step 3: Implement `buildShardSeeds`**

`src/scene/forge/forgeLayout.ts`:
```ts
import * as THREE from 'three';
import { SKILLS } from '../../constants';

export interface ShardSeed {
  /** Matches the SKILLS id (1:1 with the DOM skill chips). */
  id: string;
  /** Unit outward direction the shard flies when the planet detonates. */
  dir: THREE.Vector3;
  /** Per-axis tumble rates. */
  spin: THREE.Vector3;
  /** How far out the shard drifts (scene units). */
  dist: number;
  /** Phase offset so shards don't bob in unison. */
  phase: number;
}

/** Deterministic 0..1 hash from a shard index + a salt. */
const hash = (i: number, salt: number): number => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * One seed per skill. Directions use the same fibonacci-sphere distribution as
 * buildSkillNodes() so the burst reads as an even shell, and every per-shard
 * value is a pure function of the index (stable across reloads, no Math.random).
 */
export function buildShardSeeds(): ShardSeed[] {
  const n = SKILLS.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return SKILLS.map((skill, i) => {
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0; // 1 → -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const dir = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();
    return {
      id: skill.id,
      dir,
      spin: new THREE.Vector3(
        (hash(i, 1) - 0.5) * 2,
        (hash(i, 2) - 0.5) * 2,
        (hash(i, 3) - 0.5) * 2
      ),
      dist: 1.8 + hash(i, 4) * 1.4, // 1.8 .. 3.2
      phase: hash(i, 5) * Math.PI * 2,
    };
  });
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/scene/forge/forgeLayout.ts src/scene/forge/forgeLayout.test.ts
git commit -m "feat(forge): deterministic shard seeds from SKILLS"
```

---

### Task 3: `computeForge` — the smash choreography

**Files:**
- Modify: `src/scene/forge/forgeLayout.ts`
- Test: `src/scene/forge/forgeLayout.test.ts`

**Interfaces:**
- Consumes: `ShardSeed[]` from Task 2.
- Produces:
  - `interface ShardTransform { pos: THREE.Vector3; rot: THREE.Euler; scale: number; opacity: number }`
  - `interface ForgeState { planetOpacity: number; planetCharge: number; planetScale: number; shards: ShardTransform[] }`
  - `computeForge(progress: number, seeds: ShardSeed[], time: number, beacon: THREE.Vector3): ForgeState` — all positions are **relative to the forge group origin**; `beacon` is the carry-forward target in that same local space.
  - `DETONATE: number` (the threshold constant, `0.4`).

- [ ] **Step 1: Write the failing tests**

Append to `src/scene/forge/forgeLayout.test.ts`:
```ts
import * as THREE from 'three';
import { computeForge, DETONATE } from './forgeLayout';

const BEACON = new THREE.Vector3(-2, 1.6, -2);

describe('computeForge', () => {
  const seeds = buildShardSeeds();

  it('before detonation: planet solid, shards hidden', () => {
    const s = computeForge(0.05, seeds, 0, BEACON);
    expect(s.planetOpacity).toBeCloseTo(1, 3);
    expect(s.shards).toHaveLength(seeds.length);
    expect(Math.max(...s.shards.map((x) => x.scale))).toBeCloseTo(0, 3);
    expect(Math.max(...s.shards.map((x) => x.opacity))).toBeCloseTo(0, 3);
  });

  it('mid-flight: planet gone, shards visible and pushed out', () => {
    const s = computeForge(0.65, seeds, 0, BEACON);
    expect(s.planetOpacity).toBeLessThan(0.05);
    expect(Math.min(...s.shards.map((x) => x.scale))).toBeGreaterThan(0.2);
    expect(s.shards[0].pos.length()).toBeGreaterThan(0.5);
  });

  it('at the end: shards fade out (carried to the beacon)', () => {
    const s = computeForge(1, seeds, 0, BEACON);
    expect(Math.max(...s.shards.map((x) => x.opacity))).toBeLessThan(0.05);
  });

  it('is reversible — same progress yields same state', () => {
    const a = computeForge(0.55, seeds, 2, BEACON);
    const b = computeForge(0.55, seeds, 2, BEACON);
    expect(a.shards[5].pos.toArray()).toEqual(b.shards[5].pos.toArray());
  });

  it('DETONATE threshold is 0.4', () => {
    expect(DETONATE).toBe(0.4);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — `computeForge` / `DETONATE` not exported.

- [ ] **Step 3: Implement `computeForge`**

Append to `src/scene/forge/forgeLayout.ts`:
```ts
/** Scroll progress at which the planet detonates. */
export const DETONATE = 0.4;

/** Smoothstep ramp from a→b, clamped. */
const ramp = (a: number, b: number, x: number): number => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ShardTransform {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: number;
  opacity: number;
}

export interface ForgeState {
  /** 1 = solid planet, 0 = fully dissolved. */
  planetOpacity: number;
  /** 0→1 "charging" glow before detonation. */
  planetCharge: number;
  planetScale: number;
  shards: ShardTransform[];
}

/**
 * Pure smash choreography as a function of scroll progress (so it is perfectly
 * reversible — scrolling back recomputes the assembled state). `time` only
 * drives idle drift/tumble; the macro motion is progress-driven. All positions
 * are relative to the forge group origin.
 */
export function computeForge(
  progress: number,
  seeds: ShardSeed[],
  time: number,
  beacon: THREE.Vector3
): ForgeState {
  const charge = ramp(0.12, DETONATE, progress); // cracks/energy build
  const dissolve = ramp(DETONATE, 0.5, progress); // planet fades
  const fly = ramp(DETONATE, 0.7, progress); // shards travel out
  const carry = ramp(0.85, 1.0, progress); // streak to the beacon

  const planetOpacity = 1 - dissolve;
  const planetScale = 1 + charge * 0.05 - dissolve * 0.25;

  const target = beacon.clone().add(new THREE.Vector3(0, 0.4, 0));
  const shards = seeds.map((s) => {
    const drift = Math.sin(time * 0.6 + s.phase) * 0.18 * (1 - carry);
    const radius = s.dist * fly + drift;
    const base = s.dir.clone().multiplyScalar(radius);
    const pos = base.lerp(target, carry);
    const spinAngle = time * 0.5 + fly * 6;
    const rot = new THREE.Euler(s.spin.x * spinAngle, s.spin.y * spinAngle, s.spin.z * spinAngle);
    const scale = fly * (1 - carry * 0.6);
    const opacity = Math.min(fly * 1.4, 1) * (1 - carry);
    return { pos, rot, scale, opacity };
  });

  return { planetOpacity, planetCharge: charge, planetScale, shards };
}
```

- [ ] **Step 4: Run to verify passing**

Run: `npm test`
Expected: PASS — all forgeLayout tests green.

- [ ] **Step 5: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no errors.
```bash
git add src/scene/forge/forgeLayout.ts src/scene/forge/forgeLayout.test.ts
git commit -m "feat(forge): scroll-driven smash choreography (computeForge)"
```

---

### Task 4: Iridescent material factory

**Files:**
- Create: `src/scene/materials/iridescent.ts`

**Interfaces:**
- Produces: `createIridescent(a: THREE.Color, b: THREE.Color, c: THREE.Color): THREE.ShaderMaterial` with a `uOpacity` uniform (default 1). Self-lit (needs no scene light), `toneMapped:false`, `transparent:true`.

- [ ] **Step 1: Write the material**

`src/scene/materials/iridescent.ts`:
```ts
import * as THREE from 'three';

/** View-dependent prismatic sheen: base color shifts across A→B by facing, with
 *  a C-colored fresnel rim. Self-lit so it reads without scene lights (matches
 *  the additive/emissive idiom used across the scene). */
const VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vView;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const FRAG = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vView;
void main() {
  float fres = pow(1.0 - max(dot(vN, vView), 0.0), 1.6);
  float facing = clamp(dot(vN, normalize(vec3(0.3, 0.6, 0.5))) * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = mix(uA, uB, facing);
  vec3 col = mix(base, uC, fres);
  col += fres * 0.6; // rim brighten
  gl_FragColor = vec4(col, uOpacity);
}
`;

export function createIridescent(
  a: THREE.Color,
  b: THREE.Color,
  c: THREE.Color
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uA: { value: a },
      uB: { value: b },
      uC: { value: c },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: true,
    toneMapped: false,
  });
}
```

- [ ] **Step 2: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no errors.
```bash
git add src/scene/materials/iridescent.ts
git commit -m "feat(scene): reusable iridescent shader material"
```

---

### Task 5: The `Forge` object — planet + shards

**Files:**
- Create: `src/scene/objects/Forge.tsx`

**Interfaces:**
- Consumes: `buildShardSeeds`, `computeForge` (Tasks 2–3); `createIridescent` (Task 4); `getSectionProgress` from `src/animations/scroll`; `ThemeColors` from `src/scene/hooks/useThemeColors`.
- Produces: `export default function Forge({ theme, position }: { theme: ThemeColors; position: [number, number, number] })`.

- [ ] **Step 1: Write the component**

`src/scene/objects/Forge.tsx`:
```tsx
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress } from '../../animations/scroll';
import { buildShardSeeds, computeForge } from '../forge/forgeLayout';
import { createIridescent } from '../materials/iridescent';
import type { ThemeColors } from '../hooks/useThemeColors';

/** Warm pole of the iridescent sheen (awards/gold accent — a fixed accent, not a theme token). */
const GOLD = new THREE.Color('#ffd56b');
/** Carry-forward target, relative to the forge origin: up and toward the Experience beacon. */
const BEACON = new THREE.Vector3(-2.0, 1.6, -2.0);

/** Additive "charge" shell — the planet glows hotter as it nears detonation. */
const CHARGE_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vView;
void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vN=normalize(mat3(modelMatrix)*normal);
  vView=normalize(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }
`;
const CHARGE_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vView;
void main(){ float rim=pow(1.0-max(dot(vN,vView),0.0),2.0); gl_FragColor=vec4(uColor, rim*uOpacity); }
`;

/**
 * The Skills "Forge": an iridescent planet that charges and detonates into 17
 * drifting crystal shards as the #skills section scrolls through view. Pure
 * scroll-driven (computeForge), no React state, no pointer interaction — the
 * canvas is pointer-events:none in Phase 1.
 */
export default function Forge({
  theme,
  position,
}: {
  theme: ThemeColors;
  position: [number, number, number];
}) {
  const seeds = useMemo(() => buildShardSeeds(), []);
  const sections = getSectionProgress();
  const time = useRef(0);

  const planetGroup = useRef<THREE.Group>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);

  const planetMat = useMemo(() => createIridescent(theme.primary, theme.secondary, GOLD), [theme]);
  const shardMats = useMemo(
    () => seeds.map(() => createIridescent(theme.primary, theme.secondary, GOLD)),
    [seeds, theme]
  );
  const shardGeo = useMemo(() => new THREE.IcosahedronGeometry(0.18, 0), []);
  const chargeUniforms = useMemo(
    () => ({ uColor: { value: theme.primary }, uOpacity: { value: 0 } }),
    [theme]
  );

  useEffect(() => {
    return () => {
      planetMat.dispose();
      shardMats.forEach((m) => m.dispose());
      shardGeo.dispose();
    };
  }, [planetMat, shardMats, shardGeo]);

  useFrame((_, delta) => {
    time.current += delta;
    const st = computeForge(sections.skills, seeds, time.current, BEACON);

    const pg = planetGroup.current;
    if (pg) {
      pg.visible = st.planetOpacity > 0.01;
      pg.scale.setScalar(st.planetScale);
      pg.rotation.y += delta * 0.1;
    }
    planetMat.uniforms.uOpacity.value = st.planetOpacity;
    chargeUniforms.uOpacity.value = st.planetCharge * st.planetOpacity;

    for (let i = 0; i < seeds.length; i++) {
      const m = shardRefs.current[i];
      const tr = st.shards[i];
      if (!m) continue;
      m.visible = tr.opacity > 0.01;
      m.position.copy(tr.pos);
      m.rotation.copy(tr.rot);
      m.scale.setScalar(tr.scale);
      shardMats[i].uniforms.uOpacity.value = tr.opacity;
    }
  });

  return (
    <group position={position}>
      <group ref={planetGroup}>
        <mesh material={planetMat}>
          <sphereGeometry args={[0.9, 48, 48]} />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <shaderMaterial
            vertexShader={CHARGE_VERT}
            fragmentShader={CHARGE_FRAG}
            uniforms={chargeUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {seeds.map((s, i) => (
        <mesh
          key={s.id}
          geometry={shardGeo}
          material={shardMats[i]}
          visible={false}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
        />
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/scene/objects/Forge.tsx
git commit -m "feat(forge): Forge object — iridescent planet + 17 smash shards"
```

---

### Task 6: Wire into the scene, retire the old skill visuals, verify

**Files:**
- Modify: `src/scene/SceneRoot.tsx`

**Interfaces:**
- Consumes: `Forge` (Task 5).

- [ ] **Step 1: Mount the Forge, remove the old skill objects**

In `src/scene/SceneRoot.tsx`:
- Remove the imports for `SkillNodes` and `SkillConstellationLines`, and add `import Forge from './objects/Forge';`.
- Remove the `<SkillNodes theme={theme} />` and `<SkillConstellationLines theme={theme} />` lines from the returned graph.
- Add a `FORGE_POS` constant near the other position constants and mount the Forge:

```tsx
/** The Skills "Forge" planet — placed ahead of the Skills camera waypoint. TUNE by observation. */
const FORGE_POS: [number, number, number] = [3.0, -0.2, 9.2];
```
```tsx
      {/* Skills act — the Forge replaces the old skill constellation */}
      <Forge theme={theme} position={FORGE_POS} />
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (confirm no remaining references to the removed components).

- [ ] **Step 3: Run the app and watch the smash**

Run: `npm run dev` (port 3000).
Then drive the browser (chrome-devtools MCP): navigate to `http://localhost:3000`, scroll slowly into the **Skills** (`#skills`) section, and confirm:
- the iridescent planet is visible and centered in frame as Skills enters (if off-frame, adjust `FORGE_POS`);
- as you scroll, it charges (rim glow brightens), then **detonates** into shards that fly outward and tumble;
- continuing to scroll streaks the shards away and fades them before Experience;
- **scrolling back up re-assembles** the planet;
- the console has no errors/warnings; the old skill stars are gone.

Take a `take_screenshot` mid-smash for the record.

- [ ] **Step 4: Tune `FORGE_POS` if needed**

If the planet sits off-frame or too large/small, adjust `FORGE_POS` (and, if necessary, the planet `sphereGeometry` radius `0.9` in `Forge.tsx`) and re-observe. Repeat until the smash is framed during the Skills dwell.

- [ ] **Step 5: Final type-check and commit**

Run: `npx tsc --noEmit` and `npm test`
Expected: both clean.
```bash
git add src/scene/SceneRoot.tsx
git commit -m "feat(forge): mount the Forge in the Skills act, retire old skill viz"
```

---

## Self-Review

**Spec coverage (Phase 1 scope):**
- Continuous descent / Skills region → Forge mounted in the Skills act (Task 6). ✓
- "Smash a planet → 17 shards" → `computeForge` + `Forge` render 17 shards, one per skill (Tasks 3, 5). ✓
- Iridescent objects on a dark stage → `createIridescent` material; dark stage is the existing scene background (Task 4). ✓
- Scroll-driven, continuous flow, reversible → pure progress-driven `computeForge`, no pin (Task 3). ✓
- Carry-forward toward Experience (no cut) → `carry` ramp lerps shards to `BEACON` (Task 3). ✓
- Mobile / reduced-motion fallback → inherited `shouldRenderScene` gate + existing `HoloSkills` DOM; nothing to build (Global Constraints). ✓
- *Deferred to Phase 2 (correctly out of scope here):* pointer hover/drag/click, matter-js physics, orbital holo-fragments, `Skill` data enrichment, retiring `HoloSkills`. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; `FORGE_POS` is given a concrete starting value with an explicit observe-and-tune step (visual positioning genuinely requires observation). ✓

**Type consistency:** `buildShardSeeds`/`ShardSeed`, `computeForge`/`ForgeState`/`ShardTransform`/`DETONATE`, `createIridescent` names are used identically across Tasks 2–6. `Forge` prop shape (`theme`, `position`) matches the `SceneRoot` call site. ✓

---

## Notes for the next cycle (Phase 2 — not this plan)

Build the hands-on play: a `pointer-events:auto` DOM hit-layer over `#skills` that maps the cursor into a **matter-js** screen-space sim during the dwell; the Forge shards mirror those body transforms; hover → bloom + label, drag → throw, click → focus + **orbital holo-fragments**. This is where `Skill` gains `category` / `blurb` / `usedIn` / `level` (in `types.ts` + `constants.ts`, with a Vitest data-integrity test: every skill populated, `usedIn` ids exist in `PROJECTS`), and where the `HoloSkills` DOM section is replaced by the in-world content. Then replicate the region pattern for About, Experience, Projects, Contact — each its own spec → plan.
