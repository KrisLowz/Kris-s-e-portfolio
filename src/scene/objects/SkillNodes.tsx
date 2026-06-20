import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildSkillNodes } from '../sceneData';
import { getSectionProgress } from '../../animations/scroll';
import { onWorldFocus, onWorldBlur } from '../worldEvents';
import type { ThemeColors } from '../hooks/useThemeColors';

/** Triangular falloff: 1 when the section is centred (progress 0.5), 0 at edges. */
const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);

/**
 * A constellation of skill "stars" around the core. They fade in only while the
 * About/Skills sections are in view, and the star matching the currently-hovered
 * DOM skill chip flares (scales up + turns white-hot so bloom catches it).
 *
 * Driven entirely by the worldEvents bus + scroll refs — no React state, no
 * re-renders. The DOM→3D direction is the meaningful one here (the canvas is
 * pointer-events:none and sits behind content).
 */
export default function SkillNodes({ theme }: { theme: ThemeColors }) {
  const nodes = useMemo(() => buildSkillNodes(5), []);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hovered = useRef<string | null>(null);
  const vis = useRef(0);
  const hot = useMemo(() => new THREE.Color('#ffffff'), []);
  const sections = getSectionProgress();

  useEffect(() => {
    const offFocus = onWorldFocus((d) => {
      if (d.type === 'skill') hovered.current = d.id;
    });
    const offBlur = onWorldBlur((d) => {
      if (d.type === 'skill' && hovered.current === d.id) hovered.current = null;
    });
    return () => {
      offFocus();
      offBlur();
    };
  }, []);

  useFrame((_, delta) => {
    const targetVis = Math.max(centred(sections.about), centred(sections.skills));
    vis.current += (targetVis - vis.current) * (1 - Math.exp(-4 * delta));

    const kScale = 1 - Math.exp(-12 * delta);
    const kColor = 1 - Math.exp(-12 * delta);

    for (let i = 0; i < nodes.length; i++) {
      const m = meshRefs.current[i];
      if (!m) continue;
      const isHot = hovered.current === nodes[i].id;

      const targetScale = (isHot ? 2.8 : 1) * (0.35 + vis.current);
      const s = m.scale.x + (targetScale - m.scale.x) * kScale;
      m.scale.setScalar(s);

      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = vis.current * (isHot ? 1 : 0.6);
      mat.color.lerp(isHot ? hot : theme.primary, kColor);
    }
  });

  return (
    <group>
      {nodes.map((node, i) => (
        <mesh
          key={node.id}
          position={node.position}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.06, 12, 12]} />
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
