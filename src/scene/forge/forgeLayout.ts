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
