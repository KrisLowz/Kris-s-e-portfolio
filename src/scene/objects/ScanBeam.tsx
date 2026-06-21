import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress } from '../../animations/scroll';
import { voyage } from '../voyage';
import type { ThemeColors } from '../hooks/useThemeColors';

const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);
const UP = new THREE.Vector3(0, 1, 0);

/**
 * The probe's scan beam: a thin additive shaft fired from the craft at the
 * Origin World during the About act, plus an expanding scan ring that pulses
 * across the planet. Appears as the About section centres; both endpoints are
 * resolved live (probe position from voyage, planet from `target`).
 */
export default function ScanBeam({
  theme,
  target,
}: {
  theme: ThemeColors;
  target: [number, number, number];
}) {
  const beam = useRef<THREE.Mesh>(null);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const vis = useRef(0);
  const sections = getSectionProgress();

  const targetVec = useMemo(() => new THREE.Vector3(...target), [target]);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    vis.current += (centred(sections.about) - vis.current) * (1 - Math.exp(-3.5 * delta));
    const v = vis.current;

    const b = beam.current;
    if (b) {
      b.visible = v > 0.02;
      if (v > 0.02) {
        dir.copy(targetVec).sub(voyage.probe);
        const len = dir.length();
        mid.copy(voyage.probe).addScaledVector(dir, 0.5);
        b.position.copy(mid);
        dir.normalize();
        quat.setFromUnitVectors(UP, dir);
        b.quaternion.copy(quat);
        b.scale.set(1, len, 1);
        if (beamMat.current) {
          beamMat.current.opacity = v * (0.35 + 0.25 * Math.sin(state.clock.elapsedTime * 6));
          beamMat.current.color.copy(theme.meteor);
        }
      }
    }

    const r = ring.current;
    if (r) {
      r.visible = v > 0.02;
      if (v > 0.02) {
        const phase = (state.clock.elapsedTime * 0.55) % 1;
        const s = 0.2 + phase * 1.5;
        r.position.copy(targetVec);
        r.scale.setScalar(s);
        r.lookAt(voyage.probe);
        if (ringMat.current) {
          ringMat.current.opacity = v * (1 - phase) * 0.8;
          ringMat.current.color.copy(theme.meteor);
        }
      }
    }
  });

  return (
    <group>
      {/* beam shaft (unit cylinder along Y, scaled to length each frame) */}
      <mesh ref={beam}>
        <cylinderGeometry args={[0.025, 0.025, 1, 8, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* expanding scan ring on the planet */}
      <mesh ref={ring}>
        <ringGeometry args={[0.85, 1, 48]} />
        <meshBasicMaterial
          ref={ringMat}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
