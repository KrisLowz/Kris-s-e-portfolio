import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress } from '../../animations/scroll';
import { createIridescent } from '../materials/iridescent';
import type { ThemeColors } from '../hooks/useThemeColors';

/** Warm pole of the iridescent sheen (shared with the Skills crystals). */
const GOLD = new THREE.Color('#ffd56b');
const N = 34;
const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b);

interface Seed {
  dir: THREE.Vector3;
  dist: number;
  spin: THREE.Vector3;
  phase: number;
}

/** Deterministic scattered-fragment seeds on a fibonacci shell (no Math.random). */
function buildSeeds(): Seed[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const hash = (i: number, k: number) => {
    const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  return Array.from({ length: N }, (_, i) => {
    const y = N > 1 ? 1 - (i / (N - 1)) * 2 : 0;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return {
      dir: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize(),
      dist: 3 + hash(i, 1) * 2.5,
      spin: new THREE.Vector3((hash(i, 2) - 0.5) * 2, (hash(i, 3) - 0.5) * 2, (hash(i, 4) - 0.5) * 2),
      phase: hash(i, 5) * Math.PI * 2,
    };
  });
}

/**
 * The "Origin: Assembly" — iridescent crystal fragments (same material as the
 * Skills shards) that magnetise inward and lock onto the Origin core as the
 * About section centres, then disperse as it leaves. The scatter→converge motion
 * is a pure, reversible function of sections.about (the per-fragment spin/drift is
 * decorative); no pointer interaction; lives in the shared background canvas.
 */
export default function AboutAssembly({
  theme,
  position,
}: {
  theme: ThemeColors;
  position: [number, number, number];
}) {
  const seeds = useMemo(() => buildSeeds(), []);
  const sections = getSectionProgress();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(0);

  const mats = useMemo(
    () => seeds.map(() => createIridescent(theme.primary, theme.secondary, GOLD)),
    [seeds, theme]
  );
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.17, 0), []);

  // mats + geo are stable for the component's lifetime (theme is a stable,
  // in-place-lerped object), so this disposes them once, on unmount.
  useEffect(
    () => () => {
      mats.forEach((m) => m.dispose());
      geo.dispose();
    },
    [mats, geo]
  );

  useFrame((_, delta) => {
    time.current += delta;
    const p = sections.about;
    const assemble = smooth(p, 0.1, 0.6); // scattered (0) → converged (1)
    // Visibility is decoupled from assembly: fade in early, stay bright while the
    // fragments scatter + converge, then fade out before they pile into the core.
    const vis = smooth(p, 0.05, 0.2) * (1 - smooth(p, 0.5, 0.85));

    for (let i = 0; i < seeds.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const s = seeds[i];
      const drift = Math.sin(time.current * 0.5 + s.phase) * 0.15 * (1 - assemble);
      // Converge onto the core's SURFACE (~1.7, just outside the 1.5 planet) — not
      // its centre — so fragments lock onto / get absorbed by the core rather than
      // rendering buried inside the sphere.
      const radius = s.dist * (1 - assemble) + 1.7 + drift;
      m.position.set(s.dir.x * radius, s.dir.y * radius, s.dir.z * radius);
      m.rotation.x += s.spin.x * delta * 0.6;
      m.rotation.y += s.spin.y * delta * 0.6;
      m.visible = vis > 0.01;
      mats[i].uniforms.uOpacity.value = vis;
      m.scale.setScalar(0.6 + assemble * 0.4);
    }
  });

  return (
    <group position={position}>
      {seeds.map((_, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={mats[i]}
          visible={false}
          ref={(el) => {
            refs.current[i] = el;
          }}
        />
      ))}
    </group>
  );
}
