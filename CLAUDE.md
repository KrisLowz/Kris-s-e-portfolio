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

The AI chatbot requires `GEMINI_API_KEY` in `.env.local`. Vite's `define` config (vite.config.ts) inlines it as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build time. Without the key, the chatbot degrades gracefully with a fallback message — everything else works.

## Architecture

**Entry flow:** `index.html` → `src/index.tsx` → `src/App.tsx`, which composes the entire page: decorative background layers (FogBackground, MeshBackground, WireframeGlobe, MeteorShower, GhostCursors), scroll/cursor effects (CustomCursor, ScrollProgressBar, SectionHoverGlow, ScrollRippleEffect), then content sections in order (Navigation, Hero, About, ProfessionalSkills, Experience, ProjectsShowcase, Contact), plus floating widgets (ReactionButton, AIChatBot).

**Dependencies are npm + a build step (not CDN):** GSAP (+ScrollTrigger, +SplitText), Lenis, Typed.js, React and `@google/genai` are npm packages bundled by Vite. Tailwind CSS is built statically via PostCSS (`tailwind.config.js` + `postcss.config.js`); the `@tailwind` directives are at the top of `src/style.css`. Only Devicon and Google Fonts still load from a CDN `<link>` in `index.html`. Do NOT use `window.gsap` — import `gsap` from `src/animations` (one shared instance). New Tailwind theme tokens go in `tailwind.config.js`.

**Theming is a dual mechanism — both must stay in sync:**
1. CSS variables in `src/style.css` (`:root` for light, `[data-theme="dark"], .dark` for dark) are the single source of truth for all colors.
2. `tailwind.config.js` maps those variables to `pop-*` utility classes (`pop-bg`, `pop-surface`, `pop-primary`, etc.); Tailwind dark mode uses the `class` strategy.

`ThemeToggle.tsx` sets both `data-theme` attribute and `.dark` class on `<html>`, persisting to localStorage. When adding colors, define the variable in both light and dark blocks of `style.css`, then map it in `index.html`'s Tailwind config if a utility class is needed.

**Content is data-driven:** All portfolio content (profile, projects, experience, skills, and the chatbot's `SYSTEM_INSTRUCTION`) lives in `src/constants.ts`, typed by `src/types.ts`. To add or edit a project/experience entry, edit `constants.ts` — components render from these arrays.

**AI chatbot:** `AIChatBot.tsx` → `src/services/geminiService.ts`, which calls Gemini (`gemini-2.5-flash` via `@google/genai`) client-side with `SYSTEM_INSTRUCTION` from `constants.ts` as the system prompt. Update `SYSTEM_INSTRUCTION` when portfolio content changes so the chatbot stays accurate.

**Animation layer (`src/animations/`):** A GSAP 3.13 + Lenis motion system, booted once from `App.tsx` via `useSiteAnimations()` inside a self-cleaning `gsap.context`. Add a `data-anim="fade-up|words|clip|scale|pop|…"` attribute to any element and it animates on scroll automatically (see the engine in `engine.ts` and the full attribute API in README.md). Tune everything — eases, durations, staggers, per-effect on/off toggles — in `config.ts`. `register.ts` exports the single shared `gsap` instance; import from `'../animations'`, never `window.gsap`. Reduced-motion and touch fallbacks are handled centrally via `CONFIG`. (The legacy `.reveal-on-scroll` class still works — the engine maps it to `fade-up`.)

**Custom cursor:** The default cursor is hidden globally (`cursor: none !important` in `style.css`); `CustomCursor.tsx` renders the elements and `animations/cursor.ts` drives them (fine-pointer devices only).

## Conventions

- Images must go in `public/assets/` and be referenced by absolute path from the site root (e.g. `/assets/TrackPoint.png`) so they work in both dev and production. Do not reference `src/assets/...` paths in runtime strings.
- The `@` path alias resolves to the repo root (not `src/`) — see vite.config.ts and tsconfig.json.
- `script.js` is a leftover stub; logic lives in React components.
- The importmap in `index.html` is an AI Studio artifact; actual dependencies resolve from node_modules via Vite.
