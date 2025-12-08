import React, { useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import ProjectsShowcase from './components/ProjectsShowcase';
import Contact from './components/Contact';
import AIChatBot from './components/AIChatBot';
import MeshBackground from './components/MeshBackground';
import GhostCursors from './components/GhostCursors';
import ReactionButton from './components/ReactionButton';
import WireframeGlobe from './components/WireframeGlobe';
import MeteorShower from './components/MeteorShower';
import FogBackground from './components/FogBackground';
import ProfessionalSkills from './components/ProfessionalSkills';
import CustomCursor from './components/CustomCursor';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const App: React.FC = () => {
  useEffect(() => {
    // GLOBAL SCROLL TRIGGER LOGIC
    // This handles the "Bi-Directional" (Reversible) animation for all elements with class .reveal-on-scroll
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      const elements = document.querySelectorAll('.reveal-on-scroll');
      
      elements.forEach((el) => {
        // Reset any previous state
        window.gsap.set(el, { y: 60, opacity: 0 });

        window.gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 15%",
            // play on enter, reverse on leave, play on enter back, reverse on leave back
            toggleActions: "play reverse play reverse", 
            markers: false
          }
        });
      });
    }
  }, []);

  return (
    <main className="relative min-h-screen text-pop-text-main font-sans selection:bg-pop-primary selection:text-white transition-colors duration-300 cursor-none">
      <CustomCursor />
      <FogBackground />
      <MeshBackground />
      <WireframeGlobe />
      <MeteorShower />
      
      <GhostCursors />
      
      <Navigation />
      <Hero />
      <About />
      <ProfessionalSkills />
      <Experience />
      <ProjectsShowcase />
      <Contact />
      
      <ReactionButton />
      <AIChatBot />
    </main>
  );
};

export default App;