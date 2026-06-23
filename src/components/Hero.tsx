import React from 'react';
import { ArrowRight, Download, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '../constants';
import MagneticButton from './MagneticButton';
import SignalLockText from './hero/SignalLockText';

const Hero: React.FC = () => {
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
        data-zoom-out
        className="max-w-4xl mx-auto px-6 w-full relative z-10 text-center flex flex-col items-center"
      >
        {/* Boot status */}
        <div data-hero-badge className="hero-status mb-8 cursor-default">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          System Online · Available 2025
        </div>

        {/* Identity boot */}
        <span className="holo-label mb-4 block">// identifying pilot</span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-pop-text-main tracking-tight leading-[1.1] mb-4 min-h-[160px] md:min-h-[auto]">
          <span data-hero-headline className="inline-block">Hi, I am</span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pop-primary via-pop-secondary to-pop-primary text-gradient-flow">
            <SignalLockText text={PROFILE.name} />
          </span>
        </h1>

        <p data-hero-sub className="hero-brief mb-10">
          // bridging playful mobile interactions and robust enterprise systems.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <div data-hero-cta>
            <MagneticButton href="#projects" className="holo-btn holo-btn-lg btn-shine">
              ▸ Launch tour <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>

          <div data-hero-cta>
            <MagneticButton
              href="https://drive.google.com/file/d/1o6RSy9MJDvYwHtKJq0QmLbf6vui4sNPp/view?usp=drive_link"
              download
              className="holo-btn holo-btn-lg"
            >
              ▸ Download CV <Download className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>

        {/* Social uplinks */}
        <div className="mt-16 flex items-center justify-center gap-5">
          <a
            data-hero-social
            data-magnetic="18"
            href={PROFILE.social.github}
            aria-label="GitHub"
            className="holo-social"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            data-hero-social
            data-magnetic="18"
            href={PROFILE.social.linkedin}
            aria-label="LinkedIn"
            className="holo-social"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
