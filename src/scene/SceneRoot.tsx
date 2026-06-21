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
import Planet from './objects/Planet';
import ScanBeam from './objects/ScanBeam';
import WarpStreaks from './objects/WarpStreaks';
import SkillConstellationLines from './objects/SkillConstellationLines';
import ProjectWorldRings from './objects/ProjectWorldRings';
import CommsRelay from './objects/CommsRelay';
import { useThemeColors } from './hooks/useThemeColors';

/** The Origin World the probe scans during the About act. */
const ABOUT_PLANET: [number, number, number] = [4.6, 0.2, 8.6];
/** The comms relay the probe reaches at the Contact act, and its boresight tilt. */
const RELAY_POS: [number, number, number] = [2.0, -1.1, 10.5];
const RELAY_ROT: [number, number, number] = [-0.35, 0, 0.15];

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
      <CameraRig theme={theme} />
      <Nebula theme={theme} />
      <ParticleField theme={theme} />
      <OrbitRings theme={theme} />
      <SkillNodes theme={theme} />
      <SkillConstellationLines theme={theme} />
      <ExperiencePath theme={theme} />
      <ProjectMonoliths />
      <ProjectWorldRings theme={theme} />
      <Planet theme={theme} position={ABOUT_PLANET} />
      <ScanBeam theme={theme} target={ABOUT_PLANET} />
      <CommsRelay theme={theme} position={RELAY_POS} rotation={RELAY_ROT} />
      <CoreObject theme={theme} />
      <MeteorField theme={theme} />
      <WarpStreaks theme={theme} />
    </>
  );
}
