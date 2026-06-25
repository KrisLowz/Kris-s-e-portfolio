# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page portfolio website for Low Chee Fei, built with React 19 + TypeScript + Vite. Deployed via Netlify (see `netlify.toml`).

## Commands

- `npm run dev` — start dev server (port 3000, host 0.0.0.0)
- `npm run build` — production build
- `npm run preview` — preview the production build

There are no tests and no linter configured. Type checking is `noEmit` only (`npx tsc`).

## Environment

No environment variables are required. (The site previously shipped a Gemini-backed AI chatbot needing `GEMINI_API_KEY`; the chatbot was removed in the v2 rebuild — no key, no `@google/genai` dependency, no Gemini wiring in `vite.config.ts`.)

> **Note:** much of the Architecture/Conventions below still describes the pre-v2 app (old background/section components, `src/animations`, etc.) and is slated for a full refresh in Phase 5. Treat the v2 source under `src/components/story/`, `src/motion/`, and `src/content/` as ground truth where they disagree.

## Architecture

**Entry flow:** `index.html` → `src/index.tsx` → `src/App.tsx`, which composes the entire page: decorative background layers (FogBackground, MeshBackground, WireframeGlobe, MeteorShower, GhostCursors), scroll/cursor effects (CustomCursor, ScrollProgressBar, SectionHoverGlow, ScrollRippleEffect), then content sections in order (Navigation, Hero, About, ProfessionalSkills, Experience, ProjectsShowcase, Contact), plus floating widgets (ReactionButton). [pre-v2 — see Phase 5 note above]

**Dependencies are npm + a build step (not CDN):** GSAP (+ScrollTrigger, +SplitText), Lenis, Typed.js, React and `@google/genai` are npm packages bundled by Vite. Tailwind CSS is built statically via PostCSS (`tailwind.config.js` + `postcss.config.js`); the `@tailwind` directives are at the top of `src/style.css`. Only Devicon and Google Fonts still load from a CDN `<link>` in `index.html`. Do NOT use `window.gsap` — import `gsap` from `src/animations` (one shared instance). New Tailwind theme tokens go in `tailwind.config.js`.

**Theming is a dual mechanism — both must stay in sync:**
1. CSS variables in `src/style.css` (`:root` for light, `[data-theme="dark"], .dark` for dark) are the single source of truth for all colors.
2. `tailwind.config.js` maps those variables to `pop-*` utility classes (`pop-bg`, `pop-surface`, `pop-primary`, etc.); Tailwind dark mode uses the `class` strategy.

`ThemeToggle.tsx` sets both `data-theme` attribute and `.dark` class on `<html>`, persisting to localStorage. When adding colors, define the variable in both light and dark blocks of `style.css`, then map it in `index.html`'s Tailwind config if a utility class is needed.

**Content is data-driven:** All portfolio content (profile, projects, experience, skills) lives in `src/content/` (v2; the old `src/constants.ts` is gone), typed by `src/types.ts`. To add or edit a project/experience entry, edit the relevant module under `src/content/` — components render from these arrays.

**Animation layer (`src/animations/`):** A GSAP 3.13 + Lenis motion system, booted once from `App.tsx` via `useSiteAnimations()` inside a self-cleaning `gsap.context`. Add a `data-anim="fade-up|words|clip|scale|pop|…"` attribute to any element and it animates on scroll automatically (see the engine in `engine.ts` and the full attribute API in README.md). Tune everything — eases, durations, staggers, per-effect on/off toggles — in `config.ts`. `register.ts` exports the single shared `gsap` instance; import from `'../animations'`, never `window.gsap`. Reduced-motion and touch fallbacks are handled centrally via `CONFIG`. (The legacy `.reveal-on-scroll` class still works — the engine maps it to `fade-up`.)

**Custom cursor:** The default cursor is hidden globally (`cursor: none !important` in `style.css`); `CustomCursor.tsx` renders the elements and `animations/cursor.ts` drives them (fine-pointer devices only).

## Conventions

- Images must go in `public/assets/` and be referenced by absolute path from the site root (e.g. `/assets/TrackPoint.png`) so they work in both dev and production. Do not reference `src/assets/...` paths in runtime strings.
- The `@` path alias resolves to the repo root (not `src/`) — see vite.config.ts and tsconfig.json.
- `script.js` is a leftover stub; logic lives in React components.
- The importmap in `index.html` is an AI Studio artifact; actual dependencies resolve from node_modules via Vite.
