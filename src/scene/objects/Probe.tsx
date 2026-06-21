import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import haloVert from '../shaders/halo.vert';
import haloFrag from '../shaders/halo.frag';
import { voyage } from '../voyage';
import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * The voyage's probe — a small glowing craft built from primitives (no model
 * assets). The outer (ref'd) group is transform-only: the rig sets its position
 * and orients it with lookAt so the craft's local -Z points along the path
 * tangent (the travel direction). An inner group scales the visuals.
 *
 * The thruster cone + engine glow stretch and brighten with voyage.warp, so the
 * craft visibly "fires up" on the open legs and settles as it arrives.
 */
const PROBE_SCALE = 1.5;

const Probe = forwardRef<THREE.Group, { theme: ThemeColors }>(({ theme }, ref) => {
  const thruster = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const w = voyage.warp;
    const flicker = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 30);
    if (thruster.current) {
      thruster.current.scale.set(1, (1 + w * 4) * flicker, 1);
      thruster.current.position.z = 0.42 + w * 0.9;
    }
    if (glow.current) {
      const s = (1.05 + w * 1.4) * flicker;
      glow.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={ref}>
      <group scale={PROBE_SCALE}>
        {/* point light so the probe illuminates whatever it passes */}
        <pointLight intensity={22} distance={9} decay={2} color={theme.primary} />

        {/* nose cone (apex points -Z, the travel direction) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.14]}>
          <coneGeometry args={[0.16, 0.5, 18]} />
          <meshStandardMaterial
            color="#eef1ff"
            emissive={theme.primary}
            emissiveIntensity={1.5}
            metalness={0.6}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>

        {/* body ring */}
        <mesh>
          <torusGeometry args={[0.16, 0.05, 14, 28]} />
          <meshStandardMaterial
            color="#aab4e0"
            emissive={theme.secondary}
            emissiveIntensity={0.9}
            metalness={0.7}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>

        {/* thruster cone — emissive flame tapering to the tail (+Z) */}
        <mesh ref={thruster} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.42]}>
          <coneGeometry args={[0.12, 0.7, 16, 1, true]} />
          <meshBasicMaterial
            color={theme.meteor}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* engine glow billboard behind the craft */}
        <Billboard position={[0, 0, 0.38]}>
          <mesh ref={glow} scale={1.05}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
              vertexShader={haloVert}
              fragmentShader={haloFrag}
              uniforms={{
                uColor: { value: theme.meteor },
                uFalloff: { value: 2 },
                uStrength: { value: 1.2 },
              }}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
});

Probe.displayName = 'Probe';
export default Probe;
