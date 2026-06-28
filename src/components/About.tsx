import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const PLANET = '/assets/world/about/origin-planet-cutout-opt.webp';

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // Resolve reduced-motion synchronously so we render the right state on the first paint.
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reducedMotion) return; // static "landed" state (CSS defaults) — no scroll-jacking
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    // URL-bar show/hide on mobile changes innerHeight; ignore it so the scrub doesn't jump mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true });

    // gsap.context + revert() makes this StrictMode-safe: setup/cleanup/setup cleanly
    // tears down and rebuilds the pin + scrubbed timeline.
    const ctx = gsap.context(() => {
      // The scene is dark space with the planet already centered + visible on the FIRST frame
      // (no white-empty intro). It just grows from the start, then zooms in and "lands".
      gsap.set('.about-scrim', { opacity: 0 });
      gsap.set('.about-planet', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.35, opacity: 1 });
      gsap.set('.about-line', { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 1.4 : 2.0),
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // run the looping starfield/planet idle animations only while the scene is on-screen
          onToggle: (self: any) =>
            stageRef.current && stageRef.current.classList.toggle('about-active', self.isActive),
        },
      });

      tl.to('.about-planet', { scale: 1.0, duration: 0.5 }, 0.0) //            grow from the centered start
        .to(
          '.about-planet',
          {
            // function-based so it recalcs on ScrollTrigger refresh (resize / rotate)
            scale: () => (window.innerWidth < 640 ? 1.25 : 1.7),
            // desktop: drift right (text on the left); mobile: drift up (text stacks below)
            x: () => (window.innerWidth < 640 ? 0 : window.innerWidth * 0.2),
            y: () => (window.innerWidth < 640 ? -window.innerHeight * 0.17 : 0),
            duration: 0.28,
          },
          0.5
        ) //                                                                   zoom in + "land"
        .to('.about-scrim', { opacity: 1, duration: 0.2 }, 0.52) //            text scrim fades in
        .to('.about-line', { opacity: 1, y: 0, stagger: 0.05, duration: 0.2, ease: 'power2.out' }, 0.6); // content reveals
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="about" aria-labelledby="about-heading" className="relative bg-[#070512]">
      <div ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-[#070512]">
        {/* Deep-space backdrop (fades in over the white hero tail) */}
        <div className="about-space absolute inset-0 bg-[#070512]">
          <div className="absolute inset-0 bg-[radial-gradient(125%_90%_at_70%_28%,#1A0B3B_0%,#0A0620_46%,#050410_100%)]"></div>
          <div className="about-starfield about-twinkle absolute inset-0"></div>
          <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#06B6D4]/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#FF2BD6]/15 blur-3xl"></div>
        </div>

        {/* Origin planet — GSAP drives center/scale/drift; default CSS = the landed state */}
        <div className="about-planet absolute left-1/2 top-1/2 w-[60vmin]">
          <div
            aria-hidden="true"
            className="absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.5),rgba(6,182,212,0.18)_55%,transparent_72%)] blur-2xl"
          ></div>
          <img
            src={PLANET}
            alt=""
            aria-hidden="true"
            draggable={false}
            decoding="async"
            width={1100}
            height={1100}
            className="about-planet-img relative w-full select-none"
          />
        </div>

        {/* Left scrim for text legibility over the cosmos */}
        {/* Legibility scrim — left-fade on desktop, bottom-fade on mobile (both fade in via GSAP) */}
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

        {/* About content — bottom on mobile, vertically centered on desktop */}
        <div className="absolute inset-0 z-10 flex items-end pb-16 sm:items-center sm:pb-0">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
            <div className="about-copy max-w-lg">
              <p className="about-line mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#22D3EE] sm:text-sm">
                Origin // About
              </p>
              <h2
                id="about-heading"
                className="about-line font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#F5F3FF] sm:text-6xl"
              >
                Engineering with{' '}
                <span className="bg-gradient-to-r from-[#22D3EE] to-[#FF2BD6] bg-clip-text text-transparent">
                  Purpose &amp; Precision
                </span>
              </h2>
              <p className="about-line mt-6 text-base leading-relaxed text-[#C3BFD6] sm:text-lg">
                I&apos;m a software developer who believes great code should be invisible to the user. Whether it&apos;s a
                mobile app or a website, the experience should feel fluid, intuitive, and reliable.
              </p>
              <p className="about-line mt-4 text-base leading-relaxed text-[#C3BFD6] sm:text-lg">
                Having graduated from{' '}
                <span className="font-semibold text-[#F5F3FF]">Swinburne University of Technology</span> in 2026, I&apos;m
                now a Junior Software Developer — already helping businesses solve real-world logistics challenges through
                my award-winning work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
