/**
 * Magnetic pull helper used by MagneticButton. Uses gsap.quickTo for smooth,
 * non-stacking tweens and honours a `strength` parameter (the old component
 * accepted `strength` but ignored it). Disabled on touch / reduced motion.
 *
 * Returns a cleanup function.
 */
import { gsap } from './register';
import { CONFIG } from './config';

export function applyMagnetic(el: HTMLElement, strength = 30): () => void {
  if (CONFIG.reducedMotion || !CONFIG.toggles.magnetic || CONFIG.isTouch) {
    return () => {};
  }

  // Normalise strength (default 30) to the previous feel (~0.3 translate factor).
  const factor = (strength / 100) * 1;
  const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
  const rTo = gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power3' });

  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    xTo(dx * factor);
    yTo(dy * factor);
    rTo(dx * factor * 0.15);
  };

  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.3)' });
  };

  const onDown = () => gsap.to(el, { scale: 0.94, duration: 0.2, ease: 'power2.out' });
  const onUp = () => gsap.to(el, { scale: 1, duration: 0.3, ease: 'back.out(2)' });

  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  el.addEventListener('mousedown', onDown);
  el.addEventListener('mouseup', onUp);

  return () => {
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
    el.removeEventListener('mousedown', onDown);
    el.removeEventListener('mouseup', onUp);
  };
}
