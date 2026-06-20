import React from 'react';
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
import ScrollProgressBar from './components/ScrollProgressBar';
import SectionHoverGlow from './components/SectionHoverGlow';
import ScrollRippleEffect from './components/ScrollRippleEffect';
import Preloader from './components/Preloader';
import { useSiteAnimations } from './animations';

const App: React.FC = () => {
  // Boots the entire GSAP + Lenis animation layer (reveals, parallax, pins,
  // intro, cursor, smooth scroll) inside one self-cleaning gsap.context.
  useSiteAnimations();

  return (
    <main className="relative min-h-screen text-pop-text-main font-sans selection:bg-pop-primary selection:text-white transition-colors duration-300 cursor-none">
      <Preloader />
      <CustomCursor />
      <ScrollProgressBar />
      <SectionHoverGlow />
      <ScrollRippleEffect />
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
