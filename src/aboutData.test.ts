import { describe, it, expect } from 'vitest';
import { ABOUT } from './constants';

describe('ABOUT data', () => {
  it('has a non-empty packet with label+value on every field', () => {
    expect(ABOUT.packet.length).toBeGreaterThan(0);
    for (const f of ABOUT.packet) {
      expect(f.label.trim().length, JSON.stringify(f)).toBeGreaterThan(0);
      expect(f.value.trim().length, JSON.stringify(f)).toBeGreaterThan(0);
    }
  });

  it('has a non-empty human statement', () => {
    expect(ABOUT.statement.trim().length).toBeGreaterThan(0);
  });

  it('has a non-empty trait list', () => {
    expect(ABOUT.traits.length).toBeGreaterThan(0);
    for (const t of ABOUT.traits) expect(t.trim().length, t).toBeGreaterThan(0);
  });
});
