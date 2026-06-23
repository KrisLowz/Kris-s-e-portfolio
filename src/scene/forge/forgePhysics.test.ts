import { describe, it, expect } from 'vitest';
import Matter from 'matter-js';
import { createForgeWorld, stepForge, PHYS_SCALE } from './forgePhysics';

const bounds = { halfW: 6, halfH: 3.7 };
const positions = Array.from({ length: 17 }, (_, i) => ({ x: (i % 5) - 2, y: (i % 3) - 1 }));

describe('createForgeWorld', () => {
  it('creates one dynamic body per position, zero gravity', () => {
    const w = createForgeWorld(positions, bounds, 0.42);
    expect(w.bodies).toHaveLength(17);
    expect(w.engine.gravity.x).toBe(0);
    expect(w.engine.gravity.y).toBe(0);
  });

  it('places bodies at scaled positions', () => {
    const w = createForgeWorld(positions, bounds, 0.42);
    expect(w.bodies[0].position.x).toBeCloseTo(positions[0].x * PHYS_SCALE, 3);
    expect(w.bodies[0].position.y).toBeCloseTo(positions[0].y * PHYS_SCALE, 3);
  });

  it('keeps bodies inside the walls after stepping with outward velocity', () => {
    const w = createForgeWorld(positions, bounds, 0.42);
    // fling them all hard outward using Matter.Body.setVelocity so the velocity
    // is properly registered (direct b.velocity mutation is a no-op in matter-js)
    w.bodies.forEach((b, i) => {
      Matter.Body.setVelocity(b, { x: (i % 2 ? 1 : -1) * 50, y: (i % 2 ? -1 : 1) * 50 });
    });
    for (let s = 0; s < 120; s++) stepForge(w, 16);
    const limX = bounds.halfW * PHYS_SCALE + 1;
    const limY = bounds.halfH * PHYS_SCALE + 1;
    for (const b of w.bodies) {
      expect(Math.abs(b.position.x)).toBeLessThanOrEqual(limX);
      expect(Math.abs(b.position.y)).toBeLessThanOrEqual(limY);
    }
  });
});
