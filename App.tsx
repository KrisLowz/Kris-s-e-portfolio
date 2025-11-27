import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AIChatBot from './components/AIChatBot';
import MeshBackground from './components/MeshBackground';
import GhostCursors from './components/GhostCursors';
import ReactionButton from './components/ReactionButton';

const App: React.FC = () => {
  return (
    <main className="relative min-h-screen text-pop-text font-sans selection:bg-soft-purple selection:text-pop-primary">
      <MeshBackground />
      <GhostCursors />
      <Navigation />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Contact />
      <ReactionButton />
      <AIChatBot />
    </main>
  );
};

export default App;