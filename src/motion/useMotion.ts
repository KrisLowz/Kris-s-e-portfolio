import { useEffect } from 'react';
import { gsap } from './register';
import { CONFIG } from './config';
import { initEngine, revertSplits } from './engine';
import { initScrollProgress } from './scroll';
import { initSmoothScroll, destroySmoothScroll } from './smooth';

/** Boots Lenis smooth scroll + the GSAP reveal engine once, cleaned on unmount. */
export function useMotion(): void {
  useEffect(() => {
    if (CONFIG.reducedMotion) return; // reduced motion: nothing animates; CSS shows all
    initSmoothScroll();
    const ctx = gsap.context(() => {
      initScrollProgress();
      initEngine();
    });
    return () => {
      ctx.revert();
      revertSplits();
      destroySmoothScroll();
    };
  }, []);
}
