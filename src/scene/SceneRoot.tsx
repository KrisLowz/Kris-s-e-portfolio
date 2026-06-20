import CameraRig from './CameraRig';
import CoreObject from './objects/CoreObject';
import ParticleField from './objects/ParticleField';
import OrbitRings from './objects/OrbitRings';
import MeteorField from './objects/MeteorField';
import { useThemeColors } from './hooks/useThemeColors';

/**
 * The in-canvas scene graph. Pulls the live theme colors once and passes them
 * (by reference) to every object, then composes the persistent cosmic world:
 * camera flight + star field + orbit rings + glowing core + meteors.
 *
 * The canvas is left transparent (no scene.background) so the theme-aware DOM
 * nebula gradient (SceneFallback / `.scene-fallback`) shows through behind the
 * 3D, giving colored depth instead of flat black.
 */
export default function SceneRoot() {
  const theme = useThemeColors();
  return (
    <>
      <CameraRig />
      <ParticleField theme={theme} />
      <OrbitRings theme={theme} />
      <CoreObject theme={theme} />
      <MeteorField theme={theme} />
    </>
  );
}
