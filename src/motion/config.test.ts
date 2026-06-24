import { describe, it, expect } from 'vitest';
import { CONFIG, dur, revealDistance } from './config';

describe('motion config', () => {
  it('exposes resolved capability flags', () => {
    expect(typeof CONFIG.reducedMotion).toBe('boolean');
    expect(typeof CONFIG.isMobile).toBe('boolean');
    expect(typeof CONFIG.isTouch).toBe('boolean');
  });
  it('dur() returns a positive number', () => {
    expect(dur(1)).toBeGreaterThan(0);
  });
  it('revealDistance() returns a positive number', () => {
    expect(revealDistance()).toBeGreaterThan(0);
  });
});
