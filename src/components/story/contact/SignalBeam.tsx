import { useEffect, useRef } from 'react';
import { gsap } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';

/** A one-shot beam that shoots upward when mounted (i.e. when the form is sent).
 *  Transform/opacity only; renders nothing when the sectionFx gate is off. */
export default function SignalBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const on = cinematicOn('sectionFx');
  useEffect(() => {
    if (!on) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleY: 0, autoAlpha: 0.9, transformOrigin: 'bottom center' },
        { scaleY: 1, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [on]);
  if (!on) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute bottom-full left-8 h-[55vh] w-1 bg-gradient-to-t from-pop-primary to-transparent opacity-0 will-change-transform"
    />
  );
}
