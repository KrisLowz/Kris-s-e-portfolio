import { SKILLS, PROJECTS } from '../../constants';

/** Project titles a skill was used in (in PROJECTS order), or [] if none/unknown. */
export function skillUsedInTitles(skillId: string): string[] {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return [];
  return PROJECTS.filter((p) => skill.usedIn.includes(p.id)).map((p) => p.title);
}
