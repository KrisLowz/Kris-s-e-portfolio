import { describe, it, expect } from 'vitest';
import { SKILLS } from '../../constants';
import { buildShardSeeds } from './forgeLayout';

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
