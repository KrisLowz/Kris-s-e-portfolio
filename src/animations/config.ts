/**
 * Central animation config — the single place to tune the entire motion layer.
 *
 * Eases, durations, staggers and parallax intensities live here, plus a master
 * on/off `toggles` map so any system can be disabled without touching its code.
 *
 * `reducedMotion` is resolved once at module load. When true, the engine renders
 * everything in its final, visible state and skips animation entirely.
 */

const prefersReduced =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTouch =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const isMobile =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

export interface AnimConfig {
  reducedMotion: boolean;
  isTouch: boolean;
  isMobile: boolean;

  /** Master on/off switches per effect system. */
  toggles: {
    scene3d: boolean;
    preloader: boolean;
    smoothScroll: boolean;
    reveals: boolean;
    parallax: boolean;
    pins: boolean;
    velocitySkew: boolean;
    sectionTint: boolean;
    progressBar: boolean;
    scrollRipples: boolean;
    sectionGlow: boolean;
    cursor: boolean;
    magnetic: boolean;
    tilt: boolean;
    floatAccents: boolean;
    navAutoHide: boolean;
  };

  /** Named easing curves used across the layer. */
  ease: {
    smooth: string;
    out: string;
    inOut: string;
    pop: string;
    elastic: string;
    expo: string;
  };

  /** Base durations (seconds). Scaled down on mobile via `mobileScale`. */
  duration: {
    reveal: number;
    chars: number;
    clip: number;
    intro: number;
  };

  /** Stagger amounts (seconds). */
  stagger: {
    chars: number;
    words: number;
    lines: number;
    cards: number;
    list: number;
  };

  /** Parallax / depth intensities. */
  parallax: {
    /** Multiplier applied to all `data-speed` distances. */
    intensity: number;
    /** Float-accent amplitude (px) and rotation (deg). */
    floatY: number;
    floatRotate: number;
  };

  /** Velocity-reaction tuning. */
  velocity: {
    maxSkew: number;
  };

  /** Smooth-scroll (Lenis) tuning. */
  smooth: {
    lerp: number;
    wheelMultiplier: number;
    /** px offset applied when scrolling to anchors (clears the fixed nav). */
    anchorOffset: number;
  };

  /** Global reveal ScrollTrigger start position. */
  revealStart: string;

  /** On mobile, multiply durations/distances by this to keep motion snappy. */
  mobileScale: number;
}

export const CONFIG: AnimConfig = {
  reducedMotion: prefersReduced,
  isTouch,
  isMobile,

  toggles: {
    scene3d: true,
    preloader: true,
    smoothScroll: true,
    reveals: true,
    parallax: true,
    pins: true,
    velocitySkew: true,
    sectionTint: true,
    progressBar: true,
    scrollRipples: true,
    sectionGlow: true,
    cursor: true,
    magnetic: true,
    tilt: true,
    floatAccents: true,
    navAutoHide: true,
  },

  ease: {
    smooth: 'silk',
    out: 'power2.out',
    inOut: 'glide',
    pop: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.5)',
    expo: 'silk',
  },

  duration: {
    reveal: 0.9,
    chars: 0.8,
    clip: 1.1,
    intro: 1.2,
  },

  stagger: {
    chars: 0.025,
    words: 0.05,
    lines: 0.08,
    cards: 0.1,
    list: 0.06,
  },

  parallax: {
    intensity: 1,
    floatY: 14,
    floatRotate: 4,
  },

  velocity: {
    maxSkew: 2.5,
  },

  smooth: {
    lerp: 0.1,
    wheelMultiplier: 1,
    anchorOffset: 90,
  },

  revealStart: 'top 85%',

  mobileScale: 0.7,
};

/** Distance (px) a `fade-up`/reveal travels, scaled for the current device. */
export function revealDistance(): number {
  return CONFIG.isMobile ? 40 : 60;
}

/** Scale a duration for the current device. */
export function dur(seconds: number): number {
  return CONFIG.isMobile ? seconds * CONFIG.mobileScale : seconds;
}
