import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '../constants';

declare var Typed: any;

const VIDEO = '/assets/world/mascot/cat-hero-full.mp4';
const POSTER = '/assets/world/mascot/cat-hero-full-poster.jpg';
const CV_LINK = 'https://drive.google.com/file/d/10t-OUA1b0qfzzDt6ggl6EEy-NgRhFRrP/view?usp=sharing';

// Chunky "sticker" button: hard offset shadow, bouncy hover, satisfying press.
const stickerBase =
  'hero-pop group inline-flex items-center gap-2 rounded-2xl border-2 border-[#14121A] px-6 py-3.5 font-display font-bold text-[#14121A] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const iconBtnBase =
  'hero-pop group grid h-[52px] w-[52px] place-items-center rounded-2xl border-2 border-[#14121A] bg-white text-[#14121A] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const Hero: React.FC = () => {
  const typeTarget = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = mq.matches;
    setReducedMotion(reduce);
    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMotionChange);

    // Typewriter (rotates name + roles), magenta caret via .hero-role.
    let typed: any;
    if (typeTarget.current && typeof Typed !== 'undefined') {
      typed = new Typed(typeTarget.current, {
        strings: [PROFILE.name, 'Web Developer', 'Mobile Developer', 'UI/UX Designer'],
        typeSpeed: 55,
        backSpeed: 35,
        backDelay: 1600,
        startDelay: reduce ? 200 : 1300,
        loop: true,
        smartBackspace: false,
      });
    }

    // Pause the looping video while the hero is scrolled off-screen (saves battery/data).
    let observer: IntersectionObserver | null = null;
    if (!reduce && videoRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const v = videoRef.current;
          if (!v) return;
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(videoRef.current);
    }

    return () => {
      mq.removeEventListener('change', onMotionChange);
      if (typed) typed.destroy();
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-white font-sans">
      {/* Full-bleed mascot */}
      {reducedMotion ? (
        <img
          src={POSTER}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:object-center"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER}
          aria-hidden="true"
        >
          <source src={VIDEO} type="video/mp4" />
        </video>
      )}

      {/* Light wash behind the text only — fades out fully before the cat so it never veils the mascot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 26%, rgba(255,255,255,0.15) 46%, rgba(255,255,255,0) 60%)',
        }}
      ></div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/90 via-white/25 to-transparent sm:hidden"
      ></div>

      {/* Vibrant color glows (pop) */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#06B6D4]/20 blur-3xl"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -left-10 bottom-20 h-80 w-80 rounded-full bg-[#FF2BD6]/15 blur-3xl"></div>

      {/* Content: greeting pinned top-left, CTAs pinned bottom-left */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 py-24 sm:px-10 sm:py-28 lg:px-12">
        {/* TOP — greeting + typewriter */}
        <div className="w-full max-w-3xl self-start">
          <div
            className="hero-pop mb-5 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] [text-shadow:0_1px_2px_rgba(255,255,255,0.7)] sm:text-sm"
            style={{ animationDelay: '80ms' }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            Available for 2026 Opportunities
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1] tracking-tight text-[#14121A] [text-shadow:0_2px_14px_rgba(255,255,255,0.6)] sm:text-7xl lg:text-8xl">
            <span className="hero-pop inline-block" style={{ animationDelay: '200ms' }}>Hi,</span>{' '}
            <span className="hero-pop inline-block" style={{ animationDelay: '290ms' }}>I</span>{' '}
            <span className="hero-pop inline-block" style={{ animationDelay: '380ms' }}>am</span>
          </h1>
          <div
            className="hero-pop mt-2 min-h-[1.2em] font-display text-4xl font-extrabold leading-[1.05] [text-shadow:0_2px_14px_rgba(255,255,255,0.5)] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '520ms' }}
          >
            <span className="hero-role">
              <span
                ref={typeTarget}
                className="bg-gradient-to-r from-[#06B6D4] to-[#FF2BD6] bg-clip-text text-transparent"
              ></span>
            </span>
          </div>
        </div>

        {/* BOTTOM — tagline + CTAs + socials */}
        <div className="w-full max-w-2xl self-start">
          {/* Mascot spaceship patrolling back and forth above the tagline.
              Facing is handled by the animation's scaleX (turns around at each end). */}
          <div className="relative h-24 w-full sm:h-28" aria-hidden="true">
            <div className="hero-ship w-28 sm:w-36">
              <img
                src="/assets/world/hero/portfolio-spaceship-cutout.png"
                alt=""
                className="w-full drop-shadow-[0_8px_16px_rgba(6,182,212,0.4)]"
              />
            </div>
          </div>

          <p
            className="hero-pop max-w-lg text-lg font-semibold leading-relaxed text-[#2A2730] [text-shadow:0_1px_3px_rgba(255,255,255,0.6)] sm:text-2xl"
            style={{ animationDelay: '660ms' }}
          >
            I bridge the gap between playful mobile interactions and robust enterprise systems.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#projects"
              style={{ animationDelay: '800ms' }}
              className={`${stickerBase} bg-[#06B6D4] shadow-[4px_4px_0_0_#14121A] hover:shadow-[6px_7px_0_0_#14121A] active:shadow-[2px_2px_0_0_#14121A] focus-visible:ring-[#06B6D4]`}
            >
              View Work
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <a
              href={CV_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{ animationDelay: '880ms' }}
              className={`${stickerBase} bg-white shadow-[4px_4px_0_0_#FF2BD6] hover:shadow-[6px_7px_0_0_#FF2BD6] active:shadow-[2px_2px_0_0_#FF2BD6] focus-visible:ring-[#FF2BD6]`}
            >
              Download CV
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>

            <a
              href={PROFILE.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              style={{ animationDelay: '960ms' }}
              className={`${iconBtnBase} shadow-[4px_4px_0_0_#06B6D4] hover:shadow-[6px_7px_0_0_#06B6D4] active:shadow-[2px_2px_0_0_#06B6D4] focus-visible:ring-[#06B6D4]`}
            >
              <Github className="h-5 w-5 group-hover:[animation:wobble_0.5s_ease-in-out]" />
            </a>

            <a
              href={PROFILE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              style={{ animationDelay: '1040ms' }}
              className={`${iconBtnBase} shadow-[4px_4px_0_0_#FF2BD6] hover:shadow-[6px_7px_0_0_#FF2BD6] active:shadow-[2px_2px_0_0_#FF2BD6] focus-visible:ring-[#FF2BD6]`}
            >
              <Linkedin className="h-5 w-5 group-hover:[animation:wobble_0.5s_ease-in-out]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
