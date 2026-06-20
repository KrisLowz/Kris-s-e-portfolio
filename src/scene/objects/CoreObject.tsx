import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import vert from '../shaders/core.vert';
import frag from '../shaders/core.frag';
import haloVert from '../shaders/halo.vert';
import haloFrag from '../shaders/halo.frag';
import { SCENE } from '../config';
import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * The central glowing core — a luminous LDR shader sphere wrapped in a soft
 * additive "halo" billboard that fakes the bloom aura. The glow no longer
 * depends on the postprocessing bloom pass, so it looks right on every GPU
 * (bloom, when available, just adds extra sheen).
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

  const haloUniforms = useMemo(
    () => ({
      uColor: { value: theme.primary },
      uFalloff: { value: SCENE.core.haloFalloff },
      uStrength: { value: SCENE.core.haloStrength },
    }),
    [theme]
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <group>
      <Billboard>
        <mesh scale={SCENE.core.haloScale}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            vertexShader={haloVert}
            fragmentShader={haloFrag}
            uniforms={haloUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </Billboard>

      <mesh>
        <sphereGeometry args={[SCENE.core.radius, 96, 96]} />
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} toneMapped={false} />
      </mesh>
    </group>
  );
}
