import { SKILLS } from '../../../content';

export interface Vec2 { x: number; y: number; }
export interface CrystalState { x: number; y: number; rotate: number; scale: number; opacity: number; }

const TAU = Math.PI * 2;

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function seeded(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Settled ring positions as NORMALIZED offsets from stage center (~[-1,1]).
 *  Inner-ring skills sit on a small circle, outer-ring skills on a larger one;
 *  returned in SKILLS order (index i → that skill's settled slot). */
export function ringPositions(): Vec2[] {
  const innerN = SKILLS.filter((s) => s.ring === 'inner').length;
  const outerN = SKILLS.filter((s) => s.ring === 'outer').length;
  const R_IN = 0.34;
  const R_OUT = 0.72;
  let iIn = 0;
  let iOut = 0;
  return SKILLS.map((s) => {
    if (s.ring === 'inner') {
      const a = (iIn++ / innerN) * TAU - Math.PI / 2;
      return { x: Math.cos(a) * R_IN, y: Math.sin(a) * R_IN };
    }
    const a = (iOut++ / outerN) * TAU - Math.PI / 2;
    return { x: Math.cos(a) * R_OUT, y: Math.sin(a) * R_OUT };
  });
}

/** Tight clustered "meteor" positions near center (seeded jitter), SKILLS order. */
export const CLUSTER_POS: Vec2[] = SKILLS.map((_, i) => ({
  x: (seeded(i) - 0.5) * 0.12,
  y: (seeded(i + 99) - 0.5) * 0.12,
}));

/** Scroll progress (0..1) at which the meteor detonates. */
export const DETONATE_AT = 0.45;

const RINGS = ringPositions();

function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

/** Pure function of section scroll progress (0..1) and crystal index → its
 *  normalized transform. Clustered before DETONATE_AT, bursting to the ring
 *  after; deterministic and reversible. x/y are normalized offsets from stage
 *  center (multiply by half-stage width/height to get px). */
export function crystalStateAt(progress: number, i: number): CrystalState {
  const from = CLUSTER_POS[i];
  const to = RINGS[i];
  const raw = (progress - DETONATE_AT) / (1 - DETONATE_AT);
  const t = easeOut(Math.min(1, Math.max(0, raw)));
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    rotate: (seeded(i) - 0.5) * 220 * (1 - t),
    scale: 0.6 + 0.4 * t,
    opacity: 1,
  };
}
