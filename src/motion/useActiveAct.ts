import { useEffect, useState } from 'react';
import { StoryActId } from '../types';
import { SECTION_ACTS } from '../content';
import { CONFIG } from './config';

/** Pick the act whose section centre is nearest the viewport midpoint. Pure. */
export function nearestAct(centers: { id: StoryActId; center: number }[], mid: number): StoryActId {
  let best = centers[0].id;
  let bestD = Infinity;
  for (const c of centers) {
    const d = Math.abs(c.center - mid);
    if (d < bestD) { bestD = d; best = c.id; }
  }
  return best;
}

/** The act currently nearest the viewport centre, as React state (updates only
 *  when it changes). No-op under reduced motion (the mascot is static there).
 *  Uses a passive scroll listener coalesced to one measure per frame. */
export function useActiveAct(): StoryActId {
  const [act, setAct] = useState<StoryActId>('hero');
  useEffect(() => {
    if (CONFIG.reducedMotion) return;
    let ticking = false;
    const compute = () => {
      const mid = window.innerHeight / 2;
      const centers = SECTION_ACTS
        .map((a) => {
          const el = document.getElementById(a.sectionId);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { id: a.id, center: r.top + r.height / 2 };
        })
        .filter((c): c is { id: StoryActId; center: number } => c !== null);
      if (!centers.length) return;
      const next = nearestAct(centers, mid);
      setAct((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { compute(); ticking = false; });
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return act;
}
