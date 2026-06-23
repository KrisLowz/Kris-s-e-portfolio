import { SKILLS } from '../constants';
import { skillUsedInTitles } from '../scene/forge/skillData';

/** Diegetic holo readout for a focused skill — data as fragments, not a plain card. */
export default function ForgeHoloPanel({ skillId, onClose }: { skillId: string; onClose: () => void }) {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return null;
  const projects = skillUsedInTitles(skill.id);
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 pointer-events-auto bg-transparent cursor-default"
      />
      <div className="relative pointer-events-none text-center font-mono">
        <div className="text-2xl font-bold tracking-wide" style={{ color: 'var(--accent-primary)' }}>{skill.name}</div>
        <div className="text-[11px] text-[#bfe9ff] mt-1">{skill.category}</div>
        <p className="text-sm text-[#9fb6d6] max-w-xs mx-auto mt-3">{skill.blurb}</p>
        {projects.length > 0 && (
          <div className="mt-3 text-[12px] text-[#ffb86b]">deployed in · {projects.join(' · ')}</div>
        )}
        <div className="mt-3 flex gap-1 justify-center" aria-label={`signal strength ${skill.level} of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className="h-1.5 w-7 rounded-sm"
              style={{ background: n <= skill.level ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,.12)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
