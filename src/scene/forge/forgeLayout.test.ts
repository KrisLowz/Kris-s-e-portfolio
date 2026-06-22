import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { SKILLS } from '../../constants';
import { buildShardSeeds, computeForge, DETONATE } from './forgeLayout';

describe('buildShardSeeds', () => {
  it('produces one seed per skill, in order', () => {
    const seeds = buildShardSeeds();
    expect(seeds).toHaveLength(SKILLS.length);
    expect(seeds.map((s) => s.id)).toEqual(SKILLS.map((s) => s.id));
  });

  it('gives every shard a unit outward direction', () => {
    for (const s of buildShardSeeds()) {
      expect(s.dir.length()).toBeCloseTo(1, 5);
    }
  });

  it('is deterministic across calls', () => {
    const a = buildShardSeeds();
    const b = buildShardSeeds();
    expect(a[3].dir.toArray()).toEqual(b[3].dir.toArray());
    expect(a[3].dist).toEqual(b[3].dist);
  });
});

const BEACON = new THREE.Vector3(-2, 1.6, -2);

describe('computeForge', () => {
  const seeds = buildShardSeeds();

  it('before detonation: planet solid, shards hidden', () => {
    const s = computeForge(0.05, seeds, 0, BEACON);
    expect(s.planetOpacity).toBeCloseTo(1, 3);
    expect(s.shards).toHaveLength(seeds.length);
    expect(Math.max(...s.shards.map((x) => x.scale))).toBeCloseTo(0, 3);
    expect(Math.max(...s.shards.map((x) => x.opacity))).toBeCloseTo(0, 3);
  });

  it('mid-flight: planet gone, shards visible and pushed out', () => {
    const s = computeForge(0.65, seeds, 0, BEACON);
    expect(s.planetOpacity).toBeLessThan(0.05);
    expect(Math.min(...s.shards.map((x) => x.scale))).toBeGreaterThan(0.2);
    expect(s.shards[0].pos.length()).toBeGreaterThan(0.5);
  });

  it('at the end: shards fade out (carried to the beacon)', () => {
    const s = computeForge(1, seeds, 0, BEACON);
    expect(Math.max(...s.shards.map((x) => x.opacity))).toBeLessThan(0.05);
  });

  it('is reversible — same progress yields same state', () => {
    const a = computeForge(0.55, seeds, 2, BEACON);
    const b = computeForge(0.55, seeds, 2, BEACON);
    expect(a.shards[5].pos.toArray()).toEqual(b.shards[5].pos.toArray());
  });

  it('DETONATE threshold is 0.4', () => {
    expect(DETONATE).toBe(0.4);
  });
});
