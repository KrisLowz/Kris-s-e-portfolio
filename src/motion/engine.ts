/**
 * The data-attribute animation engine.
 *
 * Any element on the page (now or added later) animates automatically by
 * carrying a `data-anim` attribute. The engine scans the DOM, sets safe initial
 * states, and wires a ScrollTrigger per element/group.
 *
 * Attribute API
 * -------------
 *  data-anim="fade-up | fade-in | scale | pop | clip | clip-left | chars | words | lines | draw | draw-y"
 *  data-delay="0.2"          extra delay (s) before this element animates
 *  data-duration="1"         override the effect duration (s)
 *  data-stagger="0.08"       put on a CONTAINER → its [data-anim] children reveal
 *                            together with this stagger (one trigger, grid-friendly)
 *  data-speed="0.9"          parallax: <1 lags (slower), >1 leads (faster)
 *  data-float                continuous subtle float+rotate loop (decorative accents)
 *  data-velocity             skew this element on fast scroll
 *  data-tint="#818cf8"       put on a SECTION → cross-fades this hue into the
 *                            global tint layer while the section is in view
 *
 * No element is ever left permanently hidden: initial opacity:0 is applied only
 * inside `<html class="anim-ready">` (set by a synchronous inline script that
 * runs only when motion is allowed), so a JS failure leaves everything visible.
 */
import { gsap, ScrollTrigger, SplitText } from './register';
import { CONFIG, dur, revealDistance } from './config';

const splits: SplitText[] = [];

type AnimType =
  | 'fade-up'
  | 'fade-in'
  | 'scale'
  | 'pop'
  | 'clip'
  | 'clip-left'
  | 'chars'
  | 'words'
  | 'lines'
  | 'draw'
  | 'draw-y';

function num(el: HTMLElement, attr: string, fallback: number): number {
  const v = el.getAttribute(attr);
  if (v == null || v === '') return fallback;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

/** Build the from/to vars for a single element's reveal effect. */
function effectVars(el: HTMLElement, type: AnimType) {
  const delay = num(el, 'data-delay', 0);
  const d = num(el, 'data-duration', 0);
  const ease = CONFIG.ease.smooth;

  switch (type) {
    case 'fade-in':
      return {
        from: { autoAlpha: 0 },
        to: { autoAlpha: 1, duration: d || dur(CONFIG.duration.reveal), ease, delay },
      };
    case 'scale':
      return {
        from: { autoAlpha: 0, scale: 0.9 },
        to: { autoAlpha: 1, scale: 1, duration: d || dur(CONFIG.duration.reveal), ease, delay },
      };
    case 'pop':
      return {
        from: { autoAlpha: 0, scale: 0.6 },
        to: {
          autoAlpha: 1,
          scale: 1,
          duration: d || dur(0.7),
          ease: CONFIG.ease.pop,
          delay,
        },
      };
    case 'clip':
      return {
        from: { autoAlpha: 1, clipPath: 'inset(0 0 100% 0)' },
        to: {
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: d || dur(CONFIG.duration.clip),
          ease: CONFIG.ease.expo,
          delay,
        },
      };
    case 'clip-left':
      return {
        from: { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' },
        to: {
          autoAlpha: 1,
          clipPath: 'inset(0 0% 0 0)',
          duration: d || dur(CONFIG.duration.clip),
          ease: CONFIG.ease.expo,
          delay,
        },
      };
    case 'draw':
      return {
        from: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 1 },
        to: { scaleX: 1, duration: d || dur(0.8), ease: CONFIG.ease.inOut, delay },
      };
    case 'draw-y':
      return {
        from: { scaleY: 0, transformOrigin: 'top center', autoAlpha: 1 },
        to: { scaleY: 1, duration: d || dur(0.9), ease: CONFIG.ease.inOut, delay },
      };
    case 'fade-up':
    default:
      return {
        from: { autoAlpha: 0, y: revealDistance() },
        to: { autoAlpha: 1, y: 0, duration: d || dur(CONFIG.duration.reveal), ease, delay },
      };
  }
}

/** Split-text effects (chars/words/lines) with masked line containers. */
function buildSplitReveal(el: HTMLElement, type: 'chars' | 'words' | 'lines') {
  const splitType =
    type === 'chars' ? 'chars,words' : type === 'words' ? 'words,lines' : 'lines';
  const split = new SplitText(el, {
    type: splitType,
    mask: 'lines',
    linesClass: 'anim-line',
  });
  splits.push(split);

  const targets =
    type === 'chars' ? split.chars : type === 'words' ? split.words : split.lines;
  const stagger =
    type === 'chars'
      ? CONFIG.stagger.chars
      : type === 'words'
      ? CONFIG.stagger.words
      : CONFIG.stagger.lines;

  const delay = num(el, 'data-delay', 0);

  gsap.set(targets, { yPercent: 110 });
  gsap.set(el, { autoAlpha: 1 });

  return ScrollTrigger.create({
    trigger: el,
    start: CONFIG.revealStart,
    once: false,
    onEnter: () =>
      gsap.to(targets, {
        yPercent: 0,
        duration: dur(CONFIG.duration.chars),
        ease: CONFIG.ease.expo,
        stagger,
        delay,
        overwrite: true,
      }),
    onLeaveBack: () => gsap.set(targets, { yPercent: 110 }),
  });
}

/** A stagger container: reveal its [data-anim] children with one trigger. */
function buildStaggerContainer(container: HTMLElement, claimed: Set<HTMLElement>) {
  const stagger = num(container, 'data-stagger', CONFIG.stagger.cards);
  const kids = Array.from(
    container.querySelectorAll<HTMLElement>(':scope [data-anim]')
  ).filter((k) => k.closest('[data-stagger]') === container);

  if (!kids.length) return;

  // Group children by their effect so each group animates with correct vars.
  kids.forEach((k) => {
    const type = (k.getAttribute('data-anim') || 'fade-up') as AnimType;
    const { from } = effectVars(k, type);
    gsap.set(k, from);
    claimed.add(k);
  });

  ScrollTrigger.create({
    trigger: container,
    start: CONFIG.revealStart,
    onEnter: () => {
      kids.forEach((k, i) => {
        const type = (k.getAttribute('data-anim') || 'fade-up') as AnimType;
        const { to } = effectVars(k, type);
        gsap.to(k, { ...to, delay: (to.delay || 0) + i * stagger, overwrite: true });
      });
    },
    onLeaveBack: () => {
      kids.forEach((k) => {
        const type = (k.getAttribute('data-anim') || 'fade-up') as AnimType;
        const { from } = effectVars(k, type);
        gsap.set(k, from);
      });
    },
  });
}

/** Single-element reveal. */
function buildReveal(el: HTMLElement) {
  const type = (el.getAttribute('data-anim') || 'fade-up') as AnimType;

  if (type === 'chars' || type === 'words' || type === 'lines') {
    buildSplitReveal(el, type);
    return;
  }

  const { from, to } = effectVars(el, type);
  gsap.set(el, from);
  ScrollTrigger.create({
    trigger: el,
    start: CONFIG.revealStart,
    onEnter: () => gsap.to(el, { ...to, overwrite: true }),
    onLeaveBack: () => gsap.set(el, from),
  });
}

/** Multi-speed parallax for `data-speed` elements. */
function buildParallax(el: HTMLElement) {
  const speed = num(el, 'data-speed', 1);
  if (speed === 1) return;
  const movement = (1 - speed) * 100 * CONFIG.parallax.intensity;
  gsap.fromTo(
    el,
    { yPercent: -movement / 2 },
    {
      yPercent: movement / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

/** Continuous float + rotation loop for decorative accents. */
function buildFloat(el: HTMLElement) {
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(el, {
    y: `+=${CONFIG.parallax.floatY}`,
    rotation: `+=${CONFIG.parallax.floatRotate}`,
    duration: 3 + Math.random() * 2,
    ease: 'sine.inOut',
  });
  // Pause the loop while off-screen to save frames.
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
  });
}

/** Global velocity-driven skew on `[data-velocity]` elements. */
function buildVelocitySkew() {
  if (!CONFIG.toggles.velocitySkew) return;
  const els = gsap.utils.toArray<HTMLElement>('[data-velocity]');
  if (!els.length) return;

  const setters = els.map((el) => gsap.quickSetter(el, 'skewY', 'deg'));
  const max = CONFIG.velocity.maxSkew;

  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-max, max, (self.getVelocity() / 1000) * -1);
      setters.forEach((set) => set(v));
    },
  });
  // Spring back to 0 when scrolling settles.
  let idle: number | undefined;
  ScrollTrigger.addEventListener('scrollEnd', () => {
    if (idle) cancelAnimationFrame(idle);
    els.forEach((el) => gsap.to(el, { skewY: 0, duration: 0.5, ease: 'power3.out' }));
  });
}

/** Per-section tint cross-fade behind content. */
function buildSectionTint() {
  if (!CONFIG.toggles.sectionTint) return;
  const sections = gsap.utils.toArray<HTMLElement>('[data-tint]');
  if (!sections.length) return;

  let layer = document.getElementById('section-tint') as HTMLElement | null;
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'section-tint';
    document.body.appendChild(layer);
  }

  sections.forEach((section) => {
    const hue = section.getAttribute('data-tint');
    if (!hue) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => {
        if (self.isActive) {
          gsap.to(layer!, { backgroundColor: hexToRgba(hue, 0.05), duration: 0.8, ease: 'sine.out' });
        }
      },
    });
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Scroll-scrubbed "zoom out": the element scales up and fades as it leaves the
 * viewport top — a cinematic depth transition (the Zoom technique). Used on the
 * hero so scrolling away pushes it back into the cosmos.
 */
function buildZoomOut(el: HTMLElement) {
  gsap.fromTo(
    el,
    { scale: 1, autoAlpha: 1 },
    {
      scale: 1.18,
      autoAlpha: 0.12,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
    }
  );
}

/**
 * Scan the document and wire every animated element. Call inside a gsap.context.
 * If reduced motion is on, make everything visible and do nothing else.
 */
export function initEngine() {
  if (CONFIG.reducedMotion) {
    showAllStatic();
    return;
  }

  if (CONFIG.toggles.reveals) {
    // Track elements claimed by stagger containers in a per-run Set (NOT a DOM
    // attribute — an attribute would persist across gsap.context revert/recreate,
    // e.g. React StrictMode remount, and silently skip every reveal on re-init).
    const claimed = new Set<HTMLElement>();

    gsap
      .utils.toArray<HTMLElement>('[data-stagger]')
      .forEach((c) => buildStaggerContainer(c, claimed));

    gsap
      .utils.toArray<HTMLElement>('[data-anim]')
      .filter((el) => !claimed.has(el))
      .forEach((el) => buildReveal(el));

    // Legacy `.reveal-on-scroll` elements (not yet migrated) → default fade-up,
    // so nothing the CSS hid is ever left permanently invisible.
    gsap
      .utils.toArray<HTMLElement>('.reveal-on-scroll')
      .filter((el) => !claimed.has(el) && !el.hasAttribute('data-anim'))
      .forEach((el) => {
        el.setAttribute('data-anim', 'fade-up');
        buildReveal(el);
      });
  }

  if (CONFIG.toggles.parallax) {
    gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => buildParallax(el));
  }

  if (CONFIG.toggles.floatAccents) {
    gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el) => buildFloat(el));
  }

  gsap.utils.toArray<HTMLElement>('[data-zoom-out]').forEach((el) => buildZoomOut(el));

  buildVelocitySkew();
  buildSectionTint();
}

/** Reduced-motion / fail-safe: clear any hidden states so all content shows. */
export function showAllStatic() {
  gsap.utils.toArray<HTMLElement>('[data-anim], .reveal-on-scroll').forEach((el) => {
    gsap.set(el, { clearProps: 'all' });
  });
  document.documentElement.classList.remove('anim-ready');
}

/** Revert SplitText instances (restores original markup) on teardown. */
export function revertSplits() {
  splits.forEach((s) => s.revert());
  splits.length = 0;
}
