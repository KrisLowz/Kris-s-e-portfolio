import React, { useRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '../animations';

/**
 * Top scroll-progress bar. Driven by a single ScrollTrigger writing scaleX
 * (compositor-friendly transform) instead of the old per-scroll-event React
 * setState animating `width` (layout + paint every frame).
 */
const ScrollProgressBar: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
    const setX = gsap.quickSetter(el, 'scaleX');
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setX(self.progress),
    });
    return () => st.kill();
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-pop-primary via-purple-500 to-cyan-500 z-40"
    />
  );
};

export default ScrollProgressBar;
