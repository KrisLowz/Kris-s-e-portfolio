import { describe, it, expect } from 'vitest';
import { ringPositions, CLUSTER_POS, crystalStateAt } from './forgeLayout';
import { SKILLS } from '../../../content';

const dist = (p: { x: number; y: number }) => Math.hypot(p.x, p.y);

describe('forgeLayout', () => {
  it('has a ring position per skill (17), split 8 inner / 9 outer', () => {
    expect(ringPositions()).toHaveLength(17);
    expect(SKILLS.filter((s) => s.ring === 'inner')).toHaveLength(8);
    expect(SKILLS.filter((s) => s.ring === 'outer')).toHaveLength(9);
  });

  it('settles inner-ring crystals closer to center than outer-ring ones', () => {
    const r = ringPositions();
    const innerMax = Math.max(...SKILLS.map((s, i) => (s.ring === 'inner' ? dist(r[i]) : 0)));
    const outerMin = Math.min(...SKILLS.map((s, i) => (s.ring === 'outer' ? dist(r[i]) : Infinity)));
    expect(innerMax).toBeLessThan(outerMin);
  });

  it('is clustered at progress 0 and settled at progress 1', () => {
    const r = ringPositions();
    for (let i = 0; i < SKILLS.length; i++) {
      expect(Math.abs(crystalStateAt(0, i).x - CLUSTER_POS[i].x)).toBeLessThan(1e-9);
      expect(Math.abs(crystalStateAt(1, i).x - r[i].x)).toBeLessThan(1e-9);
      expect(Math.abs(crystalStateAt(1, i).y - r[i].y)).toBeLessThan(1e-9);
    }
  });

  it('is deterministic and finite', () => {
    expect(crystalStateAt(0.7, 5)).toEqual(crystalStateAt(0.7, 5));
    for (let i = 0; i < SKILLS.length; i++) {
      const c = crystalStateAt(0.5, i);
      expect(Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.rotate) && Number.isFinite(c.scale)).toBe(true);
    }
  });
});
