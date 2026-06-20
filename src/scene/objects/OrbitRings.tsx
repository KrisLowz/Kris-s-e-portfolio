import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE } from '../config';
import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * Particle rings orbiting the core. All rings are baked (with their tilts) into
 * one points cloud / one draw call; the parent group rotates slowly. The
 * material color is copied from the theme each frame so it tracks light/dark.
 */
export default function OrbitRings({ theme }: { theme: ThemeColors }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const pts: number[] = [];
    const tiltMatrix = new THREE.Matrix4();
    const v = new THREE.Vector3();
    SCENE.rings.forEach((ring) => {
      tiltMatrix.makeRotationX(ring.tilt);
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2;
        const r = ring.radius + (Math.random() - 0.5) * ring.thickness;
        v.set(Math.cos(a) * r, (Math.random() - 0.5) * ring.thickness, Math.sin(a) * r);
        v.applyMatrix4(tiltMatrix);
        pts.push(v.x, v.y, v.z);
      }
    });
    return new Float32Array(pts);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
    if (matRef.current) matRef.current.color.copy(theme.secondary);
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={matRef}
          size={SCENE.ringSize}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
