import React, { useRef, useLayoutEffect } from 'react';
import { gsap, CONFIG } from '../animations';

/**
 * Soft accent glow that trails the cursor across the page (fine-pointer only).
 * Rebuilt with gsap.quickTo + an idle-fade — the old version was dead code
 * (no [data-glow-section] targets existed) and re-rendered React on every
 * mousemove. Subtle by design; sits behind content.
 */
const SectionHoverGlow: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (CONFIG.reducedMotion || CONFIG.isTouch || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' });

    let visible = false;
    let idle: number | undefined;

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to(el, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        visible = false;
        gsap.to(el, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' });
      }, 500);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[1]"
      style={{
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(var(--spotlight-rgb), 0.12) 0%, transparent 65%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
      }}
    />
  );
};

export default SectionHoverGlow;
