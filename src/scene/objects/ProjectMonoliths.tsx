import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, useTexture } from '@react-three/drei';
import { buildProjectPanels } from '../sceneData';
import { getSectionProgress } from '../../animations/scroll';
import { onWorldFocus, onWorldBlur } from '../worldEvents';

const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);

/**
 * Floating "monoliths" — the project images as billboarded panels drifting in
 * the cosmos behind the Projects section's glass cards. Ambient depth, not the
 * primary UI: they fade in with the section, gently bob, and the panel matching
 * a hovered DOM project card brightens + lifts. Clicks stay on the DOM cards.
 */
export default function ProjectMonoliths() {
  const panels = useMemo(() => buildProjectPanels(), []);
  const textures = useTexture(panels.map((p) => p.image));
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const hovered = useRef<string | null>(null);
  const vis = useRef(0);
  const sections = getSectionProgress();

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
  }, [textures]);

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
    vis.current += (centred(sections.projects) - vis.current) * (1 - Math.exp(-4 * delta));
    const k = 1 - Math.exp(-10 * delta);
    const t = state.clock.elapsedTime;

    for (let i = 0; i < panels.length; i++) {
      const isHot = hovered.current === panels[i].id;
      const g = groupRefs.current[i];
      if (g) {
        g.position.y = panels[i].position.y + Math.sin(t * 0.6 + i) * 0.12;
        const ts = isHot ? 1.3 : 1;
        g.scale.setScalar(g.scale.x + (ts - g.scale.x) * k);
      }
      const mat = matRefs.current[i];
      if (mat) mat.opacity = vis.current * (isHot ? 0.95 : 0.32);
    }
  });

  return (
    <group>
      {panels.map((panel, i) => (
        <Billboard
          key={panel.id}
          position={panel.position}
          ref={(el) => {
            groupRefs.current[i] = el as unknown as THREE.Group;
          }}
        >
          <mesh>
            <planeGeometry args={[1.7, 1.1]} />
            <meshBasicMaterial
              ref={(el) => {
                matRefs.current[i] = el;
              }}
              map={textures[i]}
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}
