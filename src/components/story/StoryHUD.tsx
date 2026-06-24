import { PROFILE } from '../../content';

export default function StoryHUD() {
  return (
    <div className="fixed left-5 top-5 z-40 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
      <a href="#contact" className="text-pop-text-muted hover:text-pop-primary">Skip ▾ Contact</a>
      <a
        href={PROFILE.cv}
        className="rounded border border-pop-border px-2 py-1 text-pop-text-main hover:border-pop-primary"
      >
        Download CV
      </a>
    </div>
  );
}
