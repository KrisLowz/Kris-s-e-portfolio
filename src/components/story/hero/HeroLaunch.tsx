import { useRef, useEffect } from 'react';
import { gsap } from '../../../motion/register';
import { CONFIG } from '../../../motion/config';
import { PROFILE } from '../../../content';

export default function HeroLaunch() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CONFIG.reducedMotion || CONFIG.isMobile || !CONFIG.toggles.heroPin) return;
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=80%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        })
        .to(content, { scale: 0.9, autoAlpha: 0.15, ease: 'none' });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative grid min-h-screen items-center overflow-hidden px-6 pt-24 md:px-16"
    >
      <div ref={contentRef} className="relative z-10 max-w-3xl">
        <span data-anim="pop" className="font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
          Pilot profile · {PROFILE.title}
        </span>
        <h1 data-anim="chars" className="mt-3 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
          {PROFILE.name}
        </h1>
        <p data-anim="words" className="mt-4 font-display text-xl text-pop-text-main md:text-2xl">
          {PROFILE.headline}
        </p>
        <p data-anim="lines" className="mt-4 max-w-xl text-pop-text-muted">
          Computer Science graduate, Swinburne 2025 — focused on mobile applications, user-centric design, and enterprise systems.
        </p>
        <div data-stagger="0.08" className="mt-8 flex flex-wrap gap-3">
          <a data-anim="pop" href="#about" className="rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Launch Tour →</a>
          <a data-anim="pop" href={PROFILE.cv} className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">Download CV</a>
          <a data-anim="pop" href={PROFILE.social.github} target="_blank" rel="noreferrer" className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">GitHub</a>
          <a data-anim="pop" href={PROFILE.social.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-pop-border px-5 py-2 font-mono text-sm">LinkedIn</a>
        </div>
      </div>
    </section>
  );
}
