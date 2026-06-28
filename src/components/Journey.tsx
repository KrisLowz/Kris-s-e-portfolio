import React, { useEffect, useRef, useState } from 'react';
import Hero from './Hero';
import SpaceScene, { SKILLS, PHASES } from './SpaceScene';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const PLANET = '/assets/world/about/origin-planet-cutout-opt.webp';

// Space + planet + About copy. Reused by the animated journey (inside .jr-overlay) and the
// reduced-motion static fallback (rendered directly). Targets the shared .about-* CSS.
const AboutLayers: React.FC<{ use3D?: boolean; progressRef?: React.MutableRefObject<number> }> = ({
  use3D,
  progressRef,
}) => (
  <>
    {/* Deep-space backdrop */}
    <div className="about-space absolute inset-0 bg-[#070512]">
      <div className="absolute inset-0 bg-[radial-gradient(125%_90%_at_70%_28%,#1A0B3B_0%,#0A0620_46%,#050410_100%)]"></div>
      <div className="about-starfield about-twinkle absolute inset-0"></div>
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#06B6D4]/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#FF2BD6]/15 blur-3xl"></div>
    </div>

    {/* The planet now lives in the shared full-viewport WebGL scene; its pop/grow/land is driven in 3D
        by the scroll-progress ref. Reduced-motion / no-WebGL shows a static image instead. */}
    {use3D && progressRef ? (
      <SpaceScene progressRef={progressRef} />
    ) : (
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center sm:justify-end sm:pr-[7vw]">
        <img
          src={PLANET}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          width={1100}
          height={1100}
          className="h-[62vmin] w-[62vmin] object-contain select-none drop-shadow-[0_0_60px_rgba(124,58,237,0.4)]"
        />
      </div>
    )}

    {/* Legibility scrim — left-fade on desktop, bottom-fade on mobile */}
    <div
      aria-hidden="true"
      className="about-scrim pointer-events-none absolute inset-0 hidden sm:block"
      style={{
        background:
          'linear-gradient(to right, rgba(5,4,16,0.96) 0%, rgba(5,4,16,0.8) 42%, rgba(5,4,16,0.34) 66%, transparent 82%)',
      }}
    ></div>
    <div
      aria-hidden="true"
      className="about-scrim pointer-events-none absolute inset-0 sm:hidden"
      style={{
        background:
          'linear-gradient(to top, rgba(5,4,16,0.97) 0%, rgba(5,4,16,0.82) 34%, rgba(5,4,16,0.35) 58%, transparent 82%)',
      }}
    ></div>

    {/* About copy — the container is click-through so hover reaches the 3D planet behind it;
        only the text block itself stays interactive (selection). */}
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-16 sm:items-center sm:pb-0">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="about-copy pointer-events-auto max-w-xl">
          {/* Each line sits inside an overflow-hidden mask and slides up from behind it (staggered). */}
          <div className="overflow-hidden pb-0.5">
            <p className="about-line text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">
              Origin // About
            </p>
          </div>
          <div className="mt-5 overflow-hidden pb-1.5">
            <h2
              id="about-heading"
              className="about-line font-display text-5xl font-extrabold leading-[1.06] tracking-tight text-[#F5F3FF] sm:text-7xl"
            >
              Engineering with{' '}
              <span className="about-gradient bg-gradient-to-r from-[#22D3EE] via-[#7C5CFF] to-[#FF2BD6] bg-clip-text text-transparent">
                Purpose &amp; Precision
              </span>
            </h2>
          </div>
          <div className="mt-7 overflow-hidden pb-1">
            <p className="about-line max-w-lg text-lg leading-relaxed text-[#C3BFD6] sm:text-xl">
              I&apos;m a software developer who believes great code should be invisible to the user. Whether it&apos;s a
              mobile app or a website, the experience should feel fluid, intuitive, and reliable.
            </p>
          </div>
          <div className="mt-4 overflow-hidden pb-1">
            <p className="about-line max-w-lg text-lg leading-relaxed text-[#C3BFD6] sm:text-xl">
              Having graduated from{' '}
              <span className="font-semibold text-[#F5F3FF]">Swinburne University of Technology</span> in 2026, I&apos;m now
              a Junior Software Developer — already helping businesses solve real-world logistics challenges through my
              award-winning work.
            </p>
          </div>
          {/* Reduced-motion / no-WebGL: skills can't be revealed by hovering the 3D planet, so list them */}
          {!use3D && (
            <ul className="mt-6 flex max-w-md flex-wrap gap-2">
              {SKILLS.map((s) => (
                <li
                  key={s.name}
                  title={s.desc}
                  className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>

    {/* Act 3 — skills-universe intro title at the top; the crystal grid (3D) fills the space below. */}
    {use3D && (
      <div className="skills-intro pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[8vh] text-center" style={{ opacity: 0 }}>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Forge // Technical Skills</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#F5F3FF] sm:text-6xl">
          The Tools I{' '}
          <span className="bg-gradient-to-r from-[#22D3EE] via-[#7C5CFF] to-[#FF2BD6] bg-clip-text text-transparent">Command</span>
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#C3BFD6] sm:text-lg">
          Every language and framework — forged by shipping real work under real pressure.
        </p>
      </div>
    )}
  </>
);

const Journey: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0); // ScrollTrigger writes scroll progress here each frame; SpaceScene reads it
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reducedMotion) return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      // The overlay starts hidden (inline opacity 0) so only the hero shows before JS runs.
      gsap.set('.jr-overlay', { opacity: 1 });
      gsap.set('.about-space', { opacity: 0 });
      gsap.set('.about-scrim', { opacity: 0 });
      gsap.set('.skills-intro', { opacity: 0, y: 24 });
      // Masked reveal: each line starts pushed fully below its overflow-hidden wrapper, then wipes up.
      gsap.set('.about-line', { yPercent: 120, opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 2.9 : 4.0),
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self: any) =>
            stageRef.current && stageRef.current.classList.toggle('about-active', self.isActive),
          // Keep the overlay click/select-through while the hero is in control; only capture
          // pointer events once the About scene has taken over (hero is hidden by then).
          onUpdate: (self: any) => {
            progressRef.current = self.progress; // drives the 3D planet entrance in SpaceScene
            const overlay = stageRef.current && (stageRef.current.querySelector('.jr-overlay') as HTMLElement | null);
            if (overlay) overlay.style.pointerEvents = self.progress > 0.42 ? 'auto' : 'none';
          },
        },
      });

      // The planet entrance + the 90° camera turn are driven in 3D by progressRef (see SpaceScene);
      // this timeline only crossfades the HTML layers across the three acts.
      const { ABOUT_END, TURN_START, TURN_END, EXIT_START } = PHASES;
      tl
        // Act 1 — About (compressed into [0, ABOUT_END]): deep space washes in over the hero, hero
        // fades past, scrim + copy reveal as the planet lands.
        .to('.about-space', { opacity: 1, duration: 0.12 }, 0.0)
        .to('.jr-hero', { autoAlpha: 0, scale: 1.12, duration: 0.12 }, 0.02)
        .to('.about-scrim', { opacity: 1, duration: 0.1 }, ABOUT_END - 0.16)
        .to('.about-line', { yPercent: 0, opacity: 1, stagger: 0.04, duration: 0.12, ease: 'power3.out' }, ABOUT_END - 0.15)
        // Act 2 — the camera zooms + turns 90° right into the skills universe. The About copy is NOT animated
        // here: SpaceScene drives it through the LIVE scene camera each frame (projecting it from the planet's
        // world point + foreshortening by the yaw), so the copy and the planet sweep off as one 3D shot and
        // reverse together on scroll-up. SpaceScene also sets visibility:hidden once it's gone, so the
        // invisible text can't block the left crystals. Here we only fade the backdrop layers.
        .to(['.about-space', '.about-scrim'], { autoAlpha: 0, duration: 0.14 }, TURN_START)
        // Act 3 — the skills universe: its intro title rises in once the turn completes (settles well before
        // the exit so the two don't fight).
        .to('.skills-intro', { opacity: 1, y: 0, duration: 0.08, ease: 'power3.out' }, TURN_END)
        // Act 4 — exit: the title flies UP + scales (zooming past the camera like the crystals), only fading
        // right at the end once it's already swept off the top — not a fade-in-place.
        .to('.skills-intro', { y: -360, scale: 1.5, autoAlpha: 0, duration: 1 - EXIT_START, ease: 'power3.in' }, EXIT_START);

      // Pin the timeline length to exactly 1.0 so scrub maps timeline-time 1:1 onto scroll progress —
      // i.e. a tween at position P fires at progress P, keeping these GSAP phases in lockstep with the
      // PHASES thresholds SpaceScene reads from raw progress. (Without this, editing any tween's
      // duration would silently rescale every phase and desync the HTML crossfades from the 3D turn.)
      tl.to({ v: 0 }, { v: 1, duration: 0 }, 1);
    }, trackRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Reduced motion: no scroll-jacking — hero, then a static landed About below it.
  if (reducedMotion) {
    return (
      <>
        <Hero />
        <section
          id="about"
          aria-labelledby="about-heading"
          className="relative h-[100svh] w-full overflow-hidden bg-[#070512]"
        >
          <AboutLayers />
        </section>
      </>
    );
  }

  return (
    <section ref={trackRef} id="about" aria-labelledby="about-heading" className="relative bg-[#070512]">
      <div ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-[#070512]">
        {/* Hero layer — held, then zooms past + fades as the planet emerges over it */}
        <div className="jr-hero absolute inset-0">
          <Hero />
        </div>
        {/* Space + planet + About overlay — hidden until JS so it never flashes over the hero.
            pointer-events start OFF so the hero stays fully interactive; the scroll handler turns
            them on once About has taken over. */}
        <div className="jr-overlay absolute inset-0" style={{ opacity: 0, pointerEvents: 'none' }}>
          <AboutLayers use3D progressRef={progressRef} />
        </div>
      </div>
    </section>
  );
};

export default Journey;
