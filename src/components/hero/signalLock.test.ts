import { describe, it, expect } from 'vitest';
import { signalLock } from './signalLock';

const NAME = 'Low Chee Fei';

describe('signalLock', () => {
  it('returns the exact target at progress 1', () => {
    expect(signalLock(NAME, 1, 5)).toBe(NAME);
  });
  it('is fully scrambled at progress 0 (same length, spaces preserved, not target)', () => {
    const s = signalLock(NAME, 0, 1);
    expect(s).not.toBe(NAME);
    expect(s.length).toBe(NAME.length);
    for (let i = 0; i < NAME.length; i++) {
      if (NAME[i] === ' ') expect(s[i]).toBe(' ');
      else expect(s[i]).not.toBe(' ');
    }
  });
  it('locks left-to-right', () => {
    const s = signalLock('ABCDE', 0.5, 0);
    expect(s.startsWith('AB')).toBe(true);
    expect(s).not.toBe('ABCDE');
  });
  it('is deterministic for identical args', () => {
    expect(signalLock(NAME, 0.4, 3)).toBe(signalLock(NAME, 0.4, 3));
  });
});
