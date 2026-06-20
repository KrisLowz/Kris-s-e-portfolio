/**
 * Scroll-progress bridge: exposes the page's scroll position to the 3D scene as
 * plain mutable refs, so the R3F render loop can read it every frame WITHOUT a
 * second scroll listener and WITHOUT triggering React re-renders.
 *
 * The ScrollTriggers are created inside the existing gsap.context (see
 * useSiteAnimations), so they share the one Lenis-synced ScrollTrigger instance
 * and are reverted cleanly on unmount / StrictMode remount.
 */
import { ScrollTrigger } from './register';
import { CONFIG } from './config';

export type SectionKey =
  | 'hero'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'contact';

/** Global scroll progress, 0 (top) → 1 (bottom). Mutated in place. */
const progress = { value: 0 };

/** Per-section progress, 0 (entering bottom) → 1 (leaving top). Mutated in place. */
const sections: Record<SectionKey, number> = {
  hero: 0,
  about: 0,
  skills: 0,
  experience: 0,
  projects: 0,
  contact: 0,
};

const SECTION_SELECTORS: [SectionKey, string][] = [
  ['hero', '#hero'],
  ['about', '#about'],
  ['skills', '#skills'],
  ['experience', '#experience'],
  ['projects', '#projects'],
  ['contact', '#contact'],
];

/**
 * Wire the scroll triggers. Call once, inside the animation gsap.context. No-op
 * under reduced motion (the scene doesn't mount there, so nothing reads these).
 */
export function initScrollProgress(): void {
  if (CONFIG.reducedMotion) return;

  // Global page progress (the nav.ts idiom: no trigger, start 0 → end max).
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      progress.value = self.progress;
    },
  });

  // Per-section progress, scrubbed across the whole time the section is in view.
  SECTION_SELECTORS.forEach(([key, selector]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el as HTMLElement,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        sections[key] = self.progress;
      },
    });
  });
}

/** The global scroll-progress ref. Read `.value` in useFrame. */
export const getScrollProgress = () => progress;

/** The per-section scroll-progress ref. Read `sections[key]` in useFrame. */
export const getSectionProgress = () => sections;
