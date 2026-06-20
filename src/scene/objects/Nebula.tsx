import { useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import haloVert from '../shaders/halo.vert';
import haloFrag from '../shaders/halo.frag';
import type { ThemeColors } from '../hooks/useThemeColors';

const CLOUDS = [
  { pos: [-9, 5, -14] as [number, number, number], scale: 22, ci: 0, strength: 0.16 },
  { pos: [11, -6, -16] as [number, number, number], scale: 26, ci: 1, strength: 0.14 },
  { pos: [2, 8, -18] as [number, number, number], scale: 20, ci: 2, strength: 0.12 },
];

/**
 * Faint additive nebula clouds far behind the scene — colored depth on the
 * opaque background (which replaced the transparent canvas + DOM gradient, to
 * make additive blending render correctly on all GPUs).
 */
export default function Nebula({ theme }: { theme: ThemeColors }) {
  const uniforms = useMemo(
    () =>
      CLOUDS.map((c) => ({
        uColor: { value: theme.nebula[c.ci] },
        uFalloff: { value: 1.6 },
        uStrength: { value: c.strength },
      })),
    [theme]
  );

  return (
    <>
      {CLOUDS.map((c, i) => (
        <Billboard key={i} position={c.pos}>
          <mesh scale={c.scale}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
              vertexShader={haloVert}
              fragmentShader={haloFrag}
              uniforms={uniforms[i]}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      ))}
    </>
  );
}
