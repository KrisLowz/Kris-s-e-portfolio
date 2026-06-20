import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Billboards from './Billboards';
import { SCENE } from '../config';
import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * Orbiting particle rings — the same GPU-safe instanced billboards, baked with
 * their tilts into one cloud inside a slowly-rotating group.
 */
export default function OrbitRings({ theme }: { theme: ThemeColors }) {
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    const pts: number[] = [];
    const scl: number[] = [];
    const phs: number[] = [];
    const tilt = new THREE.Matrix4();
    const v = new THREE.Vector3();
    SCENE.rings.forEach((ring) => {
      tilt.makeRotationX(ring.tilt);
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2;
        const r = ring.radius + (Math.random() - 0.5) * ring.thickness;
        v.set(Math.cos(a) * r, (Math.random() - 0.5) * ring.thickness, Math.sin(a) * r).applyMatrix4(tilt);
        pts.push(v.x, v.y, v.z);
        scl.push(0.6 + Math.random() * 0.8);
        phs.push(Math.random() * Math.PI * 2);
      }
    });
    return {
      offsets: new Float32Array(pts),
      scales: new Float32Array(scl),
      phases: new Float32Array(phs),
      count: scl.length,
    };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={groupRef}>
      <Billboards
        offsets={data.offsets}
        scales={data.scales}
        phases={data.phases}
        count={data.count}
        size={SCENE.ringSize}
        color={theme.secondary}
      />
    </group>
  );
}
