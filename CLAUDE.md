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

**CDN globals, not npm packages:** Tailwind CSS, GSAP + ScrollTrigger, Typed.js, and Devicon are loaded via `<script>`/`<link>` tags in `index.html` — they are NOT in package.json. GSAP is accessed as `window.gsap` / `window.ScrollTrigger`. Tailwind is configured inline in `index.html` (the `tailwind.config` script block), so new Tailwind theme tokens go there, not in a config file.

**Theming is a dual mechanism — both must stay in sync:**
1. CSS variables in `src/style.css` (`:root` for light, `[data-theme="dark"], .dark` for dark) are the single source of truth for all colors.
2. Tailwind's inline config maps those variables to `pop-*` utility classes (`pop-bg`, `pop-surface`, `pop-primary`, etc.); Tailwind dark mode uses the `class` strategy.

`ThemeToggle.tsx` sets both `data-theme` attribute and `.dark` class on `<html>`, persisting to localStorage. When adding colors, define the variable in both light and dark blocks of `style.css`, then map it in `index.html`'s Tailwind config if a utility class is needed.

**Content is data-driven:** All portfolio content (profile, projects, experience, skills, and the chatbot's `SYSTEM_INSTRUCTION`) lives in `src/constants.ts`, typed by `src/types.ts`. To add or edit a project/experience entry, edit `constants.ts` — components render from these arrays.

**AI chatbot:** `AIChatBot.tsx` → `src/services/geminiService.ts`, which calls Gemini (`gemini-2.5-flash` via `@google/genai`) client-side with `SYSTEM_INSTRUCTION` from `constants.ts` as the system prompt. Update `SYSTEM_INSTRUCTION` when portfolio content changes so the chatbot stays accurate.

**Scroll animations:** App.tsx wires every element with class `.reveal-on-scroll` to a bi-directional GSAP ScrollTrigger animation (plays on enter, reverses on leave). Add that class to any element that should animate on scroll.

**Custom cursor:** The default cursor is hidden globally (`cursor: none !important` in `style.css`); `CustomCursor.tsx` renders the replacement.

## Conventions

- Images must go in `public/assets/` and be referenced by absolute path from the site root (e.g. `/assets/TrackPoint.png`) so they work in both dev and production. Do not reference `src/assets/...` paths in runtime strings.
- The `@` path alias resolves to the repo root (not `src/`) — see vite.config.ts and tsconfig.json.
- `script.js` is a leftover stub; logic lives in React components.
- The importmap in `index.html` is an AI Studio artifact; actual dependencies resolve from node_modules via Vite.
