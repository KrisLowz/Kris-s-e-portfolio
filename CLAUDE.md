# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server on http://localhost:3000 (host 0.0.0.0)
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

There is **no test runner and no linter** configured — `dev`, `build`, and `preview` are the only scripts. Type checking happens implicitly through the editor/Vite (`tsconfig.json` has `noEmit: true`); there is no standalone `tsc` script.

## Environment

Set `GEMINI_API_KEY` in `.env.local`. `vite.config.ts` injects it at build time via `define`, exposing it to client code as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`. The key is bundled into client-side JS (acknowledged tradeoff for a static portfolio). When the key is absent, the AI chatbot degrades gracefully to a "chat disabled" message instead of erroring.

## Architecture

Single-page React 19 + TypeScript portfolio built with Vite. `src/index.tsx` mounts `src/App.tsx`, which composes every section and visual-effect component in render order (Navigation → Hero → About → ProfessionalSkills → Experience → ProjectsShowcase → Contact, plus background/cursor/chatbot overlays).

### Content is centralized and mirrored in three places

All site copy (profile, projects, experience, and the AI chatbot's grounding prompt) lives in **`src/constants.ts`** (`PROFILE`, `PROJECTS`, `EXPERIENCE`, `SYSTEM_INSTRUCTION`), typed by `src/types.ts`. Components like `Experience.tsx` and `ProjectsShowcase.tsx` render from these exports rather than hardcoding text. A few strings are still hardcoded in components (e.g. the About paragraphs, the Hero CV link, the Contact location/footer, the soft-skills list in `ProfessionalSkills.tsx`).

When editing content, keep these **in sync**:
1. `src/constants.ts` — the live site data.
2. `SYSTEM_INSTRUCTION` (inside `constants.ts`) — the chatbot's knowledge base, which duplicates experience/project facts and must be updated separately when those change.
3. `PORTFOLIO_CONTENT.md` — a human-readable "source of truth" doc that catalogs every piece of copy and which file it lives in. Update it alongside any content change.

### AI chatbot

`src/components/AIChatBot.tsx` calls `src/services/geminiService.ts`, which uses `@google/genai` with model `gemini-2.5-flash`. The chat is grounded entirely by `SYSTEM_INSTRUCTION` — the bot is instructed to answer only from that context, so new experience/projects won't be visible to it unless `SYSTEM_INSTRUCTION` is updated.

### Styling and animation rely on CDN globals, not npm

`index.html` loads several libraries via `<script>`/CDN rather than as bundled dependencies:
- **Tailwind CSS** via the CDN script, with its config (custom `pop-*` color tokens, fonts, `blob` animation) defined **inline in `index.html`**. There is no `tailwind.config.js` or PostCSS pipeline.
- The `pop-*` Tailwind colors map to CSS custom properties (`--bg-primary`, `--accent-primary`, etc.) defined in **`src/style.css`**, which is also where light/dark theming lives (`darkMode: 'class'` + `data-theme` on `<html>`).
- **GSAP + ScrollTrigger**, **Typed.js**, and **Devicon** are CDN globals accessed via `window.gsap`, `window.ScrollTrigger`, and `Typed` (declared as `any`), not imported.
- An **importmap** in `index.html` also resolves `react`, `react-dom`, `lucide-react`, and `@google/genai` from `aistudiocdn.com`.

The global scroll-reveal animation is driven from `App.tsx`: any element with the class `.reveal-on-scroll` is animated in/out by a single `ScrollTrigger` setup using `toggleActions: "play reverse play reverse"` (bi-directional/reversible).

### Images

Static images live in `public/assets/` and are referenced by absolute path from the site root (e.g. `image: "/assets/TrackPoint.png"` in `constants.ts`), so they resolve identically in dev and production. The `public/assets/world/` set holds decorative "space world" art used by background components.
