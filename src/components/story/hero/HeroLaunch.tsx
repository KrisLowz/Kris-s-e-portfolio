import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function HeroLaunch() {
  return (
    <section id="hero" className="relative grid min-h-screen items-center overflow-hidden px-6 md:px-16">
      <img
        src={WORLD_ASSETS.spaceship}
        alt=""
        aria-hidden
        data-float
        className="pointer-events-none absolute bottom-[12%] right-[6%] w-56 opacity-80 md:w-80"
      />
      <div className="relative z-10 max-w-3xl">
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
