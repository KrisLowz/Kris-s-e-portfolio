import React from 'react';
import Journey from './components/Journey';
import Projects from './components/Projects';

// 2026 rebuild. Journey is now ONE pinned stage that fuses Hero → About → Skills → Experience into a single
// scroll-driven 3D shot (the Experience flight-path is mounted as a crossfading layer inside Journey, so there
// is no dead gap between the skills exit and the docking scene). Remaining old sections stay in the repo.
const App: React.FC = () => {
  return (
    <main className="relative overflow-x-clip bg-white font-sans text-[#14121A] antialiased">
      <Journey />
      <Projects />
    </main>
  );
};

export default App;
