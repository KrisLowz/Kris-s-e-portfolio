/**
 * Navigation scroll behaviours, all driven by ScrollTrigger (no raw scroll
 * listeners): glass-panel morph on scroll, auto-hide on scroll-down /
 * reveal on scroll-up, and active-section link highlighting.
 *
 * Markup contract (set in Navigation.tsx):
 *   nav                         → the fixed bar (translated to hide/show)
 *   [data-nav-pill]             → the inner pill (gets `glass-panel` on scroll)
 *   nav a[href="#section-id"]   → links that get `nav-active` for the section in view
 */
import { gsap, ScrollTrigger } from './register';
import { CONFIG } from './config';

export function initNav() {
  const nav = document.querySelector<HTMLElement>('nav');
  const pill = document.querySelector<HTMLElement>('[data-nav-pill]');
  if (!nav) return;

  // 1. Glass morph past 20px.
  let glassed = false;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const scrolled = self.scroll() > 20;
      if (scrolled !== glassed && pill) {
        glassed = scrolled;
        pill.classList.toggle('glass-panel', scrolled);
        gsap.to(pill, {
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    },
  });

  // 2. Auto-hide on scroll-down, reveal on scroll-up (skip near the top).
  if (CONFIG.toggles.navAutoHide && !CONFIG.reducedMotion) {
    const showTo = gsap.quickTo(nav, 'yPercent', { duration: 0.4, ease: 'power3.out' });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (self.scroll() < 250) {
          showTo(0);
          return;
        }
        showTo(self.direction === 1 ? -120 : 0);
      },
    });
  }

  // 3. Active-section link highlighting.
  const sections = ['#about', '#experience', '#projects', '#contact'];
  sections.forEach((id) => {
    const section = document.querySelector(id);
    const link = nav.querySelector<HTMLElement>(`a[href="${id}"]`);
    if (!section || !link) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('nav-active', self.isActive),
    });
  });
}
