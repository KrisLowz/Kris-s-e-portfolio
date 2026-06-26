# Design System — MASTER (Source of Truth)

> **Project:** Low Chee Fei — Portfolio (2026 from-scratch rebuild, branch `redesign/website-overhaul`)
> **How to use:** When building a section/page, read this first. If `design-system/pages/<page>.md` exists, its rules **override** this file; otherwise follow MASTER.

---

## Direction — "Pop Arcade"

Bright, bold, **playful**. Full-bleed mascot footage on a white canvas; oversized chunky headline type sitting directly on the video (no boxes/panels). Vibrant electric cyan + hot magenta pulled from the cat's neon trim, used confidently. Chunky "sticker" buttons with hard offset shadows. Springy, bouncy motion. Personality over restraint — but keep it legible.

## Color tokens

| Role | Hex | Use |
|---|---|---|
| Ink | `#14121A` | text, headings, borders, hard shadows |
| Ink-soft | `#2A2730` | body / tagline |
| Canvas | `#FFFFFF` | page background / fallback behind media |
| Cyan | `#06B6D4` | primary accent, primary button fill, gradient start, glow |
| Cyan-deep | `#0E7490` | small accent text on white (AA-safe, e.g. eyebrow) |
| Magenta | `#FF2BD6` | spark: gradient end, typewriter caret, secondary shadows, selection |

**Contrast (WCAG AA):** bright cyan/magenta fail with WHITE text. So **fills use DARK ink text** — white on `#06B6D4` ≈ 2:1 ✗, but ink `#14121A` on `#06B6D4` ≈ 7.6:1 ✓ and on `#FF2BD6` ≈ 5.5:1 ✓. For small accent text on white, use `#0E7490` (cyan-deep), not `#06B6D4`.

**Sticker button pattern:** `rounded-2xl border-2 border-[#14121A]` + hard offset shadow `shadow-[4px_4px_0_0_<color>]`; hover lifts (`-translate-y-1`, bigger shadow); press (`active:translate-y-0.5`, smaller shadow). Primary = cyan fill + ink text + ink shadow; secondary = white + ink text + magenta shadow; social icon buttons = white + ink icon + colored shadow.

## Typography

- **Display** (`font-display`): **Bricolage Grotesque** — chunky, characterful headlines + button labels.
- **Body/UI** (`font-sans`): **Manrope** — paragraphs, eyebrow.
- Google Fonts in `index.html` with `display=swap`; tailwind `fontFamily.display`/`.sans` set in the inline config.
- Headliner scale: hero greeting `text-5xl sm:text-7xl lg:text-8xl` extrabold; rotating role one notch down with a cyan→magenta `bg-clip-text` gradient (caret stays magenta — keep the gradient on the typed span only, not the cursor). Body 16px min.

## Motion

- **Entrance = CSS keyframes, NOT GSAP.** Use the `.hero-pop` utility (`@keyframes heroPop`, bouncy `cubic-bezier(0.34,1.56,0.64,1)`, `fill-mode: backwards`) with staggered inline `animationDelay`. **Why:** React `<StrictMode>` (on, in `index.tsx`) double-invokes effects in dev and was stranding the last stage of a GSAP `from` timeline at `opacity:0`. CSS keyframes are immune; `backwards` fill avoids FOUC during the delay yet releases the element afterward so button hover transforms still work. (GSAP is still fine for scroll-triggered/section work — just guard `from` timelines and don't revert one-shots.)
- Micro-interactions 150–300ms; bouncy easing `cubic-bezier(0.34,1.56,0.64,1)` for hovers/press; `@keyframes wobble` on social icons (group-hover).
- Animate transform/opacity only. **`prefers-reduced-motion` REQUIRED:** `.hero-pop { animation:none }` via media query; video → static poster.

## Layout, media, a11y, sections

- Full-bleed video: 1280×720 H.264 (`cat-hero-full.mp4`), muted/loop/playsInline + poster; **pause off-screen** via IntersectionObserver. Optimize media with `ffmpeg-static` (no system ffmpeg). `loading="lazy"` below-fold; lazy-load below-fold sections as the site grows.
- Legibility without boxes = **gradient washes** (left wash desktop; `sm:hidden` bottom wash mobile) + soft white text-shadow halo. Never panels.
- Spacing 4/8px; container `max-w-7xl`, gutters `px-6 sm:px-10 lg:px-12`. Mobile-first, `min-h-[100svh]`.
- SVG icons only (**lucide-react**), no emoji. One primary CTA per section. Touch targets ≥44px. `focus-visible` rings. Decorative media `aria-hidden`.
- **Section order:** Hero ✓ → **Projects** (lead with the work) → About → Experience/Skills → Contact.
