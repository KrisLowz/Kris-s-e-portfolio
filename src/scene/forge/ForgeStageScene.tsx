import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SKILLS } from '../../constants';
import { createIridescent } from '../materials/iridescent';

const GOLD = new THREE.Color('#ffd56b');

/** Read two theme colors from CSS once (the stage canvas is short-lived per view). */
function readThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  const get = (v: string, fb: string) => (cs.getPropertyValue(v).trim() || fb);
  return {
    primary: new THREE.Color(get('--accent-primary', '#00E5FF')),
    secondary: new THREE.Color(get('--accent-secondary', '#a855f7')),
  };
}

/** Lay the 17 shards on a loose, camera-facing ellipse cloud (deterministic). */
function layout(): THREE.Vector3[] {
  const n = SKILLS.length;
  return SKILLS.map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    const ring = i % 2 === 0 ? 1 : 1.7;
    return new THREE.Vector3(Math.cos(a) * 2.6 * ring, Math.sin(a) * 1.5 * ring, (i % 3 - 1) * 0.6);
  });
}

export default function ForgeStageScene({
  onFocus,
  focusedId,
}: {
  onFocus: (id: string | null) => void;
  focusedId: string | null;
}) {
  const positions = useMemo(() => layout(), []);
  const colors = useMemo(() => readThemeColors(), []);
  const mats = useMemo(
    () => SKILLS.map(() => createIridescent(colors.primary, colors.secondary, GOLD)),
    [colors]
  );
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.42, 0), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < positions.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      m.position.set(positions[i].x, positions[i].y + Math.sin(t * 0.5 + i) * 0.12, positions[i].z);
      m.rotation.x += 0.003;
      m.rotation.y += 0.004;
      const target = hovered === i ? 1.5 : 1.0;
      const next = m.scale.x + (target - m.scale.x) * (1 - Math.exp(-10 * delta));
      m.scale.setScalar(next);
    }
  });

  // Task 2 renders idle shards only; onFocus/focusedId are wired in Tasks 3–4.
  void onFocus; void focusedId;

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 6]} intensity={40} />
      {SKILLS.map((s, i) => (
        <mesh
          key={s.id}
          geometry={geo}
          material={mats[i]}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(i); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(null); document.body.style.cursor = ''; }}
        />
      ))}
      {hovered != null && (
        <Html position={positions[hovered]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded bg-[rgba(9,16,30,.85)] border border-[rgba(0,229,255,.5)] text-[11px] font-mono text-[#bfe9ff] whitespace-nowrap">
            {SKILLS[hovered].name}
          </div>
        </Html>
      )}
    </>
  );
}
