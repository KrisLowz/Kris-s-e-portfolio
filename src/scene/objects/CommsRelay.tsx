import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress } from '../../animations/scroll';
import { onTransmit } from '../worldEvents';
import type { ThemeColors } from '../hooks/useThemeColors';

// Contact is the LAST section, so it never sits centred at the page bottom.
// Instead the relay RISES into view as the section enters and HOLDS while you're
// there (progress ~0.12 → 0.45 ramps in, then stays lit).
const arrival = (p: number) => Math.min(1, Math.max(0, (p - 0.12) / 0.33));
const RING_COUNT = 4;

/**
 * Act 5 — "The Beacon". A comms-relay dish (built from primitives) that the
 * probe reaches at the Contact section. It continuously TRANSMITS: additive
 * signal rings ripple up its boresight into the cosmos. Hitting "Transmit" on
 * the contact form fires a brighter burst (via the voyage:transmit event).
 * Boresight is local +Y; tilt the whole rig with the `rotation` prop.
 */
export default function CommsRelay({
  theme,
  position,
  rotation = [0, 0, 0],
}: {
  theme: ThemeColors;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const dishMat = useRef<THREE.MeshStandardMaterial>(null);
  const vis = useRef(0);
  const burst = useRef(0);
  const sections = getSectionProgress();

  useEffect(() => onTransmit(() => { burst.current = 1; }), []);

  useFrame((state, delta) => {
    vis.current += (arrival(sections.contact) - vis.current) * (1 - Math.exp(-3.5 * delta));
    burst.current = Math.max(0, burst.current - delta * 0.5);
    const v = vis.current;
    const intensity = v * (0.6 + burst.current * 1.8);

    const g = group.current;
    if (g) {
      g.visible = v > 0.01;
      const s = 0.85 + v * 0.15;
      g.scale.setScalar(s);
    }
    if (dishMat.current) dishMat.current.emissiveIntensity = 0.3 + burst.current * 0.9;

    const t = state.clock.elapsedTime;
    const speed = 0.32 + burst.current * 0.55;
    for (let i = 0; i < RING_COUNT; i++) {
      const m = ringRefs.current[i];
      if (!m) continue;
      const phase = (t * speed + i / RING_COUNT) % 1;
      m.position.y = 0.5 + phase * 2.8;
      const s = 0.3 + phase * 2.3;
      m.scale.set(s, s, s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - phase) * intensity * 0.85;
      mat.color.copy(theme.meteor);
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* mast */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.95, 8]} />
        <meshStandardMaterial color="#8893b8" metalness={0.7} roughness={0.4} toneMapped={false} />
      </mesh>

      {/* dish — a bowl opening up the boresight (+Y) */}
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.82, 40, 20, 0, Math.PI * 2, Math.PI * 0.68, Math.PI * 0.32]} />
        <meshStandardMaterial
          ref={dishMat}
          color="#cdd6f4"
          emissive={theme.primary}
          emissiveIntensity={0.3}
          metalness={0.55}
          roughness={0.35}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* feed horn at the focus, pointing into the dish */}
      <mesh position={[0, 0.62, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.07, 0.2, 12]} />
        <meshStandardMaterial
          color="#eef1ff"
          emissive={theme.secondary}
          emissiveIntensity={0.7}
          metalness={0.4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* transmit rings — ripple up the boresight, recycled by phase */}
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
        >
          <ringGeometry args={[0.42, 0.5, 44]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
