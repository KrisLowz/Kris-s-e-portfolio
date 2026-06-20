/**
 * 3D pointer tilt for cards. Uses gsap.quickTo on rotationX/rotationY (no direct
 * style.transform writes, so it never fights the reveal/deck tweens). Honors
 * transform-perspective and springs back on leave. Disabled on touch / reduced
 * motion. Returns a cleanup function.
 */
import { gsap } from './register';
import { CONFIG } from './config';

export function applyTilt(el: HTMLElement, max = 6): () => void {
  if (CONFIG.reducedMotion || !CONFIG.toggles.tilt || CONFIG.isTouch) {
    return () => {};
  }

  gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' });
  const rxTo = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' });
  const ryTo = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });

  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rxTo(-py * max * 2);
    ryTo(px * max * 2);
  };

  const onLeave = () => {
    gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' });
  };

  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);

  return () => {
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
  };
}
