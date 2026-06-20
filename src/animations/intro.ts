/**
 * Preloader + choreographed intro.
 *
 * Sequence: branded loader (logo pop, wordmark, progress draw) → curtain lift →
 * nav slides in → hero headline splits into chars and rises → badge, sub, CTAs
 * and socials cascade. After the headline reveals, fires `intro:type` so the
 * Hero can start its Typed.js typewriter in sync.
 *
 * Reduced motion: the Preloader component renders nothing, and this just makes
 * the hero visible with no animation.
 */
import { gsap, SplitText } from './register';
import { CONFIG, dur } from './config';

const introSplits: SplitText[] = [];

export function runIntro(): Promise<void> {
  return new Promise((resolve) => {
    const badge = document.querySelector<HTMLElement>('[data-hero-badge]');
    const headline = document.querySelector<HTMLElement>('[data-hero-headline]');
    const sub = document.querySelector<HTMLElement>('[data-hero-sub]');
    const ctas = gsap.utils.toArray<HTMLElement>('[data-hero-cta]');
    const socials = gsap.utils.toArray<HTMLElement>('[data-hero-social]');
    const nav = document.querySelector<HTMLElement>('nav');

    const startType = () => window.dispatchEvent(new CustomEvent('intro:type'));

    if (CONFIG.reducedMotion) {
      startType();
      resolve();
      return;
    }

    // Split the static headline ("Hi, I am") into masked chars.
    let chars: Element[] = [];
    if (headline) {
      const split = new SplitText(headline, { type: 'chars', mask: 'chars' });
      introSplits.push(split);
      chars = split.chars;
      gsap.set(chars, { yPercent: 120 });
    }

    // Hidden initial states (hero is covered by the preloader, so no FOUC).
    if (nav) gsap.set(nav, { yPercent: -120, autoAlpha: 0 });
    gsap.set([badge, sub, ...ctas, ...socials].filter(Boolean), { autoAlpha: 0, y: 30 });

    const preloader = document.getElementById('preloader');
    const master = gsap.timeline({ onComplete: resolve });

    // --- Preloader phase ------------------------------------------------------
    if (preloader && CONFIG.toggles.preloader) {
      const logo = preloader.querySelector('[data-pl-logo]');
      const word = preloader.querySelector('[data-pl-word]');
      const bar = preloader.querySelector('[data-pl-bar]');

      gsap.set(preloader, { autoAlpha: 1 });
      gsap.set(logo, { scale: 0, rotation: -90 });
      gsap.set(word, { autoAlpha: 0, y: 20, filter: 'blur(8px)' });
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

      master
        .to(logo, { scale: 1, rotation: 0, duration: 0.7, ease: CONFIG.ease.pop })
        .to(word, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .to(bar, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '-=0.2')
        .to([logo, word], { autoAlpha: 0, y: -20, duration: 0.4, ease: 'power2.in' }, '+=0.1')
        .to(preloader, {
          yPercent: -100,
          duration: 0.9,
          ease: 'expo.inOut',
          onComplete: () => gsap.set(preloader, { display: 'none' }),
        }, '-=0.1');
    }

    // --- Content intro phase --------------------------------------------------
    const intro = gsap.timeline();

    if (nav) {
      intro.to(nav, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: CONFIG.ease.smooth }, 0);
    }
    if (badge) {
      intro.to(badge, { autoAlpha: 1, y: 0, duration: 0.6, ease: CONFIG.ease.pop }, 0.15);
    }
    if (chars.length) {
      intro.to(
        chars,
        {
          yPercent: 0,
          duration: dur(CONFIG.duration.chars),
          ease: CONFIG.ease.expo,
          stagger: CONFIG.stagger.chars,
          onStart: startType,
        },
        0.25
      );
    } else {
      startType();
    }
    if (sub) {
      intro.to(sub, { autoAlpha: 1, y: 0, duration: 0.7, ease: CONFIG.ease.smooth }, 0.5);
    }
    if (ctas.length) {
      intro.to(ctas, { autoAlpha: 1, y: 0, duration: 0.6, ease: CONFIG.ease.smooth, stagger: 0.1 }, 0.65);
    }
    if (socials.length) {
      intro.to(socials, { autoAlpha: 1, y: 0, duration: 0.5, ease: CONFIG.ease.pop, stagger: 0.08 }, 0.8);
    }

    // Overlap the content intro with the tail of the curtain lift.
    master.add(intro, CONFIG.toggles.preloader && preloader ? '-=0.5' : 0);
  });
}

export function revertIntroSplits() {
  introSplits.forEach((s) => s.revert());
  introSplits.length = 0;
}
