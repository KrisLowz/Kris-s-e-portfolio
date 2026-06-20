/**
 * Pointer-interaction auto-wiring. Scans the DOM for elements opting into 3D
 * tilt (`data-tilt`) or magnetic pull (`data-magnetic`) and attaches the
 * helpers, so any markup becomes cursor-reactive without bespoke wiring.
 *
 * Note: the helpers drive the element's transform via GSAP, so an element with
 * `data-tilt`/`data-magnetic` must NOT also carry a CSS `hover:` transform
 * (translate/scale/rotate) — they'd fight over the same matrix. Inner layers can
 * still use `translateZ` for depth (different element = no conflict).
 *
 * Listeners aren't GSAP tweens, so the gsap.context can't revert them — call
 * destroyInteractions() on teardown.
 */
import { gsap } from './register';
import { CONFIG } from './config';
import { applyTilt } from './tilt';
import { applyMagnetic } from './magnetic';

let cleanups: Array<() => void> = [];

function num(el: HTMLElement, attr: string, fallback: number): number {
  const v = el.getAttribute(attr);
  if (v == null || v === '') return fallback;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

export function initInteractions(): void {
  if (CONFIG.reducedMotion || CONFIG.isTouch) return;

  gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((el) => {
    cleanups.push(applyTilt(el, num(el, 'data-tilt', 6)));
  });

  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    cleanups.push(applyMagnetic(el, num(el, 'data-magnetic', 30)));
  });
}

export function destroyInteractions(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];
}
