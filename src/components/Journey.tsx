import React, { useEffect, useRef, useState } from 'react';
import Hero from './Hero';
import SpaceScene, { SKILLS, PHASES } from './SpaceScene';
import Experience, { ExperienceStatic } from './Experience';

// The merged journey is ONE pinned stage / ONE ScrollTrigger. The shared scroll progress p∈[0,1] is split into
// two remapped sub-progresses: the skills act (SpaceScene) plays in [0, SKILLS_END]; the Experience act in
// [PAN_LO, 1]. Across the PAN window the two scenes physically SLIDE UP in tandem — skills exits the top while
// Experience rises from below, flush-stacked like one continuous vertical space — so it reads as a real camera
// pan DOWN through one dimension (an opacity crossfade looked like Experience just fading in over the top).
const SKILLS_END = 0.7;  // skills/about sub-progress fills [0, SKILLS_END] of the shared scroll (SpaceScene)
const PAN_LO = 0.665;    // pan starts where SpaceScene's flip-down begins (right after the settled-crystal beat)
const PAN_HI = 0.8;      // pan ends once the Experience scene has fully slid up into view (slow + deliberate)
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth01 = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

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
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-6 sm:items-center sm:pb-0">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="about-copy pointer-events-auto max-w-xl">
          {/* Each line sits inside an overflow-hidden mask and slides up from behind it (staggered). */}
          <div className="overflow-hidden pb-0.5">
            <p className="about-line text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">
              Origin // About
            </p>
          </div>
          <div className="mt-3 overflow-hidden pb-1.5 sm:mt-5">
            <h2
              id="about-heading"
              className="about-line font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#F5F3FF] sm:text-7xl"
            >
              Engineering with{' '}
              <span className="about-gradient bg-gradient-to-r from-[#22D3EE] via-[#7C5CFF] to-[#FF2BD6] bg-clip-text text-transparent">
                Purpose &amp; Precision
              </span>
            </h2>
          </div>
          <div className="mt-4 overflow-hidden pb-1 sm:mt-7">
            <p className="about-line max-w-lg text-base leading-relaxed text-[#C3BFD6] sm:text-xl">
              I&apos;m a software developer who believes great code should be invisible to the user. Whether it&apos;s a
              mobile app or a website, the experience should feel fluid, intuitive, and reliable.
            </p>
          </div>
          <div className="mt-3 overflow-hidden pb-1 sm:mt-4">
            <p className="about-line max-w-lg text-base leading-relaxed text-[#C3BFD6] sm:text-xl">
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
  const spaceProgRef = useRef(0); // remapped skills/about sub-progress → SpaceScene
  const expProgRef = useRef(0);   // remapped Experience sub-progress → Experience layer
  const expLayerRef = useRef<HTMLDivElement>(null); // the Experience layer wrapper (crossfaded in at the seam)
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
      // NB: BOTH the About copy AND the skills-intro title are driven imperatively by SpaceScene from the raw
      // progress ref (reliable), NOT scrubbed GSAP tweens — a desynced timeline used to leave the copy stuck
      // hidden ("sometimes gone") and lagged the title's fly-out ~1s behind the crystals ("crystals first,
      // then the text"). SpaceScene now flies the title out on the SAME exitT as the crystals (perfectly parallel).

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          // one pin spans the WHOLE journey (About+Skills+Experience) — no inter-section gap
          end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 5.0 : 7.0),
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self: any) =>
            stageRef.current && stageRef.current.classList.toggle('about-active', self.isActive),
          onUpdate: (self: any) => {
            const p = self.progress;
            spaceProgRef.current = clamp01(p / SKILLS_END);          // skills/about occupy [0, SKILLS_END]
            expProgRef.current = clamp01((p - PAN_LO) / (1 - PAN_LO)); // experience occupies [PAN_LO, 1]
            // Vertical "camera-down" pan: both layers translate UP in tandem (flush-stacked), so skills slides
            // off the top as Experience rises from below — one continuous downward move, not a fade.
            const pan = smooth01(PAN_LO, PAN_HI, p);                // 0 = skills framed, 1 = experience framed
            const overlay = stageRef.current && (stageRef.current.querySelector('.jr-overlay') as HTMLElement | null);
            if (overlay) {
              overlay.style.transform = `translateY(${(-pan * 100).toFixed(2)}%)`; // exits upward
              overlay.style.pointerEvents = p > 0.42 * SKILLS_END && pan < 0.5 ? 'auto' : 'none';
            }
            if (expLayerRef.current) {
              expLayerRef.current.style.transform = `translateY(${((1 - pan) * 100).toFixed(2)}%)`; // rises from below
              expLayerRef.current.style.pointerEvents = pan > 0.5 ? 'auto' : 'none';
            }
          },
        },
      });

      // The planet entrance + the 90° camera turn are driven in 3D by progressRef (see SpaceScene);
      // this timeline only crossfades the HTML layers across the three acts.
      // SpaceScene now reads a sub-progress = p/SEAM_HI, so its phases sit inside the [0, SEAM_HI] band of the
      // shared scroll. These HTML crossfades must live in the SAME band → multiply every position+duration by
      // SEAM_HI so they stay locked to the 3D turn (otherwise the backdrop fade desyncs from the camera turn).
      const { ABOUT_END, TURN_START } = PHASES;
      const W = SKILLS_END;
      tl
        // Act 1 — About: deep space washes in over the hero, hero fades past, scrim reveals as the planet lands.
        .to('.about-space', { opacity: 1, duration: 0.12 * W }, 0.0)
        .to('.jr-hero', { autoAlpha: 0, scale: 1.12, duration: 0.12 * W }, 0.02 * W)
        .to('.about-scrim', { opacity: 1, duration: 0.12 * W }, (ABOUT_END - 0.40) * W)
        // Act 2 — the camera zooms + turns 90° right into the skills universe. The About copy is NOT animated
        // here: SpaceScene drives it through the LIVE scene camera each frame (projecting it from the planet's
        // world point + foreshortening by the yaw), so the copy and the planet sweep off as one 3D shot and
        // reverse together on scroll-up. SpaceScene also sets visibility:hidden once it's gone, so the
        // invisible text can't block the left crystals. Here we only fade the backdrop layers.
        .to(['.about-space', '.about-scrim'], { autoAlpha: 0, duration: 0.14 * W }, TURN_START * W);
      // Act 3 + Act 4 (skills intro rise-in + parallel fly-out) are driven imperatively in SpaceScene off the
      // shared exitT, so they move in perfect lockstep with the 3D crystals — see the `.skills-intro` block there.

      // Pin the timeline length to exactly 1.0 so scrub maps timeline-time 1:1 onto scroll progress —
      // i.e. a tween at position P fires at progress P, keeping these GSAP phases in lockstep with the
      // PHASES thresholds SpaceScene reads from raw progress. (Without this, editing any tween's
      // duration would silently rescale every phase and desync the HTML crossfades from the 3D turn.)
      tl.to({ v: 0 }, { v: 1, duration: 0 }, 1);
    }, trackRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Reduced motion: no scroll-jacking — hero, static landed About, then the static Experience timeline.
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
        <ExperienceStatic />
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
        {/* Skills/About act — the shared SpaceScene canvas + its overlays. Slides UP and off across the pan. */}
        <div className="jr-overlay absolute inset-0 will-change-transform" style={{ opacity: 0, pointerEvents: 'none' }}>
          <AboutLayers use3D progressRef={spaceProgRef} />
        </div>
        {/* Experience act — its own canvas + overlays, in the SAME pinned stage. Starts below the fold and SLIDES
            UP into view across the pan window (flush-stacked under the skills act), so the hand-off reads as one
            continuous camera-down move. Driven by the remapped Experience sub-progress. */}
        <div ref={expLayerRef} className="absolute inset-0 will-change-transform" style={{ transform: 'translateY(100%)', pointerEvents: 'none' }}>
          <Experience progressRef={expProgRef} />
        </div>
      </div>
    </section>
  );
};

export default Journey;
