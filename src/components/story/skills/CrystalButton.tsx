import { CSSProperties } from 'react';
import { Skill } from '../../../types';
import { WORLD_ASSETS } from '../../../story/worldAssets';

/** One skill crystal as a real button (crystal cutout + Devicon + name).
 *  Positioning is the parent's job (className/style). */
export default function CrystalButton({ skill, onActivate, className, style }: {
  skill: Skill;
  onActivate: (skill: Skill) => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button type="button" onClick={() => onActivate(skill)} style={style}
      className={`group relative grid place-items-center ${className ?? ''}`}>
      <img src={WORLD_ASSETS.skillCrystal} alt="" aria-hidden className="w-20 transition group-hover:scale-110" />
      <i className={`${skill.iconClass} absolute text-2xl`} aria-hidden />
      <span className="sr-only">{skill.name}</span>
      <span aria-hidden className="mt-1 font-mono text-[10px] text-pop-text-muted">{skill.name}</span>
    </button>
  );
}
