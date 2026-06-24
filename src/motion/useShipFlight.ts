import { useEffect, RefObject } from 'react';
import { gsap } from './register';
import { CONFIG } from './config';
import { SHIP_PATH } from './shipPath';

/** Drives a viewport-fixed ship element along SHIP_PATH, scrubbed by global
 *  page scroll. Uses transform (x/y/rotate/scale) with function-based values so
 *  the path is responsive (ScrollTrigger re-evaluates them on resize/refresh).
 *  No-op (ship keeps its CSS position) under reduced motion, mobile, or when
 *  the shipFlight toggle is off. */
export function useShipFlight(shipRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const ship = shipRef.current;
    if (!ship) return;
    if (CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.shipFlight) return;

    const ctx = gsap.context(() => {
      const first = SHIP_PATH[0];
      gsap.set(ship, {
        xPercent: -50,
        yPercent: -50,
        x: () => first.x * window.innerWidth,
        y: () => first.y * window.innerHeight,
        rotate: first.rotate,
        scale: first.scale,
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { start: 0, end: 'max', scrub: 0.6, invalidateOnRefresh: true },
      });

      for (let i = 1; i < SHIP_PATH.length; i++) {
        const w = SHIP_PATH[i];
        tl.to(ship, {
          x: () => w.x * window.innerWidth,
          y: () => w.y * window.innerHeight,
          rotate: w.rotate,
          scale: w.scale,
        });
      }
    });

    return () => ctx.revert();
  }, [shipRef]);
}
