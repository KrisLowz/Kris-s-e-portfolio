import { describe, it, expect } from 'vitest';
import { SHIP_PATH } from './shipPath';
import { STORY_ACTS } from '../content/story';

describe('SHIP_PATH', () => {
  it('has a waypoint for every non-boot story act, in story order', () => {
    const expected = STORY_ACTS.map((a) => a.id).filter((id) => id !== 'boot');
    expect(SHIP_PATH.map((w) => w.act)).toEqual(expected);
  });

  it('uses finite positions and rotations', () => {
    for (const w of SHIP_PATH) {
      expect(Number.isFinite(w.x)).toBe(true);
      expect(Number.isFinite(w.y)).toBe(true);
      expect(Number.isFinite(w.rotate)).toBe(true);
    }
  });

  it('has positive scale and thruster within 0..1', () => {
    for (const w of SHIP_PATH) {
      expect(w.scale).toBeGreaterThan(0);
      expect(w.thruster).toBeGreaterThanOrEqual(0);
      expect(w.thruster).toBeLessThanOrEqual(1);
    }
  });
});
