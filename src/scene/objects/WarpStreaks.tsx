import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { voyage } from '../voyage';
import type { ThemeColors } from '../hooks/useThemeColors';

// NOTE: the streaks live in the scene graph (not parented to the camera, which
// R3F does not add to the scene → its children never render). Instead the group
// copies the camera's world transform each frame so it stays framed.

const COUNT = 32;
const Z_AHEAD = 6; // how far in front of the camera the streaks live

/**
 * Hyperspace warp streaks — thin additive lines radiating from the view centre,
 * parented to the camera so they always frame the travel direction. They stay
 * invisible while the probe is arriving (voyage.warp ≈ 0) and stretch/brighten
 * on the open legs between worlds. GPU-cheap: one shared additive material, no
 * postprocessing, no float buffer.
 */
export default function WarpStreaks({ theme }: { theme: ThemeColors }) {
  const camera = useThree((s) => s.camera);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const streaks = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const ang = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        return {
          ang,
          radius: 1.4 + Math.random() * 3.6,
          len: 0.7 + Math.random() * 1.8,
          width: 0.012 + Math.random() * 0.02,
        };
      }),
    []
  );

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const w = voyage.warp;
    const g = groupRef.current;
    if (!g) return;
    g.visible = w > 0.01;
    if (w <= 0.01) return;
    // Follow the camera's world transform so the streaks always radiate from the
    // view centre and point down the travel axis.
    g.position.copy(camera.position);
    g.quaternion.copy(camera.quaternion);
    material.opacity = w * 0.9;
    material.color.copy(theme.meteor);
    for (let i = 0; i < streaks.length; i++) {
      const m = meshRefs.current[i];
      if (m) m.scale.y = 0.25 + w * 4;
    }
  });

  return (
    <group ref={groupRef}>
      {streaks.map((s, i) => (
        <mesh
          key={i}
          material={material}
          position={[Math.cos(s.ang) * s.radius, Math.sin(s.ang) * s.radius, -Z_AHEAD]}
          rotation={[0, 0, s.ang - Math.PI / 2]}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <planeGeometry args={[s.width, s.len]} />
        </mesh>
      ))}
    </group>
  );
}
