import React, { useRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, CONFIG } from '../animations';

/**
 * Spawns an expanding ripple every ~200px scrolled. Rebuilt on GSAP (transform/
 * opacity tween, one shared CSS class) — the old version injected a duplicate
 * <style> keyframe block into every ripple and re-rendered React per spawn.
 * Disabled under reduced motion.
 */
const ScrollRippleEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (CONFIG.reducedMotion || !CONFIG.toggles.scrollRipples) return;
    const container = containerRef.current;
    if (!container) return;

    let last = 0;
    const spawn = () => {
      const el = document.createElement('div');
      el.className = 'scroll-ripple';
      el.style.left = `${Math.random() * window.innerWidth}px`;
      el.style.top = `${window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.3}px`;
      container.appendChild(el);
      gsap.fromTo(
        el,
        { scale: 1, autoAlpha: 0.6 },
        {
          scale: 3,
          autoAlpha: 0,
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => el.remove(),
        }
      );
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const cur = self.scroll();
        if (Math.abs(cur - last) > 200) {
          last = cur;
          spawn();
        }
      },
    });

    return () => {
      st.kill();
      container.querySelectorAll('.scroll-ripple').forEach((n) => n.remove());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-30" aria-hidden="true" />;
};

export default ScrollRippleEffect;
