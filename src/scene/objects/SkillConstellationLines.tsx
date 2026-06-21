import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildSkillNodes } from '../sceneData';
import { getSectionProgress } from '../../animations/scroll';
import type { ThemeColors } from '../hooks/useThemeColors';

const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);

/**
 * Act 2 — "Skill Nebula". As the probe charts the nebula, faint additive links
 * are drawn between each skill star and its nearest neighbours, lighting up the
 * constellation. The whole web fades in with the Skills section and shimmers;
 * it sits behind the SkillNodes stars (which still flare on DOM hover).
 */
export default function SkillConstellationLines({ theme }: { theme: ThemeColors }) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const vis = useRef(0);
  const sections = getSectionProgress();

  // Build the edge geometry once: connect each node to its 2 nearest neighbours.
  const geometry = useMemo(() => {
    const nodes = buildSkillNodes(5);
    const edges = new Set<string>();
    const verts: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes
        .map((n, j) => ({ j, d: nodes[i].position.distanceTo(n.position) }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const { j } of dists) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (edges.has(key)) continue;
        edges.add(key);
        verts.push(
          nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
          nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
        );
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, []);

  // The geometry is created imperatively (passed as a prop, so R3F won't
  // auto-dispose it) — clean it up explicitly.
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    vis.current += (centred(sections.skills) - vis.current) * (1 - Math.exp(-3.5 * delta));
    if (matRef.current) {
      const shimmer = 0.75 + 0.25 * Math.sin(state.clock.elapsedTime * 1.5);
      matRef.current.opacity = vis.current * 0.6 * shimmer;
      matRef.current.color.copy(theme.primary);
    }
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}
