import { describe, it, expect } from 'vitest';
import { SKILLS, PROJECTS, STORY_ACTS, SECTION_ACTS, MISSION_RECORDS } from './index';
import { WORLD_ASSETS } from '../story/worldAssets';

describe('content invariants', () => {
  it('has exactly 17 skills split 8 inner / 9 outer', () => {
    expect(SKILLS).toHaveLength(17);
    expect(SKILLS.filter((s) => s.ring === 'inner')).toHaveLength(8);
    expect(SKILLS.filter((s) => s.ring === 'outer')).toHaveLength(9);
  });

  it('every skill.usedIn references a real project id', () => {
    const ids = new Set(PROJECTS.map((p) => p.id));
    for (const s of SKILLS) for (const u of s.usedIn) expect(ids).toContain(u);
  });

  it('every skill level is 1..5', () => {
    for (const s of SKILLS) expect(s.level).toBeGreaterThanOrEqual(1), expect(s.level).toBeLessThanOrEqual(5);
  });

  it('story has 8 acts; 6 map to sections', () => {
    expect(STORY_ACTS).toHaveLength(8);
    expect(SECTION_ACTS).toHaveLength(6);
  });

  it('mission records include origin and open-to-work bookends', () => {
    expect(MISSION_RECORDS[0].id).toBe('origin-2022');
    expect(MISSION_RECORDS[MISSION_RECORDS.length - 1].id).toBe('open-to-work');
  });

  it('all world assets point under /assets/world/', () => {
    for (const v of Object.values(WORLD_ASSETS)) expect(v.startsWith('/assets/world/')).toBe(true);
  });
});
