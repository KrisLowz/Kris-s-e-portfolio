import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Matter from 'matter-js';
import { SKILLS } from '../../constants';
import { createIridescent } from '../materials/iridescent';
import { useThemeColors } from '../hooks/useThemeColors';
import { viewBounds, screenToWorld } from './forgeView';
import { createForgeWorld, stepForge, grabAt, dragTo, release, PHYS_SCALE } from './forgePhysics';

const GOLD = new THREE.Color('#ffd56b');

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
  const { size, gl } = useThree();
  const positions = useMemo(() => layout(), []);
  const theme = useThemeColors();
  const mats = useMemo(
    () => SKILLS.map(() => createIridescent(theme.primary, theme.secondary, GOLD)),
    [theme]
  );
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.42, 0), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  const bounds = useMemo(
    () => viewBounds(8, 50, size.width / size.height),
    [size.width, size.height]
  );

  const world = useMemo(
    () => createForgeWorld(positions.map((p) => ({ x: p.x, y: p.y })), bounds, 0.42),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positions, bounds]
  );

  // Seed a gentle initial drift once when the world is created
  useEffect(() => {
    world.bodies.forEach((b, i) => {
      Matter.Body.setVelocity(b, { x: Math.sin(i) * 8, y: Math.cos(i * 1.7) * 8 });
    });
  }, [world]);

  // Drag state ref
  const drag = useRef<{ idx: number; startX: number; startY: number; moved: boolean } | null>(null);

  // GPU resources live for the component's lifetime — dispose ONLY on unmount.
  useEffect(
    () => () => {
      mats.forEach((m) => m.dispose());
      geo.dispose();
    },
    [mats, geo]
  );

  // Matter world: tear down the PREVIOUS world when it's replaced (resize) and on unmount.
  useEffect(
    () => () => {
      Matter.World.clear(world.engine.world, false);
      Matter.Engine.clear(world.engine);
      drag.current = null; // a world swap invalidates any in-flight grab index
    },
    [world]
  );

  // Helper: convert pointer client coords to world coords
  const toWorld = (clientX: number, clientY: number) => {
    const r = gl.domElement.getBoundingClientRect();
    return screenToWorld(clientX - r.left, clientY - r.top, r.width, r.height, bounds);
  };

  // DOM-level pointer move/up listeners so they fire even when the pointer leaves a crystal mid-throw
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
      const w = toWorld(e.clientX, e.clientY);
      dragTo(world, d.idx, w.x, w.y);
    };
    const onUp = () => {
      const d = drag.current;
      if (!d) return;
      release(world, d.idx);
      if (!d.moved) {
        // tiny movement = click = inspect
        onFocus(focusedId === SKILLS[d.idx].id ? null : SKILLS[d.idx].id);
      }
      drag.current = null;
    };
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl, world, bounds, onFocus, focusedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_state, delta) => {
    stepForge(world, delta * 1000);
    for (let i = 0; i < positions.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      // Read position from physics
      m.position.x = world.bodies[i].position.x / PHYS_SCALE;
      m.position.y = world.bodies[i].position.y / PHYS_SCALE;
      m.position.z = positions[i].z;
      // Rotation from physics angle
      m.rotation.z = world.bodies[i].angle;
      // Scale bloom damping (focused 1.7 / hovered 1.5 / idle 1.0)
      const isFocused = SKILLS[i].id === focusedId;
      const target = isFocused ? 1.7 : hovered === i ? 1.5 : 1.0;
      const next = m.scale.x + (target - m.scale.x) * (1 - Math.exp(-10 * delta));
      m.scale.setScalar(next);
    }
  });

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
          onPointerDown={(e) => {
            e.stopPropagation();
            const w = toWorld(e.clientX, e.clientY);
            const idx = grabAt(world, w.x, w.y);
            if (idx != null) {
              drag.current = { idx, startX: e.clientX, startY: e.clientY, moved: false };
            }
          }}
        />
      ))}
      {hovered != null && (
        <Html
          position={[
            world.bodies[hovered].position.x / PHYS_SCALE,
            world.bodies[hovered].position.y / PHYS_SCALE,
            positions[hovered].z,
          ]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="px-2 py-1 rounded bg-[rgba(9,16,30,.85)] border border-[rgba(0,229,255,.5)] text-[11px] font-mono text-[#bfe9ff] whitespace-nowrap">
            {SKILLS[hovered].name}
          </div>
        </Html>
      )}
    </>
  );
}
