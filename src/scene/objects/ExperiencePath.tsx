import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { buildExperienceNodes } from '../sceneData';
import { getSectionProgress } from '../../animations/scroll';
import { onWorldFocus, onWorldBlur } from '../worldEvents';
import type { ThemeColors } from '../hooks/useThemeColors';

const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);

/**
 * The career "timeline flight": one glowing waypoint per EXPERIENCE role,
 * connected by a faint line when there's more than one. Fades in with the
 * Experience section; the node matching a hovered DOM experience card flares.
 */
export default function ExperiencePath({ theme }: { theme: ThemeColors }) {
  const nodes = useMemo(() => buildExperienceNodes(), []);
  const linePoints = useMemo(() => nodes.map((n) => n.position), [nodes]);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lineRef = useRef<{ material: THREE.Material & { opacity: number } } | null>(null);
  const hovered = useRef<string | null>(null);
  const vis = useRef(0);
  const hot = useMemo(() => new THREE.Color('#ffffff'), []);
  const sections = getSectionProgress();

  useEffect(() => {
    const offF = onWorldFocus((d) => {
      if (d.type === 'experience') hovered.current = d.id;
    });
    const offB = onWorldBlur((d) => {
      if (d.type === 'experience' && hovered.current === d.id) hovered.current = null;
    });
    return () => {
      offF();
      offB();
    };
  }, []);

  useFrame((_, delta) => {
    vis.current += (centred(sections.experience) - vis.current) * (1 - Math.exp(-4 * delta));
    const k = 1 - Math.exp(-12 * delta);

    for (let i = 0; i < nodes.length; i++) {
      const m = meshRefs.current[i];
      if (!m) continue;
      const isHot = hovered.current === nodes[i].id;
      const ts = (isHot ? 2.4 : 1) * (0.5 + vis.current);
      m.scale.setScalar(m.scale.x + (ts - m.scale.x) * k);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = vis.current * (isHot ? 1 : 0.85);
      mat.color.lerp(isHot ? hot : theme.secondary, k);
    }

    if (lineRef.current) lineRef.current.material.opacity = vis.current * 0.35;
  });

  return (
    <group>
      {linePoints.length > 1 && (
        <Line
          ref={lineRef as never}
          points={linePoints}
          color="#94a3b8"
          transparent
          opacity={0}
          lineWidth={1}
        />
      )}
      {nodes.map((node, i) => (
        <mesh
          key={node.id}
          position={node.position}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
