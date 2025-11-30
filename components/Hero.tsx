import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Download, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '../constants';
import MagneticButton from './MagneticButton';

declare var Typed: any;

const Hero: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const typeTarget = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);

    // Initialize Typed.js
    if (typeTarget.current && typeof Typed !== 'undefined') {
      const typed = new Typed(typeTarget.current, {
        strings: [
          PROFILE.name,
          "Web Developer",
          "Mobile Developer",
          "UI/UX Designer"
        ],
        typeSpeed: 50,
        backSpeed: 40,
        backDelay: 1500,
        startDelay: 500,
        loop: true,
        smartBackspace: false // Ensure full name is backspaced to show roles
      });

      return () => {
        typed.destroy();
      };
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 w-full relative z-10 text-center flex flex-col items-center">
        
        <div className={`transition-all duration-1000 transform ${loaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}`}>
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold text-pop-primary bg-pop-surface rounded-full shadow-sm border border-pop-border hover:shadow-md transition-all cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Available for 2025 Opportunities
          </div>
          
          {/* Main Headline with Typewriter */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-pop-text-main tracking-tight leading-[1.1] mb-8 min-h-[160px] md:min-h-[auto]">
            Hi, I am <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pop-primary to-pop-secondary">
              <span ref={typeTarget}></span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-pop-text-muted mb-10 leading-relaxed max-w-2xl mx-auto">
            I bridge the gap between playful mobile interactions and robust enterprise systems.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <MagneticButton className="px-8 py-4 bg-pop-primary text-white font-bold rounded-full shadow-lg shadow-pop-primary/30 flex items-center gap-2 hover:bg-opacity-90 transition-colors">
              <a href="#projects" className="flex items-center gap-2">
                 View Work <ArrowRight className="w-4 h-4" />
              </a>
            </MagneticButton>
            
            <MagneticButton className="px-8 py-4 bg-pop-surface text-pop-text-main font-bold rounded-full shadow-md border border-pop-border hover:border-pop-primary transition-all flex items-center gap-2">
              <a 
                href="https://drive.google.com/file/d/1o6RSy9MJDvYwHtKJq0QmLbf6vui4sNPp/view?usp=drive_link" 
                download 
                className="flex items-center gap-2 cursor-pointer"
              >
                Download CV <Download className="w-4 h-4" />
              </a>
            </MagneticButton>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex items-center justify-center gap-6">
            <a href={PROFILE.social.github} className="p-3 bg-pop-surface border border-pop-border rounded-full text-pop-text-muted hover:text-pop-text-main hover:border-pop-primary hover:shadow-lg transition-all hover:-translate-y-1">
              <Github className="w-6 h-6" />
            </a>
            <a href={PROFILE.social.linkedin} className="p-3 bg-pop-surface border border-pop-border rounded-full text-pop-text-muted hover:text-pop-primary hover:border-pop-primary hover:shadow-lg transition-all hover:-translate-y-1">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
