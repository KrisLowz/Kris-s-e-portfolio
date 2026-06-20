/**
 * Custom cursor driven by gsap.quickTo (one persistent tween per axis instead of
 * a new tween every mousemove). Fine-pointer devices only — on touch the cursor
 * and click particles are skipped entirely.
 *
 * Expects two elements rendered by CustomCursor.tsx: `.custom-cursor` (ring) and
 * `.custom-cursor-dot` (dot).
 */
import { gsap } from './register';
import { CONFIG } from './config';

let cleanup: (() => void) | null = null;

export function initCursor() {
  if (CONFIG.reducedMotion || !CONFIG.toggles.cursor || CONFIG.isTouch) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const ring = document.querySelector<HTMLElement>('.custom-cursor');
  const dot = document.querySelector<HTMLElement>('.custom-cursor-dot');
  if (!ring || !dot) return;

  gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });

  const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3' });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });

  const onMove = (e: MouseEvent) => {
    ringX(e.clientX);
    ringY(e.clientY);
    dotX(e.clientX);
    dotY(e.clientY);
  };

  // Hover state — grow ring over interactive elements.
  const interactive = 'a, button, .cursor-pointer, [data-cursor="hover"], input, textarea';
  const onOver = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(interactive)) ring.classList.add('hovering');
  };
  const onOut = (e: MouseEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !related.closest(interactive)) ring.classList.remove('hovering');
  };

  // Click feedback — quick ring squash + particle burst.
  const onClick = (e: MouseEvent) => {
    gsap.fromTo(
      ring,
      { scale: 0.7 },
      { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }
    );
    spawnParticles(e.clientX, e.clientY);
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);
  window.addEventListener('click', onClick);

  cleanup = () => {
    window.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseover', onOver);
    document.removeEventListener('mouseout', onOut);
    window.removeEventListener('click', onClick);
  };
}

function spawnParticles(x: number, y: number) {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'click-particle';
    document.body.appendChild(p);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 30 + Math.random() * 50;
    gsap.fromTo(
      p,
      { x, y, opacity: 1, scale: 1, xPercent: -50, yPercent: -50 },
      {
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => p.remove(),
      }
    );
  }
}

export function destroyCursor() {
  cleanup?.();
  cleanup = null;
}
