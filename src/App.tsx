import { useMotion } from './motion/useMotion';
import StoryBootPreloader from './components/story/StoryBootPreloader';
import StoryWorldLayer from './components/story/StoryWorldLayer';
import StoryHUD from './components/story/StoryHUD';
import SectionRouteProgress from './components/story/SectionRouteProgress';
import StoryCursor from './components/story/StoryCursor';
import HeroLaunch from './components/story/hero/HeroLaunch';
import OriginDossier from './components/story/about/OriginDossier';
import SkillField from './components/story/skills/SkillField';
import MissionArchive from './components/story/experience/MissionArchive';

export default function App() {
  useMotion();
  return (
    <main className="relative min-h-screen bg-pop-bg text-pop-text-main font-sans selection:bg-pop-primary/30">
      <StoryBootPreloader />
      <StoryWorldLayer />
      <StoryHUD />
      <SectionRouteProgress />
      <StoryCursor />
      {/* Sections added in Tasks 6–13 */}
      <HeroLaunch />
      <OriginDossier />
      <SkillField />
      <MissionArchive />
    </main>
  );
}
