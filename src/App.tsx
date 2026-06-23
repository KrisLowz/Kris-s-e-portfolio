import React, { Suspense } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import ProjectsShowcase from './components/ProjectsShowcase';
import Contact from './components/Contact';
import AIChatBot from './components/AIChatBot';
import GhostCursors from './components/GhostCursors';
import ReactionButton from './components/ReactionButton';
import ForgeStage from './components/ForgeStage';
import CustomCursor from './components/CustomCursor';
import ScrollProgressBar from './components/ScrollProgressBar';
import SectionHoverGlow from './components/SectionHoverGlow';
import ScrollRippleEffect from './components/ScrollRippleEffect';
import Preloader from './components/Preloader';
import VoyageHUD from './components/VoyageHUD';
import { useSiteAnimations } from './animations';
import { shouldRenderScene } from './scene/capability';
import SceneFallback from './scene/SceneFallback';

// Lazy: keeps the entire three.js / R3F tree out of the initial bundle so it
// never blocks first paint. Only imported when shouldRenderScene() is true.
const CosmicCanvas = React.lazy(() => import('./scene/CosmicCanvas'));

const App: React.FC = () => {
  // Boots the entire GSAP + Lenis animation layer (reveals, parallax, pins,
  // intro, cursor, smooth scroll) inside one self-cleaning gsap.context.
  useSiteAnimations();

  // Resolve the WebGL gate once on mount (reads window/CONFIG/WebGL support).
  const [renderScene] = React.useState(shouldRenderScene);

  // If the WebGL context is ever lost (GPU crash on a weak device), silently
  // drop the canvas so the always-present DOM gradient shows through. NO remount
  // loop — remounting the canvas was the black-flash. A clean, stable degrade.
  const [sceneCrashed, setSceneCrashed] = React.useState(false);
  const handleContextLost = React.useCallback(() => setSceneCrashed(true), []);

  return (
    <main className="relative min-h-screen text-pop-text-main font-sans selection:bg-pop-primary selection:text-white transition-colors duration-300 cursor-none">
      <Preloader />
      <CustomCursor />
      <ScrollProgressBar />
      <SectionHoverGlow />
      <ScrollRippleEffect />
      {/* Persistent cosmic WebGL world (replaces the old decorative layers).
          SceneFallback always paints a theme-aware backdrop; the canvas mounts
          on top only on capable, motion-OK desktops. */}
      <SceneFallback />
      {renderScene && !sceneCrashed && (
        <Suspense fallback={null}>
          <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: -50 }}
            aria-hidden="true"
          >
            <CosmicCanvas onContextLost={handleContextLost} />
          </div>
        </Suspense>
      )}
      {/* Cinematic flight-HUD: only over the live 3D voyage (DOM-only, no
          three.js import, so it stays out of the lazy scene bundle). */}
      {renderScene && !sceneCrashed && <VoyageHUD />}

      <GhostCursors />

      <Navigation />
      <Hero />
      <About />
      <ForgeStage />
      <Experience />
      <ProjectsShowcase />
      <Contact />

      <ReactionButton />
      <AIChatBot />
    </main>
  );
};

export default App;
