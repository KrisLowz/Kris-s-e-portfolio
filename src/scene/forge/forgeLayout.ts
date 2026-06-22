import * as THREE from 'three';
import { SKILLS } from '../../constants';

export interface ShardSeed {
  /** Matches the SKILLS id (1:1 with the DOM skill chips). */
  id: string;
  /** Unit outward direction the shard flies when the planet detonates. */
  dir: THREE.Vector3;
  /** Per-axis tumble rates. */
  spin: THREE.Vector3;
  /** How far out the shard drifts (scene units). */
  dist: number;
  /** Phase offset so shards don't bob in unison. */
  phase: number;
}

/** Deterministic 0..1 hash from a shard index + a salt. */
const hash = (i: number, salt: number): number => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * One seed per skill. Directions use the same fibonacci-sphere distribution as
 * buildSkillNodes() so the burst reads as an even shell, and every per-shard
 * value is a pure function of the index (stable across reloads, no Math.random).
 */
export function buildShardSeeds(): ShardSeed[] {
  const n = SKILLS.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return SKILLS.map((skill, i) => {
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0; // 1 → -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const dir = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();
    return {
      id: skill.id,
      dir,
      // per-axis tumble rate, each in [-1, 1] (so the vector magnitude is ≤ √3)
      spin: new THREE.Vector3(
        (hash(i, 1) - 0.5) * 2,
        (hash(i, 2) - 0.5) * 2,
        (hash(i, 3) - 0.5) * 2
      ),
      dist: 1.8 + hash(i, 4) * 1.4, // 1.8 .. 3.2
      phase: hash(i, 5) * Math.PI * 2,
    };
  });
}

/** Scroll progress at which the planet detonates. */
export const DETONATE = 0.4;

/** How far above the beacon the carried shards aim, in local units. */
const BEACON_LIFT = 0.4;

/** Smoothstep ramp from a→b, clamped. */
const ramp = (a: number, b: number, x: number): number => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ShardTransform {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: number;
  opacity: number;
}

export interface ForgeState {
  /** 1 = solid planet, 0 = fully dissolved. */
  planetOpacity: number;
  /** 0→1 "charging" glow before detonation. */
  planetCharge: number;
  planetScale: number;
  shards: ShardTransform[];
}

/**
 * Pure smash choreography as a function of scroll progress (so it is perfectly
 * reversible — scrolling back recomputes the assembled state). `time` only
 * drives idle drift/tumble; the macro motion is progress-driven. All positions
 * are relative to the forge group origin.
 */
export function computeForge(
  progress: number,
  seeds: ShardSeed[],
  time: number,
  beacon: THREE.Vector3
): ForgeState {
  const charge = ramp(0.12, DETONATE, progress); // cracks/energy build
  const dissolve = ramp(DETONATE, 0.5, progress); // planet fades
  const fly = ramp(DETONATE, 0.7, progress); // shards travel out
  const carry = ramp(0.85, 1.0, progress); // streak to the beacon

  const planetOpacity = 1 - dissolve;
  const planetScale = 1 + charge * 0.05 - dissolve * 0.25;

  const target = beacon.clone().add(new THREE.Vector3(0, BEACON_LIFT, 0));
  const shards = seeds.map((s) => {
    const drift = Math.sin(time * 0.6 + s.phase) * 0.18 * (1 - carry);
    const radius = s.dist * fly + drift;
    const base = s.dir.clone().multiplyScalar(radius);
    const pos = base.lerp(target, carry);
    const spinAngle = time * 0.5 + fly * 6;
    const rot = new THREE.Euler(s.spin.x * spinAngle, s.spin.y * spinAngle, s.spin.z * spinAngle);
    const scale = fly * (1 - carry * 0.6);
    const opacity = Math.min(fly * 1.4, 1) * (1 - carry);
    return { pos, rot, scale, opacity };
  });

  return { planetOpacity, planetCharge: charge, planetScale, shards };
}
