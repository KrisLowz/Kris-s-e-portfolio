# The Forge Stage — Interactive Readable Skills (Phase 2a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `#skills` DOM nebula with an interactive, readable foreground stage: 17 iridescent 3D crystals you hover (bloom + label) and click (holographic info-panel), backed by enriched per-skill data — with a readable DOM fallback on mobile/reduced-motion.

**Architecture:** A new `ForgeStage` DOM section (keeps `id="skills"` so existing scroll triggers and the Phase 1 background smash keep working) renders, on capable desktops, a **dedicated foreground R3F `<Canvas>` with `pointer-events:auto`** inside a `position:sticky` wrapper (a robust "play stage" dwell without GSAP-pin conflicts). The canvas renders the crystals; R3F pointer events drive hover/click; a DOM overlay shows the holo info. This sidesteps the background canvas's `pointer-events:none` constraint entirely. On mobile/reduced-motion it renders a readable DOM skill grid from the same data.

**Tech Stack:** React 19 + TypeScript, three `~0.184`, `@react-three/fiber ^9.6.1`, `@react-three/drei ^10.7.7` (`<Html>`), Vite 6, Vitest. Reuses Phase 1's `createIridescent` material and `buildShardSeeds` layout.

**This is Phase 2a of the Phase 2 cycle.** 2a = interactive + readable (this plan). 2b = `matter-js` grab/throw physics. 2c = carry-forward continuity, fallback parity polish, retire the old `HoloSkills` file. Throw physics is explicitly OUT of 2a — shards idle-drift and respond to hover/click only.

## Global Constraints

- **Data lives in `constants.ts`**, typed by `types.ts`; it is the single source of truth (also feeds the chatbot `SYSTEM_INSTRUCTION`). `SKILLS.length` stays **17**.
- **`usedIn` values must be real `PROJECTS` ids:** exactly `'trackpoint'`, `'cinemate'`, `'splashaquatics'`.
- **`level` is 1–5** and must be honest (owner reviews — do not over-claim). These are DRAFT values pending owner sign-off.
- **Capability gate:** the interactive canvas renders only when `shouldRenderScene()` is true (import from `src/scene/capability`). Otherwise render the readable DOM fallback. Never ship a phones-get-nothing path.
- **Theme colors** come from CSS vars / the established `useThemeColors()` (inside a Canvas) or `getComputedStyle` (in DOM) — never hard-code hex except the fixed `GOLD` accent already used in Phase 1.
- **Glow idiom:** iridescent material via `createIridescent` (`toneMapped:false`, `transparent`, `depthWrite:false`).
- **Type-check is the gate:** `npx tsc --noEmit` clean. `npm test` (Vitest) green.
- **Dev server:** `npm run dev` → port 3000. Visual tasks are verified in-browser (chrome-devtools): navigate, scroll into `#skills`, observe, screenshot, console clean.
- **`@` alias = repo root.** Versions verbatim: react `^19.2.0`, three `~0.184.0`, fiber `^9.6.1`, drei `^10.7.7`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/types.ts` (modify) | Extend `Skill` with `category`, `blurb`, `usedIn`, `level`. |
| `src/constants.ts` (modify) | Populate the 4 new fields on all 17 skills (DRAFT, owner-reviewed). |
| `src/scene/forge/skillData.ts` (new) | Pure helper: `skillUsedInTitles(id)` → project titles for a skill (used by the panel). Keeps lookups out of components. |
| `src/scene/forge/skillData.test.ts` (new) | Vitest: data integrity (all fields present, `usedIn` ids valid, `level` 1–5) + the helper. |
| `src/components/ForgeStage.tsx` (new) | The new `#skills` section: sticky stage; gates to the interactive canvas (desktop) or the DOM fallback grid (mobile/reduced-motion). |
| `src/scene/forge/ForgeStageScene.tsx` (new) | The R3F scene rendered inside `ForgeStage`'s canvas: 17 idle-drifting iridescent shards + hover/click handling, emits the focused skill id. |
| `src/components/ForgeHoloPanel.tsx` (new) | DOM overlay: the orbital holo info-fragments for the focused skill. |
| `src/App.tsx` (modify) | Replace `<HoloSkills />` with `<ForgeStage />`. (`HoloSkills.tsx` stays on disk; retired in 2c.) |

---

### Task 1: Enrich the skill data + integrity test

**Files:**
- Modify: `src/types.ts`
- Modify: `src/constants.ts`
- Create: `src/scene/forge/skillData.ts`
- Test: `src/scene/forge/skillData.test.ts`

**Interfaces:**
- Consumes: `SKILLS`, `PROJECTS` from `src/constants.ts`.
- Produces: extended `Skill` (`category: string; blurb: string; usedIn: string[]; level: 1|2|3|4|5`); `skillUsedInTitles(id: string): string[]`.

- [ ] **Step 1: Extend the `Skill` type**

In `src/types.ts`, replace the `Skill` interface:
```ts
export interface Skill {
  id: string;
  name: string;
  iconClass: string;
  ring: 'inner' | 'outer';
  /** Short grouping shown on the holo panel, e.g. "Mobile · Language". */
  category: string;
  /** One-line human truth about the skill. */
  blurb: string;
  /** PROJECTS ids where this was used (may be empty). */
  usedIn: string[];
  /** Signal-strength 1–5 (honest, owner-reviewed). */
  level: 1 | 2 | 3 | 4 | 5;
}
```

- [ ] **Step 2: Populate all 17 skills (DRAFT — owner reviews levels)**

In `src/constants.ts`, replace the `SKILLS` array entries with these (keep `id`/`name`/`iconClass`/`ring` exactly as they are; add the 4 fields):
```ts
export const SKILLS: Skill[] = [
  { id: 'skill-html5', name: 'HTML5', iconClass: 'devicon-html5-plain colored', ring: 'inner', category: 'Frontend · Markup', blurb: 'Semantic structure under every web UI I build.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-css3', name: 'CSS3', iconClass: 'devicon-css3-plain colored', ring: 'inner', category: 'Frontend · Styling', blurb: 'Hand-built layouts, responsive design, and motion.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-javascript', name: 'JavaScript', iconClass: 'devicon-javascript-plain colored', ring: 'inner', category: 'Frontend · Language', blurb: 'Interactivity across all my web projects.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-python', name: 'Python', iconClass: 'devicon-python-plain colored', ring: 'inner', category: 'Backend · Language', blurb: 'My go-to for backend logic, data, and ML glue.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-java', name: 'Java', iconClass: 'devicon-java-plain colored', ring: 'inner', category: 'Language', blurb: 'OOP foundation from coursework and Android roots.', usedIn: [], level: 3 },
  { id: 'skill-cpp', name: 'C++', iconClass: 'devicon-cplusplus-plain colored', ring: 'inner', category: 'Language', blurb: 'Systems-level problem solving and algorithms.', usedIn: [], level: 3 },
  { id: 'skill-csharp', name: 'C#', iconClass: 'devicon-csharp-plain colored', ring: 'inner', category: 'Language', blurb: 'OOP and .NET coursework.', usedIn: [], level: 3 },
  { id: 'skill-sql', name: 'SQL', iconClass: 'devicon-mysql-plain colored', ring: 'inner', category: 'Data · Query', blurb: 'Relational queries behind my full-stack apps.', usedIn: ['splashaquatics'], level: 4 },
  { id: 'skill-figma', name: 'Figma', iconClass: 'devicon-figma-plain colored', ring: 'outer', category: 'Design · Tool', blurb: 'Wireframes and prototypes before I build.', usedIn: ['trackpoint'], level: 3 },
  { id: 'skill-tailwind', name: 'Tailwind CSS', iconClass: 'devicon-tailwindcss-original colored', ring: 'outer', category: 'Frontend · Styling', blurb: 'Utility-first styling for fast, consistent UI.', usedIn: [], level: 3 },
  { id: 'skill-postgresql', name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain colored', ring: 'outer', category: 'Data · Database', blurb: 'Relational data modeling and queries.', usedIn: [], level: 3 },
  { id: 'skill-firebase', name: 'Firebase', iconClass: 'devicon-firebase-plain colored', ring: 'outer', category: 'Backend · BaaS', blurb: 'Realtime sync and auth that powered TrackPoint.', usedIn: ['trackpoint'], level: 4 },
  { id: 'skill-kotlin', name: 'Kotlin', iconClass: 'devicon-kotlin-plain colored', ring: 'outer', category: 'Mobile · Language', blurb: 'My primary Android language — built TrackPoint with it.', usedIn: ['trackpoint'], level: 4 },
  { id: 'skill-flutter', name: 'Flutter', iconClass: 'devicon-flutter-plain colored', ring: 'outer', category: 'Mobile · Framework', blurb: 'Cross-platform mobile UI.', usedIn: [], level: 3 },
  { id: 'skill-android', name: 'Android', iconClass: 'devicon-android-plain colored', ring: 'outer', category: 'Mobile · Platform', blurb: 'Native Android app development.', usedIn: ['trackpoint'], level: 4 },
  { id: 'skill-git', name: 'Git', iconClass: 'devicon-git-plain colored', ring: 'outer', category: 'Tooling · VCS', blurb: 'Version control on every project I touch.', usedIn: [], level: 4 },
  { id: 'skill-vscode', name: 'VS Code', iconClass: 'devicon-vscode-plain colored', ring: 'outer', category: 'Tooling · Editor', blurb: 'My daily driver editor.', usedIn: [], level: 4 },
];
```

- [ ] **Step 3: Write the failing integrity test**

`src/scene/forge/skillData.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { SKILLS, PROJECTS } from '../../constants';
import { skillUsedInTitles } from './skillData';

describe('SKILLS data integrity', () => {
  const projectIds = new Set(PROJECTS.map((p) => p.id));

  it('still has 17 skills', () => {
    expect(SKILLS).toHaveLength(17);
  });

  it('every skill has a non-empty category and blurb', () => {
    for (const s of SKILLS) {
      expect(s.category.trim().length, s.id).toBeGreaterThan(0);
      expect(s.blurb.trim().length, s.id).toBeGreaterThan(0);
    }
  });

  it('every usedIn id is a real project', () => {
    for (const s of SKILLS) {
      expect(Array.isArray(s.usedIn), s.id).toBe(true);
      for (const pid of s.usedIn) expect(projectIds.has(pid), `${s.id}->${pid}`).toBe(true);
    }
  });

  it('every level is an integer 1..5', () => {
    for (const s of SKILLS) {
      expect(Number.isInteger(s.level), s.id).toBe(true);
      expect(s.level, s.id).toBeGreaterThanOrEqual(1);
      expect(s.level, s.id).toBeLessThanOrEqual(5);
    }
  });
});

describe('skillUsedInTitles', () => {
  it('maps a skill to its project titles', () => {
    expect(skillUsedInTitles('skill-kotlin')).toEqual(['TrackPoint']);
  });
  it('returns [] for an unused skill', () => {
    expect(skillUsedInTitles('skill-vscode')).toEqual([]);
  });
  it('returns [] for an unknown id', () => {
    expect(skillUsedInTitles('nope')).toEqual([]);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `skillData` module not found.

- [ ] **Step 5: Implement the helper**

`src/scene/forge/skillData.ts`:
```ts
import { SKILLS, PROJECTS } from '../../constants';

/** Project titles a skill was used in (in PROJECTS order), or [] if none/unknown. */
export function skillUsedInTitles(skillId: string): string[] {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return [];
  return PROJECTS.filter((p) => skill.usedIn.includes(p.id)).map((p) => p.title);
}
```

- [ ] **Step 6: Run tests + type-check**

Run: `npm test` (expected: all green, including the new integrity tests) then `npx tsc --noEmit` (expected: clean — confirms every `SKILLS` entry satisfies the new required fields).

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/constants.ts src/scene/forge/skillData.ts src/scene/forge/skillData.test.ts
git commit -m "feat(skills): enrich Skill data (category/blurb/usedIn/level) + integrity test"
```

---

### Task 2: The sticky interactive stage (idle shards, gated, with DOM fallback)

**Files:**
- Create: `src/components/ForgeStage.tsx`
- Create: `src/scene/forge/ForgeStageScene.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `SKILLS` (enriched); `createIridescent` from `src/scene/materials/iridescent`; `shouldRenderScene` from `src/scene/capability`; `Canvas` from `@react-three/fiber`.
- Produces: `ForgeStage` default export (the new `#skills` section); `ForgeStageScene` taking `{ onFocus: (id: string | null) => void; focusedId: string | null }` (focus wiring is filled in Task 3–4 — for Task 2 the props exist but only idle rendering is implemented).

- [ ] **Step 1: The R3F scene — 17 idle-drifting iridescent shards**

`src/scene/forge/ForgeStageScene.tsx`:
```tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SKILLS } from '../../constants';
import { createIridescent } from '../materials/iridescent';

const GOLD = new THREE.Color('#ffd56b');

/** Read two theme colors from CSS once (the stage canvas is short-lived per view). */
function readThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  const get = (v: string, fb: string) => (cs.getPropertyValue(v).trim() || fb);
  return {
    primary: new THREE.Color(get('--accent-primary', '#00E5FF')),
    secondary: new THREE.Color(get('--accent-secondary', '#a855f7')),
  };
}

/** Lay the 17 shards on a loose, camera-facing ellipse cloud (deterministic). */
function layout(): THREE.Vector3[] {
  const n = SKILLS.length;
  return SKILLS.map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    const ring = i % 2 === 0 ? 1 : 1.7;
    return new THREE.Vector3(Math.cos(a) * 2.6 * ring, Math.sin(a) * 1.5 * ring, (i % 3 - 1) * 0.6);
  });
}

export default function ForgeStageScene({
  onFocus,
  focusedId,
}: {
  onFocus: (id: string | null) => void;
  focusedId: string | null;
}) {
  const positions = useMemo(() => layout(), []);
  const colors = useMemo(() => readThemeColors(), []);
  const mats = useMemo(
    () => SKILLS.map(() => createIridescent(colors.primary, colors.secondary, GOLD)),
    [colors]
  );
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.42, 0), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < positions.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      m.position.set(positions[i].x, positions[i].y + Math.sin(t * 0.5 + i) * 0.12, positions[i].z);
      m.rotation.x += 0.003;
      m.rotation.y += 0.004;
    }
  });

  // Task 2 renders idle shards only; onFocus/focusedId are wired in Tasks 3–4.
  void onFocus; void focusedId;

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 6]} intensity={40} />
      {SKILLS.map((s, i) => (
        <mesh
          key={s.id}
          geometry={geo}
          material={mats[i]}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 2: The stage wrapper (sticky canvas on desktop, readable grid otherwise)**

`src/components/ForgeStage.tsx`:
```tsx
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SKILLS } from '../constants';
import { shouldRenderScene } from '../scene/capability';
import ForgeStageScene from '../scene/forge/ForgeStageScene';

/** The Skills act — an interactive "Forge" stage on capable desktops, a readable
 *  grid otherwise. Keeps id="skills" so existing scroll triggers + the background
 *  smash keep firing. */
export default function ForgeStage() {
  const [interactive] = useState(shouldRenderScene);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  if (!interactive) {
    return (
      <section id="skills" className="relative py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-display mb-8 text-pop-text-main">Dev Stack</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SKILLS.map((s) => (
            <li key={s.id} className="rounded-lg border border-pop-surface/40 p-3">
              <div className="flex items-center gap-2">
                <i className={s.iconClass} aria-hidden />
                <span className="font-medium text-pop-text-main">{s.name}</span>
              </div>
              <p className="text-xs text-pop-text-muted mt-1">{s.category}</p>
              <p className="text-sm text-pop-text-muted mt-1">{s.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id="skills" className="relative" style={{ minHeight: '220vh' }}>
      <div className="sticky top-0 h-screen w-full">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ pointerEvents: 'auto' }}>
          <ForgeStageScene onFocus={setFocusedId} focusedId={focusedId} />
        </Canvas>
        {/* ForgeHoloPanel overlay is added in Task 4, driven by focusedId */}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Swap it into the page**

In `src/App.tsx`: replace `import HoloSkills from './components/HoloSkills';` with `import ForgeStage from './components/ForgeStage';`, and replace `<HoloSkills />` with `<ForgeStage />`. Leave `HoloSkills.tsx` on disk (retired in 2c).

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify in the browser**

`npm run dev`, then via chrome-devtools navigate to `http://localhost:3000`, scroll into `#skills`. Confirm: a foreground field of 17 iridescent crystals idle-drifts and is centered/framed (adjust the `layout()` radii or camera `position`/`fov` if clipped); the console is clean; the page still scrolls past the stage onto Experience. Screenshot it. (Hover/click do nothing yet — that's Tasks 3–4.) Then emulate a mobile viewport / `prefers-reduced-motion` and confirm the readable DOM grid renders instead.

- [ ] **Step 6: Commit**

```bash
git add src/components/ForgeStage.tsx src/scene/forge/ForgeStageScene.tsx src/App.tsx
git commit -m "feat(forge): interactive Skills stage scaffold + DOM fallback"
```

---

### Task 3: Hover → bloom + label

**Files:**
- Modify: `src/scene/forge/ForgeStageScene.tsx`

**Interfaces:**
- Consumes: the Task 2 scene.
- Produces: hover state driving per-shard bloom; a drei `<Html>` label at the hovered shard.

- [ ] **Step 1: Add hover state, bloom, and a label**

In `ForgeStageScene.tsx`: import `Html` from `@react-three/drei` and `useState`. Track `const [hovered, setHovered] = useState<number | null>(null);`. On each `<mesh>` add `onPointerOver={(e) => { e.stopPropagation(); setHovered(i); document.body.style.cursor = 'pointer'; }}` and `onPointerOut={() => { setHovered(null); document.body.style.cursor = ''; }}`. In `useFrame`, scale the hovered shard toward `1.5` and others toward `1.0` (exponential damping); raise the hovered material's `uOpacity`/brightness if desired. Render, when `hovered != null`, a label:
```tsx
{hovered != null && (
  <Html position={positions[hovered]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
    <div className="px-2 py-1 rounded bg-[rgba(9,16,30,.85)] border border-[rgba(0,229,255,.5)] text-[11px] font-mono text-[#bfe9ff] whitespace-nowrap">
      {SKILLS[hovered].name}
    </div>
  </Html>
)}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Verify in the browser**

Dev server + chrome-devtools: hover crystals — the hovered one blooms and a label with the correct skill name appears; neighbors settle back; cursor becomes a pointer. Console clean. Screenshot a hover. (Tune bloom scale / damping by observation.)

- [ ] **Step 4: Commit**

```bash
git add src/scene/forge/ForgeStageScene.tsx
git commit -m "feat(forge): hover bloom + skill label on stage shards"
```

---

### Task 4: Click → holographic info panel

**Files:**
- Create: `src/components/ForgeHoloPanel.tsx`
- Modify: `src/scene/forge/ForgeStageScene.tsx` (wire `onFocus` on click)
- Modify: `src/components/ForgeStage.tsx` (render the panel from `focusedId`)

**Interfaces:**
- Consumes: `focusedId` (skill id or null); `skillUsedInTitles` (Task 1); enriched `SKILLS`.
- Produces: `ForgeHoloPanel({ skillId, onClose }: { skillId: string; onClose: () => void })`.

- [ ] **Step 1: Click selects/deselects a shard**

In `ForgeStageScene.tsx`, add to each `<mesh>`: `onClick={(e) => { e.stopPropagation(); onFocus(focusedId === SKILLS[i].id ? null : SKILLS[i].id); }}`. In `useFrame`, give the focused shard a stronger bloom (e.g. scale `1.7`, slow spin) so it reads as "in focus".

- [ ] **Step 2: The holo panel (orbital fragments)**

`src/components/ForgeHoloPanel.tsx`:
```tsx
import { SKILLS } from '../constants';
import { skillUsedInTitles } from '../scene/forge/skillData';

/** Diegetic holo readout for a focused skill — data as fragments, not a plain card. */
export default function ForgeHoloPanel({ skillId, onClose }: { skillId: string; onClose: () => void }) {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return null;
  const projects = skillUsedInTitles(skill.id);
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 pointer-events-auto bg-transparent cursor-default"
      />
      <div className="relative pointer-events-none text-center font-mono">
        <div className="text-[#00E5FF] text-2xl font-bold tracking-wide">{skill.name}</div>
        <div className="text-[11px] text-[#bfe9ff] mt-1">{skill.category}</div>
        <p className="text-sm text-[#9fb6d6] max-w-xs mx-auto mt-3">{skill.blurb}</p>
        {projects.length > 0 && (
          <div className="mt-3 text-[12px] text-[#ffb86b]">deployed in · {projects.join(' · ')}</div>
        )}
        <div className="mt-3 flex gap-1 justify-center" aria-label={`signal strength ${skill.level} of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className="h-1.5 w-7 rounded-sm"
              style={{ background: n <= skill.level ? 'linear-gradient(90deg,#00E5FF,#a855f7)' : 'rgba(255,255,255,.12)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Render the panel from the stage**

In `ForgeStage.tsx`, inside the sticky `<div>`, after the `<Canvas>`:
```tsx
{focusedId && <ForgeHoloPanel skillId={focusedId} onClose={() => setFocusedId(null)} />}
```
and `import ForgeHoloPanel from './ForgeHoloPanel';`.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify in the browser**

Dev server + chrome-devtools: click a crystal → it focuses (stronger bloom) and the holo panel shows the right name, category, blurb, project chips (e.g. Kotlin → "deployed in · TrackPoint"), and a signal bar matching `level`. Click the backdrop → panel closes, shard relaxes. Console clean. Screenshot Kotlin's panel.

- [ ] **Step 6: Commit**

```bash
git add src/components/ForgeHoloPanel.tsx src/scene/forge/ForgeStageScene.tsx src/components/ForgeStage.tsx
git commit -m "feat(forge): click-to-focus holo info panel on stage shards"
```

---

## Self-Review

**Spec coverage (Phase 2a scope):**
- Interactive foreground stage replacing the flat DOM → `ForgeStage` swapped for `HoloSkills` (Task 2). ✓
- Hover bloom + label → Task 3. ✓
- Click → orbital holo info-fragments (name, category, blurb, project chip, signal bar) → Task 4. ✓
- Enriched data (category/blurb/usedIn/level) + integrity → Task 1. ✓
- Capability gate + readable mobile/reduced-motion fallback → `ForgeStage` branch (Task 2). ✓
- "Play stage" dwell → `position:sticky` canvas (Task 2), no GSAP-pin conflict. ✓
- *Out of scope, correctly deferred:* matter-js grab/throw (2b); carry-forward continuity + retiring `HoloSkills` (2c).

**Placeholder scan:** No TBD/TODO. Task 1 ships complete data + complete tests. Tasks 2–4 give complete component code; the visual tuning steps (layout radii, camera, bloom scale) are explicit observe-and-adjust steps — genuine visual calibration, not vague placeholders. The `level` values are explicitly DRAFT pending owner review (a Global Constraint), not a code placeholder.

**Type consistency:** `Skill` (Task 1) fields are read identically in `ForgeStageScene`/`ForgeHoloPanel`. `ForgeStageScene` prop shape `{ onFocus, focusedId }` matches the `ForgeStage` call site across Tasks 2–4. `skillUsedInTitles` signature is stable Task 1 → Task 4.

---

## Notes for 2b / 2c

- **2b:** add `matter-js` (already installed) screen-space bodies for the 17 shards; map cursor → world for drag/throw; the shards' `position` in `ForgeStageScene` reads matter-js bodies during the dwell instead of the idle `layout()`. Bound the world so shards stay on-stage.
- **2c:** streak the stage shards toward the Experience beacon as the sticky dwell ends (continuity with the background world); reach fallback parity (the DOM grid gets the same holo-panel-on-tap); delete `HoloSkills.tsx` and its imports.
- **Owner action before launch:** review the 17 `level` values and `blurb`s in `constants.ts` for honesty.
