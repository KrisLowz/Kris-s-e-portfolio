import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE } from '../config';
import type { ThemeColors } from '../hooks/useThemeColors';

const UP = new THREE.Vector3(0, 1, 0);

/**
 * A single meteor: an elongated additive streak that flies across the view and
 * fades in/out over its life. It resets (reposition + new direction) while fully
 * transparent, so there's never a teleport artifact. Cheap — a few of these.
 */
function Meteor({ theme }: { theme: ThemeColors }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const st = useRef({
    pos: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    life: 0,
    max: 1.5,
    speed: 8,
  });

  const reset = () => {
    const s = st.current;
    s.pos.set((Math.random() - 0.5) * 26, 6 + Math.random() * 8, -6 + (Math.random() - 0.5) * 16);
    s.dir
      .set(-(0.6 + Math.random() * 0.5), -(0.8 + Math.random() * 0.4), (Math.random() - 0.5) * 0.3)
      .normalize();
    s.speed = 6 + Math.random() * 6;
    s.life = 0;
    s.max = 1.2 + Math.random() * 1.3;
  };

  useEffect(() => {
    reset();
    // Stagger initial lives so meteors don't all flash together.
    st.current.life = Math.random() * st.current.max;
  }, []);

  useFrame((_, delta) => {
    const s = st.current;
    s.life += delta;
    if (s.life > s.max) reset();
    s.pos.addScaledVector(s.dir, s.speed * delta);

    const m = ref.current;
    if (!m) return;
    m.position.copy(s.pos);
    m.quaternion.setFromUnitVectors(UP, s.dir);

    if (matRef.current) {
      matRef.current.opacity = Math.sin((s.life / s.max) * Math.PI); // 0 → 1 → 0
      matRef.current.color.copy(theme.meteor);
    }
  });

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.015, 0.001, 1.4, 6]} />
      <meshBasicMaterial
        ref={matRef}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/** A handful of meteors streaking through the field. */
export default function MeteorField({ theme }: { theme: ThemeColors }) {
  return (
    <>
      {Array.from({ length: SCENE.meteors.count }).map((_, i) => (
        <Meteor key={i} theme={theme} />
      ))}
    </>
  );
}
