import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import vert from '../shaders/core.vert';
import frag from '../shaders/core.frag';
import { SCENE } from '../config';
import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * The central glowing energy core — a shader sphere with a fresnel HDR rim that
 * bloom picks up, gently pulsing/displacing over time. `toneMapped={false}` so
 * the >1 emissive colors survive into the bloom pass. Theme colors are passed
 * by reference, so the orb recolors live with the light/dark toggle.
 */
export default function CoreObject({ theme }: { theme: ThemeColors }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: theme.primary },
      uColorB: { value: theme.secondary },
      uIntensity: { value: SCENE.core.intensity },
      uDisplace: { value: SCENE.core.displace },
    }),
    [theme]
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh>
      <sphereGeometry args={[SCENE.core.radius, 96, 96]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
}
