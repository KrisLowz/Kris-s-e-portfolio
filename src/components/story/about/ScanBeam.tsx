import { useRef, useEffect } from 'react';
import { gsap } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';

/** A cyan scan beam that sweeps left→right across the About dossier, scrubbed
 *  by the section's scroll. Non-pinning (React-safe). Renders nothing when the
 *  sectionFx gate is off (reduced-motion / mobile). */
export default function ScanBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const on = cinematicOn('sectionFx');

  useEffect(() => {
    if (!on) return;
    const el = ref.current;
    const section = el?.closest('section');
    if (!el || !section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { xPercent: -130 },
        {
          xPercent: 130,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [on]);

  if (!on) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/3 bg-gradient-to-r from-transparent via-pop-primary/15 to-transparent blur-md"
    />
  );
}
