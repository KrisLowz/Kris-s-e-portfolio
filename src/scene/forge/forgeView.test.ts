import { describe, it, expect } from 'vitest';
import { viewBounds, screenToWorld } from './forgeView';

describe('viewBounds', () => {
  it('computes half-height from camera distance and fov', () => {
    // camZ=8, fov=50 → halfH = 8 * tan(25°) ≈ 3.730
    const b = viewBounds(8, 50, 2);
    expect(b.halfH).toBeCloseTo(3.7304, 3);
    expect(b.halfW).toBeCloseTo(b.halfH * 2, 6); // aspect 2
  });
});

describe('screenToWorld', () => {
  const b = { halfW: 6, halfH: 3 };
  it('maps the canvas center to the origin', () => {
    const p = screenToWorld(500, 250, 1000, 500, b);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });
  it('maps the top-right corner to (+halfW, +halfH)', () => {
    const p = screenToWorld(1000, 0, 1000, 500, b);
    expect(p.x).toBeCloseTo(6, 6);
    expect(p.y).toBeCloseTo(3, 6); // screen y is inverted (top = +y)
  });
  it('maps the bottom-left corner to (-halfW, -halfH)', () => {
    const p = screenToWorld(0, 500, 1000, 500, b);
    expect(p.x).toBeCloseTo(-6, 6);
    expect(p.y).toBeCloseTo(-3, 6);
  });
});
