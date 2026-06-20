import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import { ArrowRight, Download, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '../constants';
import MagneticButton from './MagneticButton';
import { CONFIG } from '../animations';

const Hero: React.FC = () => {
  const typeTarget = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let typed: Typed | null = null;

    const startTyping = () => {
      if (!typeTarget.current || typed) return;
      typed = new Typed(typeTarget.current, {
        strings: [PROFILE.name, 'Web Developer', 'Mobile Developer', 'UI/UX Designer'],
        typeSpeed: 50,
        backSpeed: 40,
        backDelay: 1500,
        startDelay: 300,
        loop: true,
        smartBackspace: false,
      });
    };

    // Under reduced motion, show a static name instead of the typewriter loop.
    // Otherwise sync the typewriter to the intro (the headline reveal fires
    // `intro:type`).
    if (CONFIG.reducedMotion) {
      if (typeTarget.current) typeTarget.current.textContent = PROFILE.name;
    } else {
      window.addEventListener('intro:type', startTyping, { once: true });
    }

    return () => {
      window.removeEventListener('intro:type', startTyping);
      typed?.destroy();
    };
  }, []);

  return (
    <section
      id="hero"
      data-hero
      data-tint="#6366f1"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Readability scrim: softly tames the core's glow behind the hero text. */}
      <div className="hero-scrim" aria-hidden="true" />

      {/* Floating identity constellation around the central name-star. */}
      <div className="hero-constellation" aria-hidden="true">
        <span className="hero-node" style={{ top: '24%', left: '9%', animationDelay: '0s' }}>
          <span className="dot" /> Mobile Dev
        </span>
        <span className="hero-node" style={{ top: '33%', right: '8%', animationDelay: '1.2s' }}>
          <span className="dot" /> Enterprise ERP
        </span>
        <span className="hero-node" style={{ bottom: '28%', left: '13%', animationDelay: '0.6s' }}>
          <span className="dot" /> 🏆 Award-winning
        </span>
        <span className="hero-node" style={{ bottom: '24%', right: '11%', animationDelay: '1.8s' }}>
          <span className="dot" /> UI/UX Design
        </span>
      </div>

      <div
        data-hero-content
        className="max-w-4xl mx-auto px-6 w-full relative z-10 text-center flex flex-col items-center"
      >
        {/* Status Badge */}
        <div data-hero-badge className="hero-status mb-8 cursor-default">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Available for 2025 Opportunities
        </div>

        {/* Main Headline with Typewriter */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-pop-text-main tracking-tight leading-[1.1] mb-8 min-h-[160px] md:min-h-[auto]">
          <span data-hero-headline className="inline-block">Hi, I am</span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pop-primary via-pop-secondary to-pop-primary text-gradient-flow">
            <span ref={typeTarget}></span>
          </span>
        </h1>

        <p data-hero-sub className="text-lg md:text-xl text-pop-text-muted mb-10 leading-relaxed max-w-2xl mx-auto">
          I bridge the gap between playful mobile interactions and robust enterprise systems.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <div data-hero-cta>
            <MagneticButton
              href="#projects"
              className="btn-shine px-8 py-4 bg-pop-primary text-white font-bold rounded-full shadow-lg shadow-pop-primary/30 flex items-center gap-2 hover:bg-opacity-90 transition-colors"
            >
              View Work <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>

          <div data-hero-cta>
            <MagneticButton
              href="https://drive.google.com/file/d/1o6RSy9MJDvYwHtKJq0QmLbf6vui4sNPp/view?usp=drive_link"
              download
              className="btn-cv px-8 py-4 font-bold rounded-full flex items-center gap-2 cursor-pointer"
            >
              Download CV <Download className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex items-center justify-center gap-6">
          <a data-hero-social data-magnetic="18" href={PROFILE.social.github} aria-label="GitHub" className="p-3 bg-pop-surface border border-pop-border rounded-full text-pop-text-muted hover:text-pop-text-main hover:border-pop-primary hover:shadow-lg transition-shadow">
            <Github className="w-6 h-6" />
          </a>
          <a data-hero-social data-magnetic="18" href={PROFILE.social.linkedin} aria-label="LinkedIn" className="p-3 bg-pop-surface border border-pop-border rounded-full text-pop-text-muted hover:text-pop-primary hover:border-pop-primary hover:shadow-lg transition-shadow">
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
