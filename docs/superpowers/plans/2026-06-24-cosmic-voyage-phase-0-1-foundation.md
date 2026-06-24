# Cosmic Voyage — Phase 0 + Phase 1 (Foundation + Readable Static Voyage) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tear down the current portfolio and rebuild a fresh foundation plus a fully readable, on-theme, navigable "cosmic cyberpunk voyage" — all six content sections standing with real content, cinematic headings, and static cutout art — without the scroll timelines or interactive scenes (those are later phases).

**Architecture:** DOM-cutout + GSAP. Layered transparent PNG `<img>` sprites + real HTML content, driven by a small GSAP/ScrollTrigger reveal engine over Lenis smooth scroll. No React Three Fiber. Content lives in `src/content/` data modules (single source of truth); motion lives in `src/motion/`; story UI lives in `src/components/story/`.

**Tech Stack:** React 19 + TypeScript + Vite 6, Tailwind 3 (class dark mode), GSAP 3.15 (+ScrollTrigger +SplitText), Lenis 1.3, Vitest 2 for pure-logic tests, Devicon (skill icons via CDN).

## Global Constraints

- **Supersedes** the v2 R3F voyage/Forge code — it is deleted, not ported. Keep only the toolchain, the factual content, and `/assets/world/` art.
- **No React Three Fiber / Three.js in v1.** Do not import `@react-three/*`, `three`, or `matter-js` in new code.
- **Dark-only** cosmic theme. No light mode, no theme toggle.
- **Accessibility:** every clickable sprite is a real `<button>`/`<a>`; decorative images use `alt="" aria-hidden="true"`; reduced motion must show all content.
- **Path alias:** `@` resolves to the repo root (e.g. `import { PROFILE } from '@/src/content'`). Prefer relative imports inside `src/`.
- **Skills invariant:** `SKILLS.length === 17` (8 inner ring + 9 outer ring).
- **Assets:** reference by absolute path from site root (e.g. `/assets/world/hero/portfolio-spaceship-cutout.png`). Never `src/assets/...`.
- **Images** go under `public/assets/`. World art already exists under `public/assets/world/`.
- **Commits:** one per task minimum; end every commit body with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Type check** is `npx tsc --noEmit`. **Tests** are `npx vitest run`.

---

## File Structure

**Created:**
- `src/content/profile.ts` · `about.ts` · `skills.ts` · `projects.ts` · `experience.ts` · `story.ts` · `chatbot.ts` · `index.ts` — content modules (single source of truth).
- `src/content/content.test.ts` — data-invariant tests.
- `src/story/worldAssets.ts` — `WORLD_ASSETS` path map.
- `src/motion/config.ts` · `register.ts` · `engine.ts` · `scroll.ts` · `smooth.ts` · `useMotion.ts` — motion core.
- `src/motion/config.test.ts` — config-resolution test.
- `src/components/story/StoryWorldLayer.tsx` · `StoryHUD.tsx` · `SectionRouteProgress.tsx` · `AnimatedSectionHeading.tsx` · `StoryCursor.tsx` · `StoryBootPreloader.tsx`.
- `src/components/story/hero/HeroLaunch.tsx`
- `src/components/story/about/OriginDossier.tsx`
- `src/components/story/skills/SkillField.tsx`
- `src/components/story/experience/MissionArchive.tsx`
- `src/components/story/projects/ProjectWorldRoute.tsx` · `ProjectModal.tsx`
- `src/components/story/contact/RelayConsole.tsx`
- `src/components/story/ending/VoyageCompleteFooter.tsx`

**Modified:**
- `src/types.ts` — add `StoryActId`, `MascotState`, `StoryAct`.
- `src/App.tsx` — reduced to the new story shell.
- `src/style.css` — rewritten to the dark cosmic theme.
- `tailwind.config.js` — cosmic tokens + fonts.
- `index.html` — fonts, dark theme, meta/OG.

**Deleted (teardown):** `src/constants.ts`, `src/animations/**` (after porting), `src/scene/**`, `src/services/**`, every file in `src/components/**` except the new `src/components/story/**`, and `script.js` if present.

---

## Task 1: Content data modules + invariant tests

**Files:**
- Create: `src/content/profile.ts`, `about.ts`, `skills.ts`, `projects.ts`, `experience.ts`, `story.ts`, `chatbot.ts`, `index.ts`
- Create: `src/story/worldAssets.ts`
- Modify: `src/types.ts` (append story types)
- Test: `src/content/content.test.ts`

**Interfaces:**
- Produces: `PROFILE`, `ABOUT`, `SKILLS: Skill[]`, `PROJECTS: Project[]`, `EXPERIENCE: ExperienceItem[]`, `MISSION_RECORDS: ExperienceItem[]`, `SYSTEM_INSTRUCTION: string`, `STORY_ACTS: StoryAct[]` (all re-exported from `src/content/index.ts`); `WORLD_ASSETS` from `src/story/worldAssets.ts`.
- Types produced: `StoryActId`, `MascotState`, `StoryAct`.

- [ ] **Step 1: Append story types to `src/types.ts`**

```ts
export type StoryActId =
  | 'boot' | 'hero' | 'about' | 'skills'
  | 'experience' | 'projects' | 'contact' | 'end';

export type MascotState =
  | 'sleep' | 'wave' | 'pilot' | 'scan' | 'alarm'
  | 'aim' | 'celebrate' | 'archive' | 'relay' | 'goodbye';

export interface StoryAct {
  id: StoryActId;
  /** Short label shown in the route-progress nav. */
  label: string;
  /** DOM id of the section element this act maps to (empty for boot/end). */
  sectionId: string;
  /** Mascot pose for this act. */
  mascotState: MascotState;
  /** Accent hue (hex) used for tinting this act. */
  tint: string;
}
```

- [ ] **Step 2: Create the content modules**

Move the existing exports out of `src/constants.ts` into focused modules, keeping every value verbatim. `src/content/profile.ts`:

```ts
export const PROFILE = {
  name: 'Low Chee Fei',
  title: 'Software Developer',
  headline: 'Bridging Mobile Innovation with Enterprise Solutions',
  bio: `I am a Computer Science graduate from Swinburne University (Class of 2025) specializing in Software Development. With a strong foundation in both mobile application development and enterprise ERP implementation, I bridge the gap between user-centric design and robust backend systems. My passion lies in solving real-world inefficiencies through technology, demonstrated by my award-winning final year project.`,
  email: 'horuslow0218@gmail.com',
  location: 'Petaling Jaya, Selangor',
  status: 'Available for full-time roles & freelance',
  cv: '/assets/Low_Chee_Fei_CV.pdf',
  social: {
    github: 'https://github.com/KrisLowz',
    linkedin: 'https://www.linkedin.com/in/lowcheefei/',
  },
};
```

`src/content/about.ts`, `skills.ts`, `projects.ts`, `experience.ts`, `chatbot.ts`: copy `ABOUT`, `SKILLS`, `PROJECTS`, `EXPERIENCE`, and `SYSTEM_INSTRUCTION` respectively from the current `src/constants.ts` **unchanged** (the `Skill` objects already carry `ring`/`category`/`blurb`/`usedIn`/`level`). Each imports its types from `../types`. In `experience.ts`, after the existing `EXPERIENCE` array, add the two synthetic mission records the storyline needs:

```ts
import { ExperienceItem } from '../types';

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'one-erp',
    role: 'Intern - ERP Consultant',
    company: 'ONE ERP SOLUTIONS SDN BHD',
    period: 'Jan - March 2023',
    description: 'Contributed to the implementation lifecycle of Oracle JD Edwards (JDE) ERP systems.',
    skills: ['Oracle JDE', 'Database Management', 'Client Communication'],
  },
];

/** Experience rendered as a flight log: origin → real roles → open-to-work. */
export const MISSION_RECORDS: ExperienceItem[] = [
  {
    id: 'origin-2022',
    role: 'Began the journey',
    company: 'Swinburne University of Technology',
    period: '2022',
    description: 'Started Computer Science — foundation in software development.',
    skills: [],
  },
  ...EXPERIENCE,
  {
    id: 'open-to-work',
    role: 'Open to new missions',
    company: 'Available now',
    period: '2025 / Now',
    description: 'Available for full-time roles and freelance work.',
    skills: [],
  },
];
```

- [ ] **Step 3: Create `src/content/story.ts`**

```ts
import { StoryAct } from '../types';

export const STORY_ACTS: StoryAct[] = [
  { id: 'boot',       label: 'Boot',       sectionId: '',           mascotState: 'sleep',     tint: '#00E5FF' },
  { id: 'hero',       label: 'Launch',     sectionId: 'hero',       mascotState: 'wave',      tint: '#00E5FF' },
  { id: 'about',      label: 'Origin',     sectionId: 'about',      mascotState: 'scan',      tint: '#A855F7' },
  { id: 'skills',     label: 'Forge',      sectionId: 'skills',     mascotState: 'aim',       tint: '#00E5FF' },
  { id: 'experience', label: 'Archive',    sectionId: 'experience', mascotState: 'archive',   tint: '#3BE8B0' },
  { id: 'projects',   label: 'Worlds',     sectionId: 'projects',   mascotState: 'pilot',     tint: '#FF4FD8' },
  { id: 'contact',    label: 'Relay',      sectionId: 'contact',    mascotState: 'relay',     tint: '#FFB347' },
  { id: 'end',        label: 'End',        sectionId: '',           mascotState: 'goodbye',   tint: '#00E5FF' },
];

/** The six acts that map to real on-page sections (drives the nav). */
export const SECTION_ACTS = STORY_ACTS.filter((a) => a.sectionId !== '');
```

- [ ] **Step 4: Create `src/content/index.ts` barrel**

```ts
export { PROFILE } from './profile';
export { ABOUT } from './about';
export { SKILLS } from './skills';
export { PROJECTS } from './projects';
export { EXPERIENCE, MISSION_RECORDS } from './experience';
export { SYSTEM_INSTRUCTION } from './chatbot';
export { STORY_ACTS, SECTION_ACTS } from './story';
```

- [ ] **Step 5: Create `src/story/worldAssets.ts`**

```ts
export const WORLD_ASSETS = {
  mascot: '/assets/world/mascot/cyber-cat-mascot-cutout.png',
  mascotTurnaround: '/assets/world/mascot/cyber-cat-turnaround-cutout.png',
  spaceship: '/assets/world/hero/portfolio-spaceship-cutout.png',
  originPlanet: '/assets/world/about/origin-planet-cutout.png',
  skillCrystal: '/assets/world/skills/skill-crystal-cutout.png',
  projectPortal: '/assets/world/projects/project-portal-ring-cutout.png',
  satelliteRelay: '/assets/world/contact/satellite-relay-cutout.png',
  wormhole: '/assets/world/transitions/wormhole-transition-cutout.png',
  blackHole: '/assets/world/transitions/black-hole-portal-cutout.png',
} as const;

export type WorldAssetKey = keyof typeof WORLD_ASSETS;
```

- [ ] **Step 6: Write the failing invariant test `src/content/content.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { SKILLS, PROJECTS, STORY_ACTS, SECTION_ACTS, MISSION_RECORDS } from './index';
import { WORLD_ASSETS } from '../story/worldAssets';

describe('content invariants', () => {
  it('has exactly 17 skills split 8 inner / 9 outer', () => {
    expect(SKILLS).toHaveLength(17);
    expect(SKILLS.filter((s) => s.ring === 'inner')).toHaveLength(8);
    expect(SKILLS.filter((s) => s.ring === 'outer')).toHaveLength(9);
  });

  it('every skill.usedIn references a real project id', () => {
    const ids = new Set(PROJECTS.map((p) => p.id));
    for (const s of SKILLS) for (const u of s.usedIn) expect(ids).toContain(u);
  });

  it('every skill level is 1..5', () => {
    for (const s of SKILLS) expect(s.level).toBeGreaterThanOrEqual(1), expect(s.level).toBeLessThanOrEqual(5);
  });

  it('story has 8 acts; 6 map to sections', () => {
    expect(STORY_ACTS).toHaveLength(8);
    expect(SECTION_ACTS).toHaveLength(6);
  });

  it('mission records include origin and open-to-work bookends', () => {
    expect(MISSION_RECORDS[0].id).toBe('origin-2022');
    expect(MISSION_RECORDS[MISSION_RECORDS.length - 1].id).toBe('open-to-work');
  });

  it('all world assets point under /assets/world/', () => {
    for (const v of Object.values(WORLD_ASSETS)) expect(v.startsWith('/assets/world/')).toBe(true);
  });
});
```

- [ ] **Step 7: Run the test — expect FAIL**

Run: `npx vitest run src/content/content.test.ts`
Expected: FAIL (modules not found / not yet created when run before Steps 2–5; if written last, it passes — ensure the test is committed in the same task).

- [ ] **Step 8: Run the test — expect PASS**

Run: `npx vitest run src/content/content.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 9: Type-check and commit**

Run: `npx tsc --noEmit` → Expected: no errors (note: `src/constants.ts` still exists and still compiles; it is deleted in Task 4).

```bash
git add src/content src/story/worldAssets.ts src/types.ts
git commit -m "feat(content): migrate portfolio data into src/content modules + story acts"
```

---

## Task 2: Motion core (port the proven engine, cosmic-tuned)

**Files:**
- Create: `src/motion/config.ts`, `register.ts`, `engine.ts`, `scroll.ts`, `smooth.ts`, `useMotion.ts`
- Test: `src/motion/config.test.ts`

**Interfaces:**
- Produces: `CONFIG`, `dur(s)`, `revealDistance()` (config.ts); `gsap`, `ScrollTrigger`, `SplitText` (register.ts); `initEngine()`, `showAllStatic()`, `revertSplits()` (engine.ts); `initScrollProgress()`, `getScrollProgress()`, `getSectionProgress()`, `SectionKey` (scroll.ts); `initSmoothScroll()`, `destroySmoothScroll()` (smooth.ts); `useMotion()` hook (useMotion.ts).

- [ ] **Step 1: Port `register.ts`, `engine.ts`, `scroll.ts`, `smooth.ts`, `config.ts` from the existing animation layer**

These files already exist and are proven at `src/animations/{register,engine,scroll,smooth,config}.ts`. Copy each to `src/motion/` and apply these edits:
- All internal imports stay relative within `src/motion/` (e.g. `./register`, `./config`).
- In `config.ts`, keep the structure but set the cosmic tone: leave eases/durations/staggers as-is; ensure `toggles.smoothScroll`, `toggles.reveals`, `toggles.parallax`, `toggles.velocitySkew`, `toggles.sectionTint` exist. Remove any `scene3d`/`pins` toggles that referenced the deleted R3F layer (keep `pins` only if `engine.ts` still uses it; the ported engine has no pin logic, so drop `pins`).
- In `scroll.ts`, keep `SectionKey = 'hero'|'about'|'skills'|'experience'|'projects'|'contact'` and the `#hero…#contact` selectors and scrubbed per-section progress exactly as in the current file.
- In `engine.ts`, keep the full `data-anim` switch (`fade-up|fade-in|scale|pop|clip|clip-left|chars|words|lines|draw|draw-y`), `data-stagger`, `data-speed` parallax, `data-float`, `data-velocity`, `data-tint`, and `buildZoomOut` for `[data-zoom-out]`. No changes needed beyond import paths.

> This is a copy-with-path-fix of real existing files, not new authoring. Open each `src/animations/*` source, reproduce it under `src/motion/*`, fix imports.

- [ ] **Step 2: Create `src/motion/useMotion.ts`** (boots everything in one self-cleaning context)

```ts
import { useEffect } from 'react';
import { gsap } from './register';
import { CONFIG } from './config';
import { initEngine, revertSplits } from './engine';
import { initScrollProgress } from './scroll';
import { initSmoothScroll, destroySmoothScroll } from './smooth';

/** Boots Lenis smooth scroll + the GSAP reveal engine once, cleaned on unmount. */
export function useMotion(): void {
  useEffect(() => {
    if (CONFIG.reducedMotion) return; // reduced motion: nothing animates; CSS shows all
    initSmoothScroll();
    const ctx = gsap.context(() => {
      initScrollProgress();
      initEngine();
    });
    return () => {
      ctx.revert();
      revertSplits();
      destroySmoothScroll();
    };
  }, []);
}
```

If `src/animations/smooth.ts` does not already export `initSmoothScroll`/`destroySmoothScroll` with this shape, adapt the ported `smooth.ts` to expose exactly those two functions (Lenis create + RAF wire to `gsap.ticker`, and a destroy that stops the ticker callback and `lenis.destroy()`).

- [ ] **Step 3: Write `src/motion/config.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { CONFIG, dur, revealDistance } from './config';

describe('motion config', () => {
  it('exposes resolved capability flags', () => {
    expect(typeof CONFIG.reducedMotion).toBe('boolean');
    expect(typeof CONFIG.isMobile).toBe('boolean');
    expect(typeof CONFIG.isTouch).toBe('boolean');
  });
  it('dur() returns a positive number', () => {
    expect(dur(1)).toBeGreaterThan(0);
  });
  it('revealDistance() returns a positive number', () => {
    expect(revealDistance()).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Run tests + type-check — expect PASS / clean**

Run: `npx vitest run src/motion/config.test.ts` → Expected: PASS (3 tests).
Run: `npx tsc --noEmit` → Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/motion
git commit -m "feat(motion): port GSAP+Lenis reveal engine into src/motion"
```

---

## Task 3: Cosmic dark theme

**Files:**
- Modify: `src/style.css` (replace `:root`/theme blocks with the cosmic palette; keep `@tailwind` directives + `cursor: none` global + `anim-ready` reveal-hiding rules)
- Modify: `tailwind.config.js` (tokens + fonts)
- Modify: `index.html` (fonts, `data-theme="dark"`, `<html class="dark">`, meta/OG)

**Interfaces:** Produces CSS variables and Tailwind `pop-*` utilities consumed by every component.

- [ ] **Step 1: Rewrite the theme block in `src/style.css`**

Keep the existing `@tailwind base; @tailwind components; @tailwind utilities;` at the top and the existing global rules (`* { cursor: none }`, the `html.anim-ready [data-anim]{visibility:hidden}` no-FOUC rule, `.anim-line` masking). Replace the color variables with a single dark cosmic set (no light block):

```css
:root,
[data-theme='dark'],
.dark {
  --bg-primary: #070B14;     /* void */
  --bg-surface: #0C1322;     /* panel */
  --bg-surface-2: #121C30;   /* raised panel */
  --text-main: #E8EDF5;
  --text-muted: #5A6A8A;
  --border-color: rgba(120, 150, 200, 0.18);
  --accent-primary: #00E5FF;   /* signal cyan */
  --accent-secondary: #A855F7; /* violet */
  --accent-magenta: #FF4FD8;
  --accent-amber: #FFB347;
  --accent-teal: #3BE8B0;
}

html, body { background: var(--bg-primary); color: var(--text-main); }
```

- [ ] **Step 2: Add cosmic tokens + fonts to `tailwind.config.js`**

Extend `theme.extend.colors` with `'pop-magenta': 'var(--accent-magenta)'`, `'pop-amber': 'var(--accent-amber)'`, `'pop-teal': 'var(--accent-teal)'` (keep the existing `pop-*` mappings). Replace `fontFamily` with:

```js
fontFamily: {
  display: ['"Space Grotesk"', 'sans-serif'],
  sans: ['Inter', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
```

- [ ] **Step 3: Update `index.html`**

- Set `<html lang="en" data-theme="dark" class="dark">`.
- Replace the Plus Jakarta Sans `<link>` with: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap`.
- Keep the Devicon async link and the `anim-ready` no-FOUC inline script.
- Update `<title>` to `Low Chee Fei | Software Developer — Portfolio Voyage` and add OG/Twitter meta:

```html
<meta property="og:title" content="Low Chee Fei — Software Developer" />
<meta property="og:description" content="An interactive cosmic portfolio voyage: mobile innovation meets enterprise systems." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 4: Verify in the dev server**

Run: `npm run dev`, open `http://localhost:3000`. Expected: page background is void navy `#070B14`, text light. (App is still the old one here; visual check is only the theme.) Run `npx tsc --noEmit` → no errors.

- [ ] **Step 5: Commit**

```bash
git add src/style.css tailwind.config.js index.html
git commit -m "feat(theme): dark cosmic palette, cyberpunk fonts, OG meta"
```

---

## Task 4: Teardown to the new shell

**Files:**
- Delete: `src/constants.ts`, `src/animations/**`, `src/scene/**`, `src/services/**`, all `src/components/*` (the old flat components), `script.js` (if present)
- Modify: `src/App.tsx` (reduce to a booting shell)

**Interfaces:** Produces a minimal `App` that calls `useMotion()` and renders an empty themed `<main>`. After this task the old world is gone; later tasks add story components.

- [ ] **Step 1: Delete the retired code**

```bash
git rm -r src/animations src/scene src/services
git rm src/constants.ts
git rm src/components/*.tsx
git rm -f script.js
```

(`src/components/story/**` does not exist yet, so the glob removes only the old flat components.)

- [ ] **Step 2: Replace `src/App.tsx` with the shell**

```tsx
import { useMotion } from './motion/useMotion';

export default function App() {
  useMotion();
  return (
    <main className="relative min-h-screen bg-pop-bg text-pop-text-main font-sans">
      {/* Story shell is assembled in later tasks. */}
      <div className="flex min-h-screen items-center justify-center font-mono text-pop-text-muted">
        VOYAGE BOOTING…
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Type-check + run all tests**

Run: `npx tsc --noEmit` → Expected: no errors (nothing imports the deleted files; if a stray import remains, fix it).
Run: `npx vitest run` → Expected: PASS (Task 1 + Task 2 tests).

- [ ] **Step 4: Visual check**

Run: `npm run dev`. Expected: void-navy page with centered "VOYAGE BOOTING…", no console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor!: tear down v2 app to the cosmic-voyage shell"
```

---

## Task 5: Story shell — world layer, HUD nav, cursor

**Files:**
- Create: `src/components/story/StoryWorldLayer.tsx`, `StoryHUD.tsx`, `SectionRouteProgress.tsx`, `StoryCursor.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `SECTION_ACTS` from `@/src/content`, `WORLD_ASSETS`.
- Produces: `<StoryWorldLayer/>`, `<StoryHUD/>`, `<SectionRouteProgress/>`, `<StoryCursor/>` mounted by `App`.

- [ ] **Step 1: `StoryCursor.tsx`** — spaceship reticle on fine pointers

```tsx
import { useEffect, useRef } from 'react';

export default function StoryCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-3 -mt-3 h-6 w-6 rounded-full border border-pop-primary/70 mix-blend-screen"
    />
  );
}
```

- [ ] **Step 2: `SectionRouteProgress.tsx`** — mini star-map nav

```tsx
import { SECTION_ACTS } from '../../content';

/** Fixed vertical nav: one node per on-page act; click scrolls to the section. */
export default function SectionRouteProgress() {
  return (
    <nav aria-label="Voyage sections" className="fixed right-5 top-1/2 z-40 -translate-y-1/2">
      <ul className="flex flex-col gap-4">
        {SECTION_ACTS.map((act) => (
          <li key={act.id}>
            <a
              href={`#${act.sectionId}`}
              className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-pop-text-muted hover:text-pop-text-main"
            >
              <span
                className="inline-block h-2 w-2 rounded-full border border-current"
                style={{ boxShadow: `0 0 8px ${act.tint}` }}
              />
              <span className="opacity-0 transition-opacity group-hover:opacity-100">{act.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: `StoryHUD.tsx`** — recruiter fast-path chrome

```tsx
import { PROFILE } from '../../content';

export default function StoryHUD() {
  return (
    <div className="fixed left-5 top-5 z-40 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
      <a href="#contact" className="text-pop-text-muted hover:text-pop-primary">Skip ▾ Contact</a>
      <a
        href={PROFILE.cv}
        className="rounded border border-pop-border px-2 py-1 text-pop-text-main hover:border-pop-primary"
      >
        Download CV
      </a>
    </div>
  );
}
```

- [ ] **Step 4: `StoryWorldLayer.tsx`** — persistent sprite layer (static placeholder in v1)

```tsx
import { WORLD_ASSETS } from '../../story/worldAssets';

/** Persistent decorative sprites that will travel between acts in later phases.
 *  In v1 it renders a faint parked spaceship so the world reads as continuous. */
export default function StoryWorldLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-20] overflow-hidden">
      <img
        src={WORLD_ASSETS.spaceship}
        alt=""
        className="absolute right-[8%] top-[14%] w-40 opacity-30"
        data-float
      />
    </div>
  );
}
```

- [ ] **Step 5: Wire them into `App.tsx`**

```tsx
import { useMotion } from './motion/useMotion';
import StoryWorldLayer from './components/story/StoryWorldLayer';
import StoryHUD from './components/story/StoryHUD';
import SectionRouteProgress from './components/story/SectionRouteProgress';
import StoryCursor from './components/story/StoryCursor';

export default function App() {
  useMotion();
  return (
    <main className="relative min-h-screen bg-pop-bg text-pop-text-main font-sans selection:bg-pop-primary/30">
      <StoryWorldLayer />
      <StoryHUD />
      <SectionRouteProgress />
      <StoryCursor />
      {/* Sections added in Tasks 6–13 */}
      <section id="hero" className="grid min-h-screen place-items-center font-mono text-pop-text-muted">HERO</section>
    </main>
  );
}
```

- [ ] **Step 6: Verify + commit**

Run: `npx tsc --noEmit` → no errors. `npm run dev` → right-side nav dots visible, top-left HUD, faint ship, custom cursor follows mouse, smooth scroll active.

```bash
git add src/components/story src/App.tsx
git commit -m "feat(story): world layer, route-progress nav, HUD, spaceship cursor"
```

---

## Task 6: Boot preloader

**Files:**
- Create: `src/components/story/StoryBootPreloader.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `gsap` from `../../motion/register`, `CONFIG` from `../../motion/config`, `PROFILE`.
- Produces: `<StoryBootPreloader/>`; dispatches `window` event `story:boot-complete`.

- [ ] **Step 1: Create the component**

```tsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../motion/register';
import { CONFIG } from '../../motion/config';
import { WORLD_ASSETS } from '../../story/worldAssets';
import { PROFILE } from '../../content';

export default function StoryBootPreloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(CONFIG.reducedMotion); // reduced motion: never shown

  useEffect(() => {
    if (CONFIG.reducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
          window.dispatchEvent(new CustomEvent('story:boot-complete'));
        },
      });
      tl.fromTo('[data-boot-mascot]', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5 })
        .fromTo('[data-boot-line]', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', stagger: 0.25, duration: 0.4 }, 0.2)
        .to('[data-boot-flash]', { opacity: 1, duration: 0.25 }, '+=0.2')
        .to(root.current, { autoAlpha: 0, duration: 0.3 });
    }, root);
    return () => ctx.revert();
  }, []);

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-pop-bg">
      <div className="flex flex-col items-center gap-4 text-center">
        <img src={WORLD_ASSETS.mascot} alt="" data-boot-mascot className="w-24 opacity-0" />
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
          <p data-boot-line>Initializing voyage</p>
          <p data-boot-line>Pilot profile detected</p>
          <p data-boot-line className="text-pop-text-main">{PROFILE.name}</p>
        </div>
      </div>
      <div data-boot-flash className="pointer-events-none absolute inset-0 bg-white opacity-0" />
    </div>
  );
}
```

- [ ] **Step 2: Mount it first in `App.tsx`** (add `import StoryBootPreloader from './components/story/StoryBootPreloader';` and render `<StoryBootPreloader />` as the first child of `<main>`).

- [ ] **Step 3: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → boot sequence plays once then reveals the page; emulate reduced motion (DevTools › Rendering › Emulate prefers-reduced-motion) → preloader does not render. 

```bash
git add src/components/story/StoryBootPreloader.tsx src/App.tsx
git commit -m "feat(story): boot preloader with reduced-motion skip"
```

---

## Task 7: AnimatedSectionHeading (shared)

**Files:**
- Create: `src/components/story/AnimatedSectionHeading.tsx`

**Interfaces:**
- Produces: `AnimatedSectionHeading` with props `{ eyebrow: string; title: string; meta?: string; align?: 'left' | 'center' }`. Consumed by every section task.

- [ ] **Step 1: Create the component**

```tsx
interface Props {
  eyebrow: string;
  title: string;
  meta?: string;
  align?: 'left' | 'center';
}

/** Cinematic heading: eyebrow pops, title reveals by words, meta clips in. */
export default function AnimatedSectionHeading({ eyebrow, title, meta, align = 'left' }: Props) {
  return (
    <div data-stagger="0.08" className={align === 'center' ? 'text-center' : 'text-left'}>
      <span data-anim="pop" className="block font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
        {eyebrow}
      </span>
      <h2 data-anim="words" className="mt-2 font-display text-4xl font-bold text-pop-text-main md:text-5xl">
        {title}
      </h2>
      {meta && (
        <span data-anim="clip-left" className="mt-2 block font-mono text-sm text-pop-text-muted">
          {meta}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

`npx tsc --noEmit` → clean.

```bash
git add src/components/story/AnimatedSectionHeading.tsx
git commit -m "feat(story): shared AnimatedSectionHeading"
```

---

## Task 8: Hero section (static launch)

**Files:**
- Create: `src/components/story/hero/HeroLaunch.tsx`
- Modify: `src/App.tsx` (replace the placeholder `#hero` with `<HeroLaunch/>`)

**Interfaces:**
- Consumes: `PROFILE`, `WORLD_ASSETS`.
- Produces: `<HeroLaunch/>` (renders `<section id="hero">`).

- [ ] **Step 1: Create the component**

```tsx
import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function HeroLaunch() {
  return (
    <section id="hero" className="relative grid min-h-screen items-center overflow-hidden px-6 md:px-16">
      <img
        src={WORLD_ASSETS.spaceship}
        alt=""
        aria-hidden
        data-float
        className="pointer-events-none absolute bottom-[12%] right-[6%] w-56 opacity-80 md:w-80"
      />
      <div className="relative z-10 max-w-3xl">
        <span data-anim="pop" className="font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
          Pilot profile · {PROFILE.title}
        </span>
        <h1 data-anim="chars" className="mt-3 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
          {PROFILE.name}
        </h1>
        <p data-anim="words" className="mt-4 font-display text-xl text-pop-text-main md:text-2xl">
          {PROFILE.headline}
        </p>
        <p data-anim="lines" className="mt-4 max-w-xl text-pop-text-muted">
          Computer Science graduate, Swinburne 2025 — focused on mobile applications, user-centric design, and enterprise systems.
        </p>
        <div data-stagger="0.08" className="mt-8 flex flex-wrap gap-3">
          <a data-anim="pop" href="#about" className="rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Launch Tour →</a>
          <a data-anim="pop" href={PROFILE.cv} className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">Download CV</a>
          <a data-anim="pop" href={PROFILE.social.github} target="_blank" rel="noreferrer" className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">GitHub</a>
          <a data-anim="pop" href={PROFILE.social.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">LinkedIn</a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Swap into `App.tsx`** (import `HeroLaunch`, replace the placeholder `<section id="hero">…</section>` with `<HeroLaunch />`).

- [ ] **Step 3: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → name reveals char-by-char on load, headline by words, CTAs pop in, ship floats. Reduced motion → all text visible immediately.

```bash
git add src/components/story/hero src/App.tsx
git commit -m "feat(hero): static launch section with cinematic reveals"
```

---

## Task 9: About section (Origin dossier, static)

**Files:**
- Create: `src/components/story/about/OriginDossier.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ABOUT`, `WORLD_ASSETS`, `AnimatedSectionHeading`.
- Produces: `<OriginDossier/>` (`<section id="about">`).

- [ ] **Step 1: Create the component**

```tsx
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { ABOUT } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function OriginDossier() {
  return (
    <section id="about" className="relative overflow-hidden px-6 py-28 md:px-16">
      <img src={WORLD_ASSETS.originPlanet} alt="" aria-hidden data-speed="0.85"
        className="pointer-events-none absolute -right-20 top-10 w-[28rem] opacity-25" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <AnimatedSectionHeading eyebrow="01 · Origin World" title="Identity dossier" meta="Scanned profile" />
        <dl data-stagger="0.06" className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {ABOUT.packet.map((f) => (
            <div data-anim="clip-left" key={f.label} className="border-b border-pop-border pb-2">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-pop-text-muted">{f.label}</dt>
              <dd className="text-pop-text-main">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p data-anim="lines" className="mt-8 max-w-2xl text-lg text-pop-text-main">{ABOUT.statement}</p>
        <ul data-stagger="0.05" className="mt-8 flex flex-wrap gap-2">
          {ABOUT.traits.map((t) => (
            <li data-anim="pop" key={t} className="rounded-full border border-pop-border px-3 py-1 font-mono text-xs text-pop-text-muted">{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `<OriginDossier />` after `<HeroLaunch />` in `App.tsx`.**

- [ ] **Step 3: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → scrolling into About reveals packet rows, statement lines, trait chips; planet parallaxes.

```bash
git add src/components/story/about src/App.tsx
git commit -m "feat(about): static origin dossier section"
```

---

## Task 10: Skills section (readable crystal field, static)

**Files:**
- Create: `src/components/story/skills/SkillField.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `SKILLS`, `WORLD_ASSETS`, `AnimatedSectionHeading`.
- Produces: `<SkillField/>` (`<section id="skills">`). (Meteor break + flip detail are Phase 3; v1 is a readable grouped grid.)

- [ ] **Step 1: Create the component**

```tsx
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import { Skill } from '../../../types';

function Crystal({ skill }: { skill: Skill }) {
  return (
    <div data-anim="pop" className="group relative grid place-items-center">
      <img src={WORLD_ASSETS.skillCrystal} alt="" aria-hidden className="w-20 opacity-90 transition group-hover:opacity-100" />
      <i className={`${skill.iconClass} absolute text-2xl`} aria-hidden />
      <span className="mt-1 font-mono text-[10px] text-pop-text-muted">{skill.name}</span>
    </div>
  );
}

export default function SkillField() {
  const inner = SKILLS.filter((s) => s.ring === 'inner');
  const outer = SKILLS.filter((s) => s.ring === 'outer');
  return (
    <section id="skills" className="relative px-6 py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
        <p data-anim="fade-up" className="mt-8 font-mono text-xs uppercase tracking-widest text-pop-primary">Core</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-8">
          {inner.map((s) => <Crystal key={s.id} skill={s} />)}
        </div>
        <p data-anim="fade-up" className="mt-10 font-mono text-xs uppercase tracking-widest text-pop-secondary">Extended</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-5 md:grid-cols-9">
          {outer.map((s) => <Crystal key={s.id} skill={s} />)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `<SkillField />` after About in `App.tsx`.**

- [ ] **Step 3: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → 8 core + 9 extended crystals render with Devicon glyphs and names, popping in on scroll.

```bash
git add src/components/story/skills src/App.tsx
git commit -m "feat(skills): readable static crystal field"
```

---

## Task 11: Experience section (Mission archive, static)

**Files:**
- Create: `src/components/story/experience/MissionArchive.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `MISSION_RECORDS`, `WORLD_ASSETS`, `AnimatedSectionHeading`.
- Produces: `<MissionArchive/>` (`<section id="experience">`).

- [ ] **Step 1: Create the component**

```tsx
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { MISSION_RECORDS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function MissionArchive() {
  return (
    <section id="experience" className="relative overflow-hidden px-6 py-28 md:px-16">
      <img src={WORLD_ASSETS.satelliteRelay} alt="" aria-hidden data-speed="0.9"
        className="pointer-events-none absolute -left-16 top-24 w-72 opacity-20" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <AnimatedSectionHeading eyebrow="03 · Mission Archive" title="Flight log" meta="Decrypted records" />
        <div className="relative mt-10 pl-6">
          <span data-anim="draw-y" className="absolute left-0 top-0 h-full w-px bg-pop-border" />
          <ol data-stagger="0.1" className="flex flex-col gap-8">
            {MISSION_RECORDS.map((r) => {
              const open = r.id === 'open-to-work';
              return (
                <li data-anim="clip-left" key={r.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border"
                    style={{ borderColor: open ? 'var(--accent-amber)' : 'var(--accent-teal)', boxShadow: open ? '0 0 10px var(--accent-amber)' : 'none' }} />
                  <p className="font-mono text-xs text-pop-text-muted">{r.period}</p>
                  <h3 className="font-display text-lg text-pop-text-main">{r.role}{r.company ? ` · ${r.company}` : ''}</h3>
                  <p className="mt-1 text-pop-text-muted">{r.description}</p>
                  {r.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.skills.map((s) => <span key={s} className="rounded border border-pop-border px-2 py-0.5 font-mono text-[10px] text-pop-text-muted">{s}</span>)}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `<MissionArchive />` after Skills in `App.tsx`.**

- [ ] **Step 3: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → timeline draws down, three records decrypt, open-to-work node glows amber.

```bash
git add src/components/story/experience src/App.tsx
git commit -m "feat(experience): static mission archive timeline"
```

---

## Task 12: Projects section (portal cards + accessible modal)

**Files:**
- Create: `src/components/story/projects/ProjectWorldRoute.tsx`, `ProjectModal.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `PROJECTS`, `WORLD_ASSETS`, `AnimatedSectionHeading`, `Project` type.
- Produces: `<ProjectWorldRoute/>` (`<section id="projects">`); `ProjectModal` with props `{ project: Project; onClose: () => void }`. (Black-hole portal transition is Phase 3; v1 is fade/scale with focus trap.)

- [ ] **Step 1: Create `ProjectModal.tsx`** (accessible, Escape closes, focus restore)

```tsx
import { useEffect, useRef } from 'react';
import { Project } from '../../../types';

export default function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); opener?.focus(); };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`${project.title} details`}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-pop-border bg-pop-surface p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-pop-text-main">{project.title}</h3>
            <p className="font-mono text-xs text-pop-text-muted">{project.subtitle}</p>
          </div>
          <button ref={closeRef} onClick={onClose} className="rounded border border-pop-border px-2 py-1 font-mono text-xs">Close ✕</button>
        </div>
        <p className="mt-4 text-pop-text-muted">{project.overview}</p>
        <ul className="mt-4 list-disc pl-5 text-sm text-pop-text-muted">
          {project.achievements.map((a) => <li key={a}>{a}</li>)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((t) => <span key={t} className="rounded border border-pop-border px-2 py-0.5 font-mono text-[10px]">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ProjectWorldRoute.tsx`**

```tsx
import { useState } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { PROJECTS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import { Project } from '../../../types';
import ProjectModal from './ProjectModal';

export default function ProjectWorldRoute() {
  const [active, setActive] = useState<Project | null>(null);
  return (
    <section id="projects" className="relative px-6 py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedSectionHeading eyebrow="04 · Project Worlds" title="Visited worlds" meta="Open a portal" />
        <div data-stagger="0.1" className="mt-10 grid gap-8 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <button data-anim="pop" key={p.id} onClick={() => setActive(p)}
              className="group relative overflow-hidden rounded-xl border border-pop-border bg-pop-surface text-left">
              <span className="relative block aspect-video overflow-hidden">
                <img src={p.image} alt="" aria-hidden className="h-full w-full object-cover opacity-80 transition group-hover:scale-105" />
                <img src={WORLD_ASSETS.projectPortal} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-70" />
              </span>
              <span className="block p-4">
                <span className="block font-display text-lg text-pop-text-main">{p.title}</span>
                <span className="block font-mono text-xs text-pop-text-muted">{p.subtitle}</span>
                <span className="mt-2 block font-mono text-[10px] text-pop-amber">{p.achievements[0]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </section>
  );
}
```

- [ ] **Step 3: Add `<ProjectWorldRoute />` after Experience in `App.tsx`.**

- [ ] **Step 4: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → three portal cards; click opens modal; Escape/overlay/Close all dismiss; focus returns to the card. Keyboard: Tab to a card, Enter opens.

```bash
git add src/components/story/projects src/App.tsx
git commit -m "feat(projects): portal cards with accessible project modal"
```

---

## Task 13: Contact section (Relay console, static)

**Files:**
- Create: `src/components/story/contact/RelayConsole.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `PROFILE`, `WORLD_ASSETS`, `AnimatedSectionHeading`.
- Produces: `<RelayConsole/>` (`<section id="contact">`). (Signal-beam animation is Phase 4; v1 shows a success state.)

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function RelayConsole() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-28 md:px-16">
      <img src={WORLD_ASSETS.satelliteRelay} alt="" aria-hidden data-float
        className="pointer-events-none absolute right-[6%] top-16 w-64 opacity-30" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <AnimatedSectionHeading eyebrow="05 · Relay Console" title="Open a channel" meta={PROFILE.status} />
        <dl data-stagger="0.06" className="mt-6 grid gap-2 font-mono text-sm sm:grid-cols-3">
          <div data-anim="clip-left"><dt className="text-pop-text-muted">Email</dt><dd>{PROFILE.email}</dd></div>
          <div data-anim="clip-left"><dt className="text-pop-text-muted">Base</dt><dd>{PROFILE.location}</dd></div>
          <div data-anim="clip-left"><dt className="text-pop-text-muted">Status</dt><dd className="text-pop-teal">Available</dd></div>
        </dl>
        {sent ? (
          <p className="mt-8 rounded-lg border border-pop-primary/50 p-4 font-mono text-pop-primary">Signal sent. Transmission channel remains open.</p>
        ) : (
          <form data-stagger="0.06" className="mt-8 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input data-anim="clip-left" required placeholder="Name" className="rounded border border-pop-border bg-pop-surface px-3 py-2" />
            <input data-anim="clip-left" required type="email" placeholder="Email" className="rounded border border-pop-border bg-pop-surface px-3 py-2" />
            <textarea data-anim="clip-left" required placeholder="Message" rows={4} className="rounded border border-pop-border bg-pop-surface px-3 py-2" />
            <button data-anim="pop" type="submit" className="self-start rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Initiate Transmission →</button>
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `<RelayConsole />` after Projects in `App.tsx`.**

- [ ] **Step 3: Verify + commit**

`npx tsc --noEmit` → clean. `npm run dev` → form reveals; submit shows success state; required fields validate.

```bash
git add src/components/story/contact src/App.tsx
git commit -m "feat(contact): static relay console with success state"
```

---

## Task 14: Ending footer + full integration pass

**Files:**
- Create: `src/components/story/ending/VoyageCompleteFooter.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `PROFILE`, `WORLD_ASSETS`.
- Produces: `<VoyageCompleteFooter/>`.

- [ ] **Step 1: Create the component**

```tsx
import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function VoyageCompleteFooter() {
  return (
    <footer className="relative overflow-hidden px-6 py-24 text-center md:px-16">
      <img src={WORLD_ASSETS.spaceship} alt="" aria-hidden data-speed="1.1" className="mx-auto w-24 opacity-40" />
      <p data-anim="words" className="mt-6 font-display text-2xl text-pop-text-main">Voyage complete.</p>
      <p data-anim="fade-up" className="mt-2 text-pop-text-muted">Thanks for exploring Low Chee Fei's developer universe.</p>
      <div data-stagger="0.06" className="mt-6 flex justify-center gap-4 font-mono text-sm">
        <a data-anim="pop" href={PROFILE.social.github} target="_blank" rel="noreferrer">GitHub</a>
        <a data-anim="pop" href={PROFILE.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a data-anim="pop" href={`mailto:${PROFILE.email}`}>Email</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add `<VoyageCompleteFooter />` as the last child in `App.tsx`** (after `<RelayConsole />`). Confirm the final `App` order is: BootPreloader, WorldLayer, HUD, RouteProgress, Cursor, Hero, About, Skills, Experience, Projects, Contact, Ending footer.

- [ ] **Step 3: Full verification pass**

Run: `npx tsc --noEmit` → no errors.
Run: `npx vitest run` → all tests PASS.
Run: `npm run build` → succeeds.
Run: `npm run dev` and walk the whole page top-to-bottom: boot → hero → about → skills (8+9 crystals) → experience (timeline) → projects (modal open/close, focus restore) → contact (submit success) → ending. Route-progress nodes scroll to each section.
Emulate `prefers-reduced-motion` (DevTools): no boot, every section's content fully visible and readable, no broken layout.
Emulate a 390px mobile viewport: all sections readable, no horizontal overflow, nav reachable.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/ending src/App.tsx
git commit -m "feat(ending): voyage-complete footer + full Phase 0-1 integration"
```

---

## Self-Review (completed during planning)

**Spec coverage:** §3 motion core → Task 2; §3 chatbot → deferred to a later phase (noted, not in this plan's scope); §4 data model → Task 1; §5 skeleton/layering → Tasks 5–6; §6 scenes (readable static) → Tasks 8–14; §8 a11y (real buttons, alt="", modal focus, Escape, reduced motion) → Tasks 5,12,6,14; §8 recruiter fast-path (skip + CV) → Task 5; §9 Phase 0+1 → this whole plan; §11 verification → Task 14. **Gap intentionally deferred:** scroll-driven timelines, meteor break, crystal flip, portal black-hole transition, signal beam, mascot states, and the reskinned chatbot are **Phase 2–5** (separate plans), per spec §9.

**Placeholder scan:** no "TBD"/"handle edge cases"/"similar to" — every code step is complete. The one port-by-copy instruction (Task 2 Step 1) references real existing files and lists the exact edits.

**Type consistency:** `StoryAct`/`StoryActId`/`MascotState` defined in Task 1 and consumed unchanged in `story.ts` and the nav; `WORLD_ASSETS` keys (`spaceship`, `originPlanet`, `skillCrystal`, `satelliteRelay`, `projectPortal`, `mascot`) used consistently across Tasks 5–14; `MISSION_RECORDS`/`SECTION_ACTS` names match between Task 1 and their consumers; `ProjectModal` prop shape `{ project, onClose }` matches its caller in Task 12.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks in this session with checkpoints.

Pick one to begin Task 1.
