import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/register';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { Skill } from '../../../types';
import CrystalButton from './CrystalButton';
import { crystalStateAt, DETONATE_AT } from './forgeLayout';

/** Cinematic Forge: the 17 crystals start clustered (a glowing meteor) and a
 *  non-pinned scrubbed trigger bursts them out to their rings as the tall
 *  section scrolls past a sticky stage. Crystals become clickable once settled.
 *  React-safe: CSS sticky (no pin), one ScrollTrigger, transform-only. */
export default function ForgeStage({ onActivate }: { onActivate: (s: Skill) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const crystalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const settledRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const apply = (progress: number) => {
      const halfW = stage.clientWidth / 2;
      const halfH = stage.clientHeight / 2;
      for (let i = 0; i < SKILLS.length; i++) {
        const el = crystalRefs.current[i];
        if (!el) continue;
        const c = crystalStateAt(progress, i);
        gsap.set(el, { xPercent: -50, yPercent: -50, x: c.x * halfW, y: c.y * halfH, rotation: c.rotate, scale: c.scale, opacity: c.opacity });
      }
    };
    const setSettled = (settled: boolean) => {
      if (settled === settledRef.current) return;
      settledRef.current = settled;
      crystalRefs.current.forEach((el) => { if (el) el.style.pointerEvents = settled ? 'auto' : 'none'; });
    };

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          apply(self.progress);
          setSettled(self.progress >= DETONATE_AT);
          if (flashRef.current) {
            flashRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(self.progress - DETONATE_AT) / 0.05));
          }
        },
      });
      apply(st.progress);
      setSettled(st.progress >= DETONATE_AT);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="relative h-[260vh]">
      <div ref={stageRef} className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <div className="pointer-events-none absolute top-24 z-10 w-full text-center">
          <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
        </div>
        {SKILLS.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => { crystalRefs.current[i] = el; }}
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{ pointerEvents: 'none' }}
          >
            <CrystalButton skill={s} onActivate={onActivate} />
          </div>
        ))}
        <div ref={flashRef} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />
      </div>
    </section>
  );
}
