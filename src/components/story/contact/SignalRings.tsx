import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';

/** Concentric signal rings that pulse outward behind the relay submit button.
 *  Continuous loop, paused when Contact is offscreen; renders nothing when the
 *  sectionFx gate is off (reduced-motion / mobile). */
export default function SignalRings() {
  const ref = useRef<HTMLDivElement>(null);
  const on = cinematicOn('sectionFx');

  useEffect(() => {
    if (!on) return;
    const root = ref.current;
    const section = root?.closest('section');
    if (!root || !section) return;
    const rings = root.querySelectorAll<HTMLElement>('[data-ring]');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, paused: true });
      rings.forEach((r, i) => {
        tl.fromTo(
          r,
          { scale: 0.4, autoAlpha: 0.6 },
          { scale: 1.6, autoAlpha: 0, duration: 2, ease: 'sine.out' },
          i * 0.6
        );
      });
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
    }, root);
    return () => ctx.revert();
  }, [on]);

  if (!on) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
      {[0, 1, 2].map((i) => (
        <span key={i} data-ring className="absolute h-16 w-16 rounded-full border border-pop-primary/40" />
      ))}
    </div>
  );
}
