import { describe, it, expect } from 'vitest';
import { CONFIG, dur, revealDistance, cinematicOn } from './config';

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
  it('cinematicOn equals the reduced/mobile/toggle gate', () => {
    expect(cinematicOn('shipFlight')).toBe(
      !CONFIG.reducedMotion && !CONFIG.isMobile && CONFIG.toggles.shipFlight
    );
    expect(typeof cinematicOn('warp')).toBe('boolean');
    expect(typeof cinematicOn('sectionFx')).toBe('boolean');
  });
});
