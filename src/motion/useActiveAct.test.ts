import { describe, it, expect } from 'vitest';
import { nearestAct } from './useActiveAct';

describe('nearestAct', () => {
  it('returns the act whose center is nearest the midpoint', () => {
    const centers = [
      { id: 'hero' as const, center: 100 },
      { id: 'about' as const, center: 500 },
      { id: 'skills' as const, center: 900 },
    ];
    expect(nearestAct(centers, 120)).toBe('hero');
    expect(nearestAct(centers, 480)).toBe('about');
    expect(nearestAct(centers, 1000)).toBe('skills');
  });
  it('handles a single act', () => {
    expect(nearestAct([{ id: 'contact' as const, center: 42 }], 9999)).toBe('contact');
  });
  it('on a tie returns the first nearest', () => {
    const centers = [{ id: 'hero' as const, center: 0 }, { id: 'about' as const, center: 200 }];
    expect(nearestAct(centers, 100)).toBe('hero');
  });
});
