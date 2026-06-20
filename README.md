<!-- <div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1s3B32V8ka9CG5WwcAfrtacdSbruyeqW0 -->

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Animation system

All motion lives in one place: [`src/animations/`](src/animations). It's a GSAP
3.13 + Lenis layer booted once from `App.tsx` via `useSiteAnimations()` inside a
self-cleaning `gsap.context`. GSAP, ScrollTrigger, SplitText, Lenis and Typed.js
are npm packages (no CDN scripts); Tailwind is built statically via PostCSS.

### Animate any element with `data-anim`

Add a data attribute to any element — current or added later — and it animates on
scroll automatically. No JS needed.

```html
<h2 data-anim="words">Animated heading</h2>
<p  data-anim="fade-up" data-delay="0.2">Soft fade-up paragraph</p>
<img data-anim="clip" src="..." />
<div data-anim="scale">A card</div>
```

| `data-anim` | Effect |
|-------------|--------|
| `fade-up`   | rise + fade in (default) |
| `fade-in`   | fade only |
| `scale`     | fade + scale from 0.9 |
| `pop`       | overshoot pop in (icons, chips) |
| `clip`      | clip-path reveal, bottom→top |
| `clip-left` | clip-path reveal, left→right |
| `chars` / `words` / `lines` | masked SplitText reveal (headings) |
| `draw`      | scaleX draw-in (horizontal dividers) |
| `draw-y`    | scaleY draw-in (vertical lines/timelines) |

Modifier attributes:

| Attribute | On | Meaning |
|-----------|----|---------|
| `data-delay="0.2"`   | any animated element | extra delay (s) |
| `data-duration="1"`  | any animated element | override duration (s) |
| `data-stagger="0.08"`| a **container** | reveal its `[data-anim]` children together, staggered |
| `data-speed="0.9"`   | any element | parallax: `<1` lags, `>1` leads |
| `data-float`         | decorative accents | gentle continuous float + rotate |
| `data-velocity`      | any element | skews slightly on fast scroll |
| `data-tint="#818cf8"`| a **section** | cross-fades this hue into the global tint layer while in view |

Example grid with staggered cards:

```html
<div data-stagger="0.1">
  <div data-anim="scale">Card 1</div>
  <div data-anim="scale">Card 2</div>
  <div data-anim="scale">Card 3</div>
</div>
```

### Tuning everything

[`src/animations/config.ts`](src/animations/config.ts) is the single control
panel — eases, durations, staggers, parallax intensities, and a `toggles` map to
switch any system on/off (preloader, smoothScroll, reveals, parallax, pins,
velocitySkew, sectionTint, cursor, magnetic, tilt, …). Change a value there and
the whole site updates.

### Accessibility & performance

- **`prefers-reduced-motion`** → full static fallback: no preloader, no smooth
  scroll, the typewriter shows static text, and every element renders visible.
- **Touch devices** drop the custom cursor, magnetic buttons and 3D tilt.
- **No flash of hidden content / no CLS:** elements are only hidden (pre-reveal)
  inside `html.anim-ready`, a class an inline script adds *only* when motion is
  allowed and JS runs — so a JS failure leaves all content visible.
- Animations use transform/opacity only, `gsap.quickTo` for pointer handlers, and
  off-screen loops pause via `onToggle`.

<!-- ### Using Local Images (Recommended for production)

For images that must load correctly on your live site, put them in the `public/assets` folder. Files in `public` are served statically at the website root, so they will work in both local dev and production builds.

- **Place the image:** add your files under `public/assets/`, e.g. `public/assets/TrackPoint.png`.
- **Reference the image in code:** use an absolute path from the site root, e.g. `/assets/TrackPoint.png`.

Example (in `src/constants.ts`):

```ts
image: "/assets/TrackPoint.png",
```

If you prefer bundling images with the app (not in `public`), keep them in `src/assets` and import them directly in components. Bundled imports are resolved by Vite during build, but paths like `src/assets/...` in runtime strings will not work on deployed hosts. -->

