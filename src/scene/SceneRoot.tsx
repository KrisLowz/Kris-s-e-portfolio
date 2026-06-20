import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import CameraRig from './CameraRig';
import CoreObject from './objects/CoreObject';
import ParticleField from './objects/ParticleField';
import OrbitRings from './objects/OrbitRings';
import MeteorField from './objects/MeteorField';
import SkillNodes from './objects/SkillNodes';
import ExperiencePath from './objects/ExperiencePath';
import ProjectMonoliths from './objects/ProjectMonoliths';
import Nebula from './objects/Nebula';
import { useThemeColors } from './hooks/useThemeColors';

/**
 * The in-canvas scene graph. The background is an OPAQUE theme color (not a
 * transparent canvas) so additive blending composites correctly on every GPU;
 * the Nebula clouds restore colored depth. All glow is baked into the materials
 * (halos + additive), independent of the optional bloom pass.
 */
export default function SceneRoot() {
  const theme = useThemeColors();
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    scene.background = theme.bg;
    return () => {
      scene.background = null;
    };
  }, [scene, theme]);

  return (
    <>
      <CameraRig />
      <Nebula theme={theme} />
      <ParticleField theme={theme} />
      <OrbitRings theme={theme} />
      <SkillNodes theme={theme} />
      <ExperiencePath theme={theme} />
      <ProjectMonoliths />
      <CoreObject theme={theme} />
      <MeteorField theme={theme} />
    </>
  );
}
