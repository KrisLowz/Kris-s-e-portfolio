import React, { useEffect, useRef, useState } from 'react';
import Hero from './Hero';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const PLANET = '/assets/world/about/origin-planet-cutout-opt.webp';

// Space + planet + About copy. Reused by the animated journey (inside .jr-overlay) and the
// reduced-motion static fallback (rendered directly). Targets the shared .about-* CSS.
const AboutLayers: React.FC = () => (
  <>
    {/* Deep-space backdrop */}
    <div className="about-space absolute inset-0 bg-[#070512]">
      <div className="absolute inset-0 bg-[radial-gradient(125%_90%_at_70%_28%,#1A0B3B_0%,#0A0620_46%,#050410_100%)]"></div>
      <div className="about-starfield about-twinkle absolute inset-0"></div>
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#06B6D4]/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#FF2BD6]/15 blur-3xl"></div>
    </div>

    {/* Origin planet — pops from the hero centre, grows, then "lands" */}
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

    {/* About copy */}
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
            <span className="about-gradient bg-gradient-to-r from-[#22D3EE] via-[#7C5CFF] to-[#FF2BD6] bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(34,211,238,0.25)]">
              Purpose &amp; Precision
            </span>
          </h2>
          <p className="about-line mt-6 text-base leading-relaxed text-[#C3BFD6] sm:text-lg">
            I&apos;m a software developer who believes great code should be invisible to the user. Whether it&apos;s a
            mobile app or a website, the experience should feel fluid, intuitive, and reliable.
          </p>
          <p className="about-line mt-4 text-base leading-relaxed text-[#C3BFD6] sm:text-lg">
            Having graduated from{' '}
            <span className="font-semibold text-[#F5F3FF]">Swinburne University of Technology</span> in 2026, I&apos;m now
            a Junior Software Developer — already helping businesses solve real-world logistics challenges through my
            award-winning work.
          </p>
        </div>
      </div>
    </div>
  </>
);

const Journey: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
      gsap.set('.about-planet', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0, opacity: 1 });
      // 3D "stand up from a backward tilt" entrance (hinged at the base, projected by .about-copy's perspective)
      gsap.set('.about-line', { opacity: 0, rotationX: 50, y: 28, transformOrigin: '50% 100%' });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 1.6 : 2.2),
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
            const overlay = stageRef.current && (stageRef.current.querySelector('.jr-overlay') as HTMLElement | null);
            if (overlay) overlay.style.pointerEvents = self.progress > 0.42 ? 'auto' : 'none';
          },
        },
      });

      tl
        // 1) background overlays the hero FIRST: deep space washes in, hero zooms past + fades out
        .to('.about-space', { opacity: 1, duration: 0.24 }, 0.0)
        .to('.jr-hero', { autoAlpha: 0, scale: 1.12, duration: 0.24 }, 0.04)
        // 2) THEN the planet pops up from the centre and grows (on the now-dark space)
        .to('.about-planet', { scale: 0.5, duration: 0.16, ease: 'power2.out' }, 0.3)
        .to('.about-planet', { scale: 1.0, duration: 0.24 }, 0.46)
        // 3) zoom in + "land"
        .to(
          '.about-planet',
          {
            scale: () => (window.innerWidth < 640 ? 1.25 : 1.7),
            x: () => (window.innerWidth < 640 ? 0 : window.innerWidth * 0.2),
            y: () => (window.innerWidth < 640 ? -window.innerHeight * 0.17 : 0),
            duration: 0.26,
          },
          0.7
        )
        .to('.about-scrim', { opacity: 1, duration: 0.18 }, 0.7)
        .to(
          '.about-line',
          { opacity: 1, rotationX: 0, y: 0, stagger: 0.09, duration: 0.26, ease: 'power3.out' },
          0.74
        );
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
          <AboutLayers />
        </div>
      </div>
    </section>
  );
};

export default Journey;
