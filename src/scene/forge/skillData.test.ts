import { describe, it, expect } from 'vitest';
import { SKILLS, PROJECTS } from '../../constants';
import { skillUsedInTitles } from './skillData';

describe('SKILLS data integrity', () => {
  const projectIds = new Set(PROJECTS.map((p) => p.id));

  it('still has 17 skills', () => {
    expect(SKILLS).toHaveLength(17);
  });

  it('every skill has a non-empty category and blurb', () => {
    for (const s of SKILLS) {
      expect(s.category.trim().length, s.id).toBeGreaterThan(0);
      expect(s.blurb.trim().length, s.id).toBeGreaterThan(0);
    }
  });

  it('every usedIn id is a real project', () => {
    for (const s of SKILLS) {
      expect(Array.isArray(s.usedIn), s.id).toBe(true);
      for (const pid of s.usedIn) expect(projectIds.has(pid), `${s.id}->${pid}`).toBe(true);
    }
  });

  it('every level is an integer 1..5', () => {
    for (const s of SKILLS) {
      expect(Number.isInteger(s.level), s.id).toBe(true);
      expect(s.level, s.id).toBeGreaterThanOrEqual(1);
      expect(s.level, s.id).toBeLessThanOrEqual(5);
    }
  });
});

describe('skillUsedInTitles', () => {
  it('maps a skill to its project titles', () => {
    expect(skillUsedInTitles('skill-kotlin')).toEqual(['TrackPoint']);
  });
  it('returns [] for an unused skill', () => {
    expect(skillUsedInTitles('skill-vscode')).toEqual([]);
  });
  it('returns [] for an unknown id', () => {
    expect(skillUsedInTitles('nope')).toEqual([]);
  });
});
