import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../constants';

declare global { interface Window { gsap: any; ScrollTrigger: any } }

const THEME: Record<string, number> = { trackpoint: 0xf59e0b, cinemate: 0x8b5cf6, splashaquatics: 0x06b6d4 };
const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

const Projects: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [failed, setFailed] = useState(false);
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // scroll pin (mirror Experience.tsx): scrub writes progress for the 3D scene
  useEffect(() => {
    if (reduced) return;
    const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current, start: 'top top',
        end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 2.4 : 3.2),
        scrub: 1, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self: any) => { progressRef.current = self.progress; },
      });
    }, trackRef);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced || failed) {
    return (
      <section id="projects" aria-labelledby="proj-heading" className="relative w-full bg-[#05030f] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
          <h2 id="proj-heading" className="mt-4 font-display text-4xl font-extrabold text-[#F5F3FF] sm:text-6xl">Worlds I&apos;ve built</h2>
          <div className="mt-12 space-y-16">
            {PROJECTS.map((p) => (
              <article key={p.id} className="rounded-3xl border border-white/10 bg-[#0a0814]/80 p-6 sm:p-8">
                <h3 className="font-display text-2xl font-extrabold text-[#F5F3FF]">{p.title}</h3>
                <p className="text-[#22D3EE]">{p.subtitle}</p>
                <p className="mt-3 text-[#A8A3C2]">{p.overview}</p>
                {p.achievements?.length ? (
                  <ul className="mt-4 space-y-1 text-sm text-[#dcd9ee]">{p.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                ) : null}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF2BD6]">Challenges</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#A8A3C2]">{p.challenges?.map((c) => <li key={c}>{c}</li>)}</ul></div>
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]">Solutions</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#A8A3C2]">{p.solutions?.map((s) => <li key={s}>{s}</li>)}</ul></div>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">{p.tags.map((t) => <li key={t} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]">{t}</li>)}</ul>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {p.screenshots.slice(0, 8).map((s) => <img key={s} src={s} alt="" loading="lazy" className="aspect-[9/16] w-full rounded-lg object-cover" />)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} id="projects" aria-labelledby="proj-heading" className="relative bg-[#05030f]">
      <div ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-[#05030f]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,#0a0a24_0%,#06051a_50%,#03020c_100%)]" />
        <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-16 sm:px-10 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
          <h2 id="proj-heading" className="mt-3 font-display text-4xl font-extrabold leading-tight text-[#F5F3FF] sm:text-6xl">Worlds I&apos;ve built</h2>
        </div>
        <ul className="sr-only">{PROJECTS.map((p) => <li key={p.id}><strong>{p.title}</strong>: {p.overview}</li>)}</ul>
      </div>
    </section>
  );
};

export default Projects;
