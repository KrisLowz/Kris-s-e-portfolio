/**
 * Text-scramble ("decode") effect. Any element carrying `data-scramble` has its
 * text scrambled then resolved left-to-right when it scrolls into view. Use only
 * on TEXT-ONLY elements — it writes textContent, so it would wipe child icons.
 *
 * Driven by a GSAP tween (the same ticker as the rest of the motion layer)
 * rather than a raw rAF loop, so it stays in sync and works reliably. The
 * ScrollTriggers are created inside the animation gsap.context (reverted with
 * it); destroyScramble() kills any in-flight scramble tweens on teardown.
 */
import { gsap } from './register';
import { ScrollTrigger } from './register';
import { CONFIG } from './config';

const CHARS = '!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

let tweens: gsap.core.Tween[] = [];
const running = new WeakSet<HTMLElement>();

function scrambleEl(el: HTMLElement, duration = 0.9): void {
  const final = (el.getAttribute('data-scramble-text') || '').trim();
  // Ignore re-entry while already animating (ScrollTrigger can re-fire as smooth
  // scroll settles).
  if (!final || running.has(el)) return;
  running.add(el);

  const state = { p: 0 };
  const tween = gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      const revealed = Math.floor(state.p * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        if (i < revealed || final[i] === ' ') out += final[i];
        else out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
    },
    onComplete: () => {
      el.textContent = final;
      running.delete(el);
    },
  });
  tweens.push(tween);
}

export function initScramble(): void {
  if (CONFIG.reducedMotion) return;
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    // Capture the ORIGINAL text only once. On re-init (StrictMode/HMR), the
    // visible text may be mid-scramble — never overwrite the stored original
    // with a scrambled value, and restore the display to the original.
    if (!el.getAttribute('data-scramble-text')) {
      el.setAttribute('data-scramble-text', (el.textContent || '').trim());
    } else {
      el.textContent = el.getAttribute('data-scramble-text') || '';
    }
    running.delete(el);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => scrambleEl(el),
      onEnterBack: () => scrambleEl(el),
    });
  });
}

export function destroyScramble(): void {
  tweens.forEach((t) => t.kill());
  tweens = [];
}
