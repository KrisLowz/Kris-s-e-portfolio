/**
 * GSAP plugin registration. Import this module's `gsap` export everywhere in the
 * animation layer so there is exactly ONE gsap instance (the npm one) — this
 * replaces the old `window.gsap` CDN global that several components relied on.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

// Register on import so even components that grab `gsap` directly are safe.
registerGsap();

// Dev-only: expose for debugging in the browser console.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).gsap = gsap;
  (window as unknown as Record<string, unknown>).ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger, SplitText };
