import React from 'react';
import Journey from './components/Journey';
import Experience from './components/Experience';
import Projects from './components/Projects';

// 2026 rebuild — building the site back up section by section.
// Journey = the bright "Pop Arcade" Hero and the scroll-driven dive into the space world
// (About) fused into ONE pinned stage: the planet emerges from the hero centre, grows, and
// the space scene covers the hero in place. Remaining old sections stay in the repo, unmounted.
const App: React.FC = () => {
  return (
    <main className="relative overflow-x-clip bg-white font-sans text-[#14121A] antialiased">
      <Journey />
      <Experience />
      <Projects />
    </main>
  );
};

export default App;
