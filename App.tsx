import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AIChatBot from './components/AIChatBot';

const App: React.FC = () => {
  return (
    <main className="relative bg-slate-50 dark:bg-brand-dark text-slate-600 dark:text-slate-300 transition-colors duration-300">
      <Navigation />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Contact />
      <AIChatBot />
    </main>
  );
};

export default App;