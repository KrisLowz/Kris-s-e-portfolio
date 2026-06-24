import { useState } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { PROJECTS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import { Project } from '../../../types';
import ProjectModal from './ProjectModal';

export default function ProjectWorldRoute() {
  const [active, setActive] = useState<Project | null>(null);
  return (
    <section id="projects" className="relative px-6 py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedSectionHeading eyebrow="04 · Project Worlds" title="Visited worlds" meta="Open a portal" />
        <div data-stagger="0.1" className="mt-10 grid gap-8 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <button data-anim="pop" key={p.id} onClick={() => setActive(p)}
              className="group relative overflow-hidden rounded-xl border border-pop-border bg-pop-surface text-left">
              <span className="relative block aspect-video overflow-hidden">
                <img src={p.image} alt="" aria-hidden className="h-full w-full object-cover opacity-80 transition group-hover:scale-105" />
                <img src={WORLD_ASSETS.projectPortal} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-70" />
              </span>
              <span className="block p-4">
                <span className="block font-display text-lg text-pop-text-main">{p.title}</span>
                <span className="block font-mono text-xs text-pop-text-muted">{p.subtitle}</span>
                <span className="mt-2 block font-mono text-[10px] text-pop-amber">{p.achievements[0]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </section>
  );
}
