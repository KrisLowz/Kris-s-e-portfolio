import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/register';
import { cinematicOn } from '../../../motion/config';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { MISSION_RECORDS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function MissionArchive() {
  const sectionRef = useRef<HTMLElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cinematicOn('sectionFx')) return;
    const el = pulseRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    const ctx = gsap.context(() => {
      const tl = gsap.to(el, {
        scale: 1.6,
        autoAlpha: 0.5,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
      });
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="relative overflow-hidden px-6 py-28 md:px-16">
      <img src={WORLD_ASSETS.satelliteRelay} alt="" aria-hidden data-speed="0.9"
        className="pointer-events-none absolute -left-16 top-24 w-72 opacity-20" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <AnimatedSectionHeading eyebrow="03 · Mission Archive" title="Flight log" meta="Decrypted records" />
        <div className="relative mt-10 pl-6">
          <span data-anim="draw-y" className="absolute left-0 top-0 h-full w-px bg-pop-border" />
          <ol data-stagger="0.1" className="flex flex-col gap-8">
            {MISSION_RECORDS.map((r) => {
              const open = r.id === 'open-to-work';
              return (
                <li data-anim="clip-left" key={r.id} className="relative">
                  <span
                    ref={open ? pulseRef : undefined}
                    className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border"
                    style={{ borderColor: open ? 'var(--accent-amber)' : 'var(--accent-teal)', boxShadow: open ? '0 0 10px var(--accent-amber)' : 'none' }}
                  />
                  <p className="font-mono text-xs text-pop-text-muted">{r.period}</p>
                  <h3 className="font-display text-lg text-pop-text-main">{r.role}{r.company ? ` · ${r.company}` : ''}</h3>
                  <p className="mt-1 text-pop-text-muted">{r.description}</p>
                  {r.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.skills.map((s) => <span key={s} className="rounded border border-pop-border px-2 py-0.5 font-mono text-[10px] text-pop-text-muted">{s}</span>)}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
