import { useEffect, useRef } from 'react';
import { Project } from '../../../types';

export default function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); opener?.focus(); };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`${project.title} details`}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-pop-border bg-pop-surface p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-pop-text-main">{project.title}</h3>
            <p className="font-mono text-xs text-pop-text-muted">{project.subtitle}</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="rounded border border-pop-border px-2 py-1 font-mono text-xs">Close ✕</button>
        </div>
        <p className="mt-4 text-pop-text-muted">{project.overview}</p>
        <ul className="mt-4 list-disc pl-5 text-sm text-pop-text-muted">
          {project.achievements.map((a) => <li key={a}>{a}</li>)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((t) => <span key={t} className="rounded border border-pop-border px-2 py-0.5 font-mono text-[10px]">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
