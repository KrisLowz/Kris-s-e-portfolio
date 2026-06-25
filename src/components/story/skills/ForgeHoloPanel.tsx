import { useEffect, useRef } from 'react';
import { Skill } from '../../../types';
import { PROJECTS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

/** Maps a skill's usedIn project ids → display chips (title + award flag). */
function usedInChips(skill: Skill) {
  return skill.usedIn.map((id) => {
    const p = PROJECTS.find((x) => x.id === id);
    return { id, title: p ? p.title : id, award: !!p && !!p.achievements[0]?.startsWith('🏆') };
  });
}

/** Focused inspect overlay for one skill crystal: a centered holo dialog over a
 *  dimmed field. Escape / click-away / Close button dismiss; focus restores to
 *  the opener. */
export default function ForgeHoloPanel({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); opener?.focus(); };
  }, [onClose]);

  const chips = usedInChips(skill);
  return (
    <div role="dialog" aria-modal="true" aria-label={`${skill.name} details`}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-pop-primary/40 bg-pop-surface/95 p-8 text-center"
        onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 rounded border border-pop-border px-2 py-1 font-mono text-xs">✕</button>
        <div className="relative grid place-items-center">
          <img src={WORLD_ASSETS.skillCrystal} alt="" aria-hidden className="w-28" />
          <i className={`${skill.iconClass} absolute text-4xl`} aria-hidden />
        </div>
        <h3 className="font-display text-2xl text-pop-text-main">{skill.name}</h3>
        <p className="font-mono text-xs uppercase tracking-widest text-pop-primary">{skill.category}</p>
        <p className="text-pop-text-muted">{skill.blurb}</p>
        <div className="flex items-center gap-1" aria-label={`Level ${skill.level} of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`h-2 w-6 rounded-full ${n <= skill.level ? 'bg-pop-primary' : 'bg-pop-border'}`} />
          ))}
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <span key={c.id} className="rounded-full border border-pop-border px-3 py-1 font-mono text-[11px] text-pop-text-muted">
                {c.award ? '🏆 ' : ''}{c.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
