import { describe, it, expect } from 'vitest';
import { recommend, waveformPath } from './recommender';

describe('recommend', () => {
  it('maps an uplifting vibe to a positive pick', () => {
    const r = recommend('something uplifting and warm');
    expect(r.mood).toBe('uplifting');
    expect(r.title).toBe('The Intouchables');
    expect(r.sentiment).toBeGreaterThan(0);
  });
  it('maps a tense vibe to a negative pick', () => {
    const r = recommend('a tense, gripping thriller');
    expect(r.mood).toBe('tense');
    expect(r.sentiment).toBeLessThan(0);
  });
  it('is case-insensitive', () => {
    expect(recommend('DARK and GRITTY').mood).toBe('dark');
  });
  it('first-listed mood wins when a vibe spans moods', () => {
    expect(recommend('uplifting but tense').mood).toBe('uplifting');
  });
  it('falls back to a default when nothing matches', () => {
    const r = recommend('zxcv qwer');
    expect(r.title).toBe('Everything Everywhere All at Once');
  });
});

describe('waveformPath', () => {
  it('is deterministic', () => {
    expect(waveformPath(0.5, 100, 40, 20)).toBe(waveformPath(0.5, 100, 40, 20));
  });
  it('starts with M and has samples-1 segments', () => {
    const p = waveformPath(0.5, 100, 40, 20);
    expect(p.startsWith('M ')).toBe(true);
    expect(p.split(' L ').length).toBe(20); // 1 M-point + 19 L-points
  });
  it('spreads more at the extremes than at neutral', () => {
    const range = (s: number) => {
      const ys = waveformPath(s, 100, 40, 40)
        .replace('M ', '')
        .split(' L ')
        .map((p) => parseFloat(p.split(',')[1]));
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(range(1)).toBeGreaterThan(range(0));
  });
});
