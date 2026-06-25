/**
 * Smooth scrolling via Lenis, synced to GSAP ScrollTrigger.
 *
 * Lenis is used instead of GSAP ScrollSmoother because the site has 11+
 * `position: fixed` overlays (cursor, nav, backgrounds, modal). Lenis
 * smooths the *native* scroll position, so fixed elements keep working with zero
 * DOM restructuring — ScrollSmoother's transform wrapper would break them all.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './register';
import { CONFIG } from './config';

let lenis: Lenis | null = null;
let rafId: ((time: number) => void) | null = null;
let anchorHandler: ((e: Event) => void) | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

export function initSmoothScroll(): Lenis | null {
  if (CONFIG.reducedMotion || !CONFIG.toggles.smoothScroll) return null;
  if (lenis) return lenis;

  lenis = new Lenis({
    lerp: CONFIG.smooth.lerp,
    wheelMultiplier: CONFIG.smooth.wheelMultiplier,
    smoothWheel: true,
  });

  // Drive Lenis from GSAP's ticker so scroll + animations share one rAF loop.
  lenis.on('scroll', ScrollTrigger.update);
  rafId = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(rafId);
  gsap.ticker.lagSmoothing(0);

  // Dev-only: expose for debugging (mirrors register.ts exposing gsap).
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).lenis = lenis;
  }

  // Intercept in-page anchor links so they ease-scroll with a nav offset.
  anchorHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const dest = document.querySelector(hash);
    if (!dest) return;
    e.preventDefault();
    lenis?.scrollTo(dest as HTMLElement, {
      offset: -CONFIG.smooth.anchorOffset,
      duration: 1.2,
    });
  };
  document.addEventListener('click', anchorHandler);

  return lenis;
}

export function destroySmoothScroll() {
  if (rafId) {
    gsap.ticker.remove(rafId);
    rafId = null;
  }
  if (anchorHandler) {
    document.removeEventListener('click', anchorHandler);
    anchorHandler = null;
  }
  lenis?.destroy();
  lenis = null;
}
