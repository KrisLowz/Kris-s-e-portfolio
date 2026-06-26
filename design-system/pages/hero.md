# Hero — page override

> Overrides `design-system/MASTER.md` for the hero section only. Style: **Pop Arcade**.

Full-bleed mascot video; oversized headline type **directly on the footage** (no cards/boxes). Greeting pinned top-left, CTA cluster pinned bottom-left (`justify-between`); cat stays visible on the right.

- **Type:**
  - Greeting "Hi, I am" — `font-display` (Bricolage Grotesque) extrabold, `text-5xl sm:text-7xl lg:text-8xl`, ink `#14121A`. Split into per-word spans for the staggered pop.
  - Rotating role (typewriter) — one notch smaller, cyan→magenta `bg-gradient-to-r from-[#06B6D4] to-[#FF2BD6] bg-clip-text text-transparent` on the **typed span only** (so the magenta caret isn't clipped). `min-h-[1.2em]`.
  - Eyebrow — borderless dot + uppercase `tracking-[0.18em]` in `#0E7490`.
  - Tagline — Manrope, `text-lg sm:text-2xl`, `#2A2730`.
- **Buttons (sticker style):** primary "View Work" = cyan `#06B6D4` fill + ink text + ink hard shadow; secondary "Download CV" = white + ink text + magenta hard shadow; then **GitHub + LinkedIn** icon buttons (white + ink icon, cyan / magenta hard shadows, `aria-label`ed, wobble icon on hover). All `rounded-2xl border-2 border-[#14121A]`, bouncy hover-lift + press.
- **Motion:** CSS `.hero-pop` staggered entrance (eyebrow → words → role → tagline → each CTA), inline `animationDelay` 80ms→1040ms. NOT GSAP (StrictMode-safe). Hover bounce via `cubic-bezier(0.34,1.56,0.64,1)`; social `@keyframes wobble`.
- **Legibility (no box):** left wash `from-white/80 via-white/30 to-transparent`; `sm:hidden` bottom wash `from-white/90`; soft white text-shadow halos. Plus subtle cyan/magenta blurred corner glows for vibrancy.
- **Mascot spaceship** (`/assets/world/hero/portfolio-spaceship-cutout.png`, cyber-cat ship) **patrols back and forth** in a lane just above the tagline — CSS `@keyframes flyPatrol` on `.hero-ship` (8s ease-in-out loop): animates `left` 0%→70% and back (stays clear of the cat, never fades), with a translateY bob. **Facing flips via `scaleX`** in the keyframe (−1 = right, +1 = left; source art faces left) so it turns around at each end — the image has NO static flip. Hidden under `prefers-reduced-motion`.
- Off-screen video pause (IntersectionObserver) + reduced-motion fallback (poster + no entrance) retained.
