/**
 * Animation layer entry point.
 *
 * `useSiteAnimations()` is called once from App. It boots every system inside a
 * single `gsap.context` so a component unmount (or React StrictMode double-mount
 * in dev) reverts cleanly — no leaked ScrollTriggers, tweens, or listeners,
 * which was the core bug in the original ad-hoc GSAP code.
 */
import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from './register';
import { CONFIG } from './config';
import { initSmoothScroll, destroySmoothScroll } from './smooth';
import { initEngine, revertSplits } from './engine';
import { initPins } from './pins';
import { initNav } from './nav';
import { initCursor, destroyCursor } from './cursor';
import { runIntro, revertIntroSplits } from './intro';
import { initScrollProgress } from './scroll';
import { initInteractions, destroyInteractions } from './interactions';
import { initScramble, destroyScramble } from './scramble';

export { CONFIG } from './config';
export { applyMagnetic } from './magnetic';
export { applyTilt } from './tilt';
export { getLenis } from './smooth';
export { gsap, ScrollTrigger } from './register';

export function useSiteAnimations() {
  useLayoutEffect(() => {
    // Everything is created inside this gsap.context and reverted in cleanup, so
    // a React StrictMode mount→revert→remount cycle re-initialises cleanly. (No
    // persistent "handled" DOM state — see engine.ts — which is what makes the
    // revert/recreate idempotent.)
    const ctx = gsap.context(() => {
      initSmoothScroll();
      initEngine();
      initPins();
      initNav();
      initScrollProgress();
      initInteractions();
      initScramble();
      initCursor();
      runIntro().then(() => ScrollTrigger.refresh());
    });

    // Recompute trigger positions once late-loading media settles.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener('resize', onResize);

    return () => {
      ctx.revert();
      revertSplits();
      revertIntroSplits();
      destroyInteractions();
      destroyScramble();
      destroyCursor();
      destroySmoothScroll();
      window.removeEventListener('load', onLoad);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeRaf);
      document.getElementById('section-tint')?.remove();
    };
  }, []);
}

/** Imperatively refresh ScrollTrigger (e.g. after dynamic content mounts). */
export function refreshAnimations() {
  if (!CONFIG.reducedMotion) ScrollTrigger.refresh();
}
