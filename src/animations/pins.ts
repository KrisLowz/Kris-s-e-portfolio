/**
 * Pinned / scrub-driven sections. Each function is selector-based and self-
 * contained, and each branches internally for desktop (full effect, may pin),
 * mobile (lighter, no pin), and reduced-motion (instant, visible).
 *
 * The components only supply markup + classes; they run no GSAP of their own.
 */
import { gsap, ScrollTrigger } from './register';
import { CONFIG, dur } from './config';

const canPin = () => CONFIG.toggles.pins && !CONFIG.isMobile && !CONFIG.reducedMotion;

/* ----------------------------------------------------------------------------
 * 1. Hero exit — content parallaxes up, fades and scales as you leave.
 * ------------------------------------------------------------------------- */
export function heroExit() {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  const content = document.querySelector<HTMLElement>('[data-hero-content]');
  if (!section || !content) return;
  if (CONFIG.reducedMotion) return;

  if (canPin()) {
    gsap.to(content, {
      yPercent: -18,
      autoAlpha: 0,
      scale: 0.96,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        pinSpacing: false,
      },
    });
  } else {
    gsap.to(content, {
      yPercent: -10,
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom 30%',
        scrub: true,
      },
    });
  }
}

/* ----------------------------------------------------------------------------
 * 2. About — "solar system assembly". Rings sweep outward from the core
 *    (scaling from 0 makes the planets fly out), watermark scales in, then the
 *    perpetual orbit rotation takes over. Pinned on desktop.
 * ------------------------------------------------------------------------- */
export function aboutAssembly() {
  const section = document.querySelector<HTMLElement>('#about');
  const container = document.querySelector<HTMLElement>('.solar-system-container');
  if (!section || !container) return;

  const ring1 = container.querySelector<HTMLElement>('.orbit-ring-1');
  const ring2 = container.querySelector<HTMLElement>('.orbit-ring-2');
  const watermark = container.querySelector<HTMLElement>('.solar-bg-text');
  const core = container.querySelector<HTMLElement>('.sun-core');
  const innerPlanets = container.querySelectorAll<HTMLElement>('.planet-inner-1');
  const outerPlanets = container.querySelectorAll<HTMLElement>('.planet-inner-2');

  // Perpetual rotation (runs always; paused off-screen). Counter-rotate the
  // inner chips so icons stay upright. These use `rotation` only — assembly
  // animates `scale`, so the two never collide.
  const loops: gsap.core.Tween[] = [];
  const startLoops = () => {
    if (CONFIG.reducedMotion) return;
    loops.push(gsap.to(ring1, { rotation: 360, duration: 30, repeat: -1, ease: 'none' }));
    loops.push(gsap.to(ring2, { rotation: -360, duration: 45, repeat: -1, ease: 'none' }));
    loops.push(gsap.to('.planet-inner-1', { rotation: -360, duration: 30, repeat: -1, ease: 'none' }));
    loops.push(gsap.to('.planet-inner-2', { rotation: 360, duration: 45, repeat: -1, ease: 'none' }));
  };

  if (CONFIG.reducedMotion) {
    gsap.set([ring1, ring2], { autoAlpha: 1, scale: 1 });
    gsap.set(watermark, { autoAlpha: 0.15 });
    return;
  }

  // Initial collapsed state.
  gsap.set([ring1, ring2], { scale: 0, autoAlpha: 0 });
  gsap.set([...innerPlanets, ...outerPlanets], { scale: 0 });
  gsap.set(watermark, { autoAlpha: 0, scale: 0.8 });
  gsap.set(core, { scale: 0 });

  const build = (scrub: boolean) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: scrub ? 'top top' : 'top 50%',
        scrub: scrub ? 1 : false,
        pin: scrub,
        pinSpacing: scrub,
        onEnter: startLoops,
      },
    });

    tl.to(watermark, { autoAlpha: 0.15, scale: 1, duration: 1, ease: 'sine.out' }, 0)
      .to(core, { scale: 1, duration: 0.6, ease: CONFIG.ease.pop }, 0.1)
      .to([ring1, ring2], { scale: 1, autoAlpha: 1, duration: 1, ease: CONFIG.ease.expo }, 0.2)
      .to(
        innerPlanets,
        { scale: 1, duration: 0.5, ease: CONFIG.ease.pop, stagger: 0.04 },
        0.4
      )
      .to(
        outerPlanets,
        { scale: 1, duration: 0.5, ease: CONFIG.ease.pop, stagger: 0.04 },
        0.5
      );
    return tl;
  };

  build(canPin());

  // Pause loops while off-screen.
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => loops.forEach((t) => (self.isActive ? t.play() : t.pause())),
  });
}

/* ----------------------------------------------------------------------------
 * 3. Projects — staggered "deck" reveal. Cards rise and scale in sequence with
 *    a slight alternating tilt. Pinned + scrubbed on desktop; plain stagger on
 *    mobile / reduced.
 * ------------------------------------------------------------------------- */
export function projectsDeck() {
  const section = document.querySelector<HTMLElement>('#projects');
  const grid = document.querySelector<HTMLElement>('[data-projects-grid]');
  if (!section || !grid) return;

  const cards = gsap.utils.toArray<HTMLElement>('[data-project-card]');
  if (!cards.length) return;

  if (CONFIG.reducedMotion) {
    gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1, rotation: 0 });
    return;
  }

  gsap.set(cards, { autoAlpha: 0, y: 80, scale: 0.92, rotation: (i) => (i % 2 ? 2 : -2) });

  if (canPin()) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 75%',
        end: 'bottom 80%',
        scrub: 1,
      },
    });
    tl.to(cards, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 1,
      ease: CONFIG.ease.smooth,
      stagger: 0.25,
    });
  } else {
    ScrollTrigger.create({
      trigger: grid,
      start: 'top 80%',
      onEnter: () =>
        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: dur(0.8),
          ease: CONFIG.ease.smooth,
          stagger: CONFIG.stagger.cards,
        }),
    });
  }
}

export function initPins() {
  heroExit();
  aboutAssembly();
  projectsDeck();
}
