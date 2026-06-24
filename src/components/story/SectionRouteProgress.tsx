import { SECTION_ACTS } from '../../content';

/** Fixed vertical nav: one node per on-page act; click scrolls to the section. */
export default function SectionRouteProgress() {
  return (
    <nav aria-label="Voyage sections" className="fixed right-5 top-1/2 z-40 -translate-y-1/2">
      <ul className="flex flex-col gap-4">
        {SECTION_ACTS.map((act) => (
          <li key={act.id}>
            <a
              href={`#${act.sectionId}`}
              className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-pop-text-muted hover:text-pop-text-main"
            >
              <span
                className="inline-block h-2 w-2 rounded-full border border-current"
                style={{ boxShadow: `0 0 8px ${act.tint}` }}
              />
              <span className="opacity-0 transition-opacity group-hover:opacity-100">{act.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
