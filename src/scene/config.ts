/**
 * Scene-only tunables — the single place to tweak the 3D world's camera path,
 * damping, and (later phases) particle counts and bloom. Kept free of three.js
 * imports so it's a pure data module.
 */

/**
 * Camera flight waypoints — one per section, in world units around the core at
 * the origin. Global scroll progress (0→1) maps to a position along the
 * CatmullRom curve through these points. Tuned further as the real scene
 * (core, rings, monoliths) lands in later phases.
 */
export const CAMERA_WAYPOINTS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0.2, 6.5], // Hero — establishing shot, core haloing behind the text
  [2.2, 0.5, 5.5], // About — drift in and around
  [3.0, 0.0, 4.0], // Skills — settle among the orbiting ring
  [0.4, 1.4, 3.0], // Experience — fly along the path
  [-2.4, 0.2, 4.2], // Projects — approach the monoliths
  [0, 0.4, 8], // Contact — pull back, arrival
];

export const CAMERA = {
  /** Exponential damping for scroll → camera position (higher = snappier). */
  positionDamping: 3.5,
  /** Cursor-parallax sway amplitude (world units). */
  parallaxAmount: 0.5,
  /** Damping for the parallax sway. */
  parallaxDamping: 2.5,
  /** Point the camera looks at (the core, at origin). */
  lookAt: [0, 0, 0] as [number, number, number],
} as const;

export const CURVE = {
  /** CatmullRom tension (0.5 ≈ centripetal smoothness, avoids overshoot). */
  tension: 0.5,
} as const;

/**
 * Visual tunables for the cosmic world. Counts are desktop targets; the
 * PerformanceMonitor (Phase 7) scales DPR/bloom under load, and the whole scene
 * is gated off on mobile/low-power in favour of the DOM fallback.
 */
export const SCENE = {
  core: { radius: 1.7, intensity: 3.2, displace: 0.16 },
  particles: { count: 20000, innerRadius: 5, shell: 28, size: 0.6 },
  rings: [
    { count: 1500, radius: 3.0, thickness: 0.14, tilt: 0.5 },
    { count: 1200, radius: 4.2, thickness: 0.12, tilt: -0.35 },
    { count: 1000, radius: 5.4, thickness: 0.1, tilt: 0.9 },
  ],
  ringSize: 0.06,
  meteors: { count: 6 },
  bloom: { intensity: 1.3, threshold: 0.8, smoothing: 0.2 },
} as const;
