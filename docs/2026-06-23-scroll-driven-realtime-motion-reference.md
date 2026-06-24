# Scroll-Driven Realtime Motion Reference

Use this as a planning checklist for future portfolio, studio, product, or campaign sites that need the same feel as:

- https://breedlove.xyz/
- https://www.armory.in/
- https://www.nithinmwarrier.com/
- https://buzzworthystudio.com/

## Core Similarity

These sites are scroll-driven experiential websites. The page is not only a document; it behaves like a directed motion sequence.

The user scrolls, and that scroll progress controls animation timelines, pinned scenes, text reveals, canvas/WebGL layers, media transitions, navigation behavior, and section changes. A realtime animation loop keeps the interface feeling alive between scroll events.

## Experience Goals

- Make scroll feel intentional, cinematic, and responsive.
- Treat the first viewport as an interactive scene, not a static hero.
- Connect sections with motion instead of hard layout jumps.
- Use animation to reveal hierarchy, state, and story progression.
- Keep performance high enough that the motion feels physical, not decorative.
- Make the site memorable without making the content hard to read.

## Main Patterns

### 1. Scroll as Timeline

Scroll progress should drive visual state.

Common uses:

- Pinning a hero or section while content advances.
- Scrubbing image sequences.
- Revealing text word by word or line by line.
- Scaling, rotating, masking, or translating media.
- Changing background colors or visual themes.
- Showing/hiding navigation based on scroll direction.
- Driving progress indicators.

Recommended tools:

- GSAP ScrollTrigger
- Framer Motion `useScroll`
- Motion One
- Native `IntersectionObserver` for simpler reveal logic

### 2. Realtime Animation Loop

The site should have a frame-based update loop for smooth visual systems.

Common uses:

- Smooth scrolling interpolation.
- WebGL/canvas rendering.
- Cursor-following effects.
- Parallax with easing.
- Physics-like UI movement.
- Shader uniforms updated every frame.

Typical APIs:

- `requestAnimationFrame`
- GSAP ticker
- Three.js render loop
- React Three Fiber `useFrame`
- Lenis `raf`

### 3. Smooth Scroll Layer

Native scroll can feel too abrupt for cinematic work. Smooth scroll libraries interpolate scroll position and make scrubbed animations feel more continuous.

Recommended tool:

- Lenis

Typical setup:

```ts
const lenis = new Lenis({
  lerp: 0.12,
  smoothWheel: true,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

Use this carefully. Smooth scroll can harm accessibility or mobile behavior if overdone.

### 4. Pinned Hero Scene

The hero often works as a stage.

Typical structure:

```txt
section.hero-trigger
  div.hero-scene position: sticky/fixed
    canvas/webgl/image/video
    headline
    navigation chrome
  div.scroll-content
    story beats
```

Common effects:

- Hero media remains fixed while text scrolls over it.
- Canvas animation progresses with scroll.
- Large typography exits or compresses into navigation.
- Foreground and background move at different speeds.
- A first-scene preloader hands off into the scroll experience.

### 5. Text Splitting

Text is animated at a smaller unit than the full block.

Common units:

- Characters for expressive hero titles.
- Words for editorial reveals.
- Lines for readable body copy.

Recommended tools:

- GSAP SplitText
- SplitType
- Custom React text splitter

Good defaults:

- Animate opacity, y-position, blur, or clip-path.
- Stagger reveals by 0.02s to 0.08s.
- Avoid splitting long paragraphs unless the reveal has a clear purpose.

### 6. Canvas, WebGL, and Image Sequences

These sites often use a visual layer that is not normal DOM.

Common uses:

- Three.js/WebGL hero scenes.
- Shader backgrounds.
- Particle or fluid-like visuals.
- Cursor-reactive graphics.
- Scroll-scrubbed image sequences.
- Canvas-based drawing or masking.

Recommended tools:

- Three.js
- React Three Fiber
- HTML canvas 2D
- GSAP for progress control

Image sequence pattern:

```ts
const frame = Math.round(progress * (frames.length - 1));
drawImage(frames[frame]);
```

Important:

- Preload critical frames.
- Use compressed images like AVIF/WebP.
- Provide mobile-specific frame sets.
- Pause or reduce heavy animation when offscreen.

### 7. Section Transitions

Sections should transition instead of simply stacking.

Common transition styles:

- Mask wipe
- Clip-path reveal
- SVG shape transition
- Dither/noise dissolve
- Background color interpolation
- Large media scale/crop transition
- Page overlay for route changes

Implementation options:

- GSAP timelines
- CSS `clip-path`
- Framer Motion layout/page transitions
- View Transitions API where appropriate
- SVG overlays

### 8. Page Transitions

If the site has multiple routes, navigation should feel continuous.

Common pattern:

1. User clicks a link.
2. Overlay or shape transition covers the page.
3. Route changes while covered.
4. New page reveals with matching animation.

Recommended tools:

- Framer Motion `AnimatePresence`
- GSAP route transition timeline
- Barba.js for non-React sites
- Native View Transitions API for simpler cases

### 9. Preloader and Asset Readiness

Motion-heavy sites need preload strategy.

Use preloaders for:

- WebGL assets
- Large hero media
- Image sequences
- Custom fonts
- Critical first-screen images

Preloader should:

- Show intentional brand motion.
- Wait only for critical assets.
- Start scroll only when the first scene is ready.
- Avoid blocking the entire site for non-critical media.

### 10. Navigation as Motion State

Navigation should respond to scroll and context.

Common behavior:

- Hide while scrolling down.
- Show when scrolling up.
- Transform from full header to compact pill.
- Change color based on section theme.
- Show scroll progress.
- Dock secondary controls after hero.

## Recommended Stack

For a React/Vite project:

- React
- TypeScript
- GSAP
- ScrollTrigger
- Lenis
- Framer Motion for component/page transitions
- Three.js or React Three Fiber for 3D/WebGL
- SplitType for text splitting

For simpler projects:

- GSAP
- ScrollTrigger
- Lenis
- CSS transitions
- Canvas 2D where needed

For Webflow-style builds:

- Webflow layout
- GSAP
- ScrollTrigger
- Lenis
- Custom embed scripts

## Architecture Checklist

### Motion System

- Define global easing tokens.
- Define global duration tokens.
- Create reusable reveal components.
- Create a scroll scene abstraction.
- Keep scroll progress separate from visual rendering.
- Use reduced-motion fallbacks.

### Performance

- Animate `transform` and `opacity` where possible.
- Avoid animating layout-heavy properties.
- Use `will-change` sparingly.
- Lazy-load below-fold media.
- Pause canvas/WebGL when hidden.
- Use mobile-specific assets.
- Test on a mid-range phone, not only desktop.

### Accessibility

- Respect `prefers-reduced-motion`.
- Do not hijack basic navigation.
- Keep focus states visible.
- Avoid hiding content from keyboard users.
- Make sure text remains readable during animation.
- Do not require precise scroll gestures to access content.

Reduced motion example:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Implementation Blueprint

Recommended page structure:

```txt
App
  MotionProvider
    SmoothScrollProvider
    RouteTransitionProvider
    Header
    Main
      HeroScene
      ScrollStorySection
      FeaturedWorkSection
      AboutSection
      ContactSection
    Footer
```

Recommended motion modules:

```txt
src/motion/
  easing.ts
  useReducedMotion.ts
  smoothScroll.ts
  scrollScene.ts
  textReveal.ts
  pageTransition.ts
  canvasSequence.ts
```

## Practical Build Order

1. Build the static layout first.
2. Add smooth scrolling.
3. Add section-based reveal animations.
4. Add one pinned hero scene.
5. Add text-splitting only to key headings.
6. Add canvas/WebGL or image sequence.
7. Add page/section transitions.
8. Add reduced-motion fallbacks.
9. Profile performance.
10. Tune timing, easing, and mobile behavior.

## Quality Bar

The motion should feel connected to the content. Avoid adding effects only because they are possible.

Good motion:

- Supports story flow.
- Helps users understand where they are.
- Makes transitions feel intentional.
- Preserves readability.
- Performs smoothly.

Bad motion:

- Delays access to content.
- Causes layout instability.
- Makes scroll unpredictable.
- Requires too much GPU/CPU.
- Feels disconnected from the brand or subject.

## Quick Future Prompt

Use this prompt when starting a new project:

```txt
Build this as a scroll-driven experiential site. Use smooth scroll, pinned scenes, realtime canvas/WebGL where useful, scroll-scrubbed transitions, text-splitting reveals, and route/section transitions. Keep performance and reduced-motion support as first-class requirements. The motion should feel like Breedlove, Armory, Nithin M Warrier, and Buzzworthy Studio: cinematic, responsive, and tied to scroll progress.
```

