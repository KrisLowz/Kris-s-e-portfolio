/**
 * GSAP plugin registration. Import this module's `gsap` export everywhere in the
 * animation layer so there is exactly ONE gsap instance (the npm one) — this
 * replaces the old `window.gsap` CDN global that several components relied on.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Observer } from 'gsap/Observer';
import { Flip } from 'gsap/Flip';

let registered = false;

export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, Observer, Flip);
  registered = true;
}

// Register on import so even components that grab `gsap` directly are safe.
registerGsap();

export { gsap, ScrollTrigger, SplitText, Observer, Flip };
