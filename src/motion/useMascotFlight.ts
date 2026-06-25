import { useEffect, RefObject } from 'react';
import { gsap } from './register';
import { cinematicOn } from './config';
import { SHIP_PATH } from './shipPath';

/** Viewport-fraction offset so the mascot rides just off the ship's flank. */
const OFFSET_X = 0.05;
const OFFSET_Y = 0.06;
/** Mascot scale relative to the ship's per-waypoint scale. */
const MASCOT_SCALE = 0.55;

/** Drives the mascot's OUTER wrapper along SHIP_PATH (offset from the ship),
 *  scrubbed by global scroll. Transform-only, function-based (responsive),
 *  inside a reverted gsap.context. No-op under reduced motion / mobile / when
 *  the mascot toggle is off (the wrapper keeps its static CSS position). */
export function useMascotFlight(ref: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!cinematicOn('mascot')) return;
    const ctx = gsap.context(() => {
      const first = SHIP_PATH[0];
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: () => (first.x + OFFSET_X) * window.innerWidth,
        y: () => (first.y + OFFSET_Y) * window.innerHeight,
        scale: first.scale * MASCOT_SCALE,
      });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { start: 0, end: 'max', scrub: 0.6, invalidateOnRefresh: true },
      });
      for (let i = 1; i < SHIP_PATH.length; i++) {
        const w = SHIP_PATH[i];
        tl.to(el, {
          x: () => (w.x + OFFSET_X) * window.innerWidth,
          y: () => (w.y + OFFSET_Y) * window.innerHeight,
          scale: w.scale * MASCOT_SCALE,
        });
      }
    });
    return () => ctx.revert();
  }, [ref]);
}
