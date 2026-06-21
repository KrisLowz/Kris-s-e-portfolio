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
  [0, 0.2, 6.5], // Hero — close, core as centerpiece behind the text
  [2.0, 0.4, 7.5], // About — pulled back so the core is a backdrop, not a wall
  [2.6, -0.2, 8.0], // Skills — orbit to the side
  [0.3, 1.2, 8.5], // Experience — furthest back, card sits over softer glow
  [-2.4, 0.2, 7.5], // Projects — approach the monoliths
  [0, 0.4, 9.5], // Contact — pull back, arrival
];

export const CAMERA = {
  /** Exponential damping for scroll → probe position along the path. */
  positionDamping: 3.5,
  /** Cursor-parallax sway amplitude (world units). */
  parallaxAmount: 0.5,
  /** Damping for the parallax sway. */
  parallaxDamping: 2.5,
  /** 3rd-person follow-cam: distance behind the probe (along -tangent). */
  followBack: 4.2,
  /** ...and height above it. */
  followUp: 2.2,
  /** Cinematic camera smoothing (lower = floatier trail). */
  followDamping: 2.4,
  /** How far ahead of the probe the camera looks. */
  lookAhead: 3.0,
  /** Raise the look-target above the probe so the craft frames in the lower
   *  third (cinematic negative space, clear of headline copy). */
  lookUp: 0.7,
} as const;

export const CURVE = {
  /** CatmullRom tension (0.5 ≈ centripetal smoothness, avoids overshoot). */
  tension: 0.5,
} as const;

/**
 * Cinematic pacing. Linear scroll progress (0→1) is remapped through these
 * anchors so the probe DECELERATES into each world (an "arrival") and
 * ACCELERATES between them (a "warp"). One anchor per section; uniform spacing
 * maps each section's scroll band to its slice of the camera path.
 */
export const PACING = {
  anchors: [0, 0.2, 0.4, 0.6, 0.8, 1] as const,
  /** Probe speed (curve-units/s) that reads as "cruising" — warp starts here. */
  warpLo: 0.08,
  /** ...and saturates (full warp streaks) here. */
  warpHi: 0.35,
} as const;

/** Quintic smootherstep — flat (zero-velocity) at both ends → arrival holds. */
const smoother = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/**
 * Remap linear scroll progress `s` (0..1) to the eased curve parameter `t`.
 * Within each segment the easing is flat at both anchors, so the probe lingers
 * at every world (arrival dwell) and races through the gap between them.
 */
export function pace(s: number): number {
  const a = PACING.anchors;
  const n = a.length - 1;
  const x = Math.min(Math.max(s, 0), 1) * n; // 0..n
  const i = Math.min(Math.floor(x), n - 1);
  const u = x - i;
  return a[i] + (a[i + 1] - a[i]) * smoother(u);
}

/**
 * Visual tunables for the cosmic world. Counts are kept deliberately modest so
 * the scene runs on integrated GPUs without losing the WebGL context. The
 * canvas renders at a fixed DPR of 1 (no MSAA, no dynamic resolution) for
 * stability; the whole scene is gated off on mobile/low-power in favour of the
 * DOM gradient fallback.
 */
export const SCENE = {
  // intensity is LDR-friendly now (glow is baked, not bloom-dependent); the halo
  // is the soft aura around the core. Sizes are WORLD units (billboard quads).
  core: {
    radius: 1.7,
    intensity: 1.5,
    displace: 0.16,
    haloScale: 5.5,
    haloFalloff: 2.2,
    haloStrength: 0.95,
  },
  particles: { count: 5000, innerRadius: 5, shell: 28, size: 0.1 },
  rings: [
    { count: 700, radius: 3.0, thickness: 0.14, tilt: 0.5 },
    { count: 550, radius: 4.2, thickness: 0.12, tilt: -0.35 },
    { count: 450, radius: 5.4, thickness: 0.1, tilt: 0.9 },
  ],
  ringSize: 0.06,
  meteors: { count: 3 },
  // Bloom is an OPTIONAL enhancement, only mounted when the GPU can render to a
  // float buffer; the scene must look correct without it.
  bloom: { intensity: 1.1, threshold: 0.8, smoothing: 0.2 },
} as const;
