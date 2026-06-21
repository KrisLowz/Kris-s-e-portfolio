import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import { buildProjectPanels } from '../sceneData';
import { getSectionProgress } from '../../animations/scroll';
import { onWorldFocus, onWorldBlur } from '../worldEvents';
import type { ThemeColors } from '../hooks/useThemeColors';

const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);

/**
 * Act 4 — "Project Worlds". As the probe reaches the project cluster, each world
 * gets a targeting lock-on ring plus an expanding "dive portal" pulse, inviting
 * you to dive in (the DOM cards remain the clickable surface). Fades in with the
 * Projects section; the world matching a hovered DOM card locks on brighter.
 */
export default function ProjectWorldRings({ theme }: { theme: ThemeColors }) {
  const panels = useMemo(() => buildProjectPanels(), []);
  const sections = getSectionProgress();
  const hovered = useRef<string | null>(null);
  const lockMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const vis = useRef(0);

  useEffect(() => {
    const offF = onWorldFocus((d) => {
      if (d.type === 'project') hovered.current = d.id;
    });
    const offB = onWorldBlur((d) => {
      if (d.type === 'project' && hovered.current === d.id) hovered.current = null;
    });
    return () => {
      offF();
      offB();
    };
  }, []);

  useFrame((state, delta) => {
    vis.current += (centred(sections.projects) - vis.current) * (1 - Math.exp(-3.5 * delta));
    const v = vis.current;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < panels.length; i++) {
      const isHot = hovered.current === panels[i].id;

      const lm = lockMats.current[i];
      if (lm) {
        lm.opacity = v * (isHot ? 0.95 : 0.55);
        lm.color.copy(isHot ? theme.meteor : theme.secondary);
      }

      // expanding dive-portal pulse (staggered per world)
      const phase = (t * 0.4 + i * 0.33) % 1;
      const pr = pulseRefs.current[i];
      if (pr) {
        const s = 0.55 + phase * 1.1;
        pr.scale.set(s, s, s);
      }
      const pm = pulseMats.current[i];
      if (pm) {
        pm.opacity = (1 - phase) * v * (isHot ? 0.85 : 0.48);
        pm.color.copy(theme.meteor);
      }
    }
  });

  return (
    <group>
      {panels.map((panel, i) => (
        <Billboard key={panel.id} position={panel.position}>
          {/* lock-on ring framing the world */}
          <mesh>
            <ringGeometry args={[1.02, 1.08, 56]} />
            <meshBasicMaterial
              ref={(el) => {
                lockMats.current[i] = el;
              }}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* expanding dive-portal pulse */}
          <mesh
            ref={(el) => {
              pulseRefs.current[i] = el;
            }}
          >
            <ringGeometry args={[0.92, 1.0, 56]} />
            <meshBasicMaterial
              ref={(el) => {
                pulseMats.current[i] = el;
              }}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}
