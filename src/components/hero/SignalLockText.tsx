import { useEffect, useState } from 'react';
import { signalLock } from './signalLock';
import { CONFIG } from '../../motion/config';

/** Drives a signal-lock reveal of `text` once, synced to the intro (`intro:type`)
 *  with a timeout fallback. Static under reduced motion. */
export default function SignalLockText({
  text,
  durationMs = 1600,
}: {
  text: string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(() =>
    CONFIG.reducedMotion ? text : signalLock(text, 0, 0)
  );

  useEffect(() => {
    if (CONFIG.reducedMotion) {
      setDisplay(text);
      return;
    }
    let rafId = 0;
    let startTs = 0;
    let tick = 0;
    let started = false;

    const step = (now: number) => {
      if (!startTs) startTs = now;
      const p = Math.min(1, (now - startTs) / durationMs);
      tick += 1;
      setDisplay(signalLock(text, p, tick));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    const start = () => {
      if (started) return;
      started = true;
      rafId = requestAnimationFrame(step);
    };

    window.addEventListener('intro:type', start, { once: true });
    const fallback = window.setTimeout(start, 1400);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('intro:type', start);
      clearTimeout(fallback);
    };
  }, [text, durationMs]);

  return <span aria-label={text}>{display}</span>;
}
