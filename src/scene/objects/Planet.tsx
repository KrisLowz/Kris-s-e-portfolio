import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress } from '../../animations/scroll';
import type { ThemeColors } from '../hooks/useThemeColors';

const centred = (p: number) => Math.max(0, 1 - Math.abs(p - 0.5) * 2);

/** Fresnel atmosphere — additive rim glow so the world reads even unlit. */
const ATMO_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vView;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uPower;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vView;
void main() {
  float rim = pow(1.0 - max(dot(vN, vView), 0.0), uPower);
  gl_FragColor = vec4(uColor, rim * uOpacity);
}
`;

/**
 * The "Origin World" the probe arrives at during the About act. A standard-
 * material sphere lit ONLY by the probe's point light (so it shows a dramatic
 * day/night terminator as the craft approaches) wrapped in an additive fresnel
 * atmosphere. Fades + spins in as the About section centres.
 */
export default function Planet({
  theme,
  position,
}: {
  theme: ThemeColors;
  position: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);
  const surfaceMat = useRef<THREE.MeshStandardMaterial>(null);
  const vis = useRef(0);
  const sections = getSectionProgress();

  const atmoUniforms = useMemo(
    () => ({
      uColor: { value: theme.primary },
      uPower: { value: 2.2 },
      uOpacity: { value: 0 },
    }),
    [theme]
  );

  useFrame((_, delta) => {
    vis.current += (centred(sections.about) - vis.current) * (1 - Math.exp(-3.5 * delta));
    const v = vis.current;
    const g = group.current;
    if (g) {
      const s = 0.86 + v * 0.14;
      g.scale.setScalar(s);
      g.visible = v > 0.01;
      g.rotation.y += delta * 0.06;
    }
    // Ignite: the core flares brighter as the About fragments converge (~0.5).
    const ignite = THREE.MathUtils.smoothstep(sections.about, 0.35, 0.52);
    if (surfaceMat.current) {
      surfaceMat.current.opacity = v;
      surfaceMat.current.emissiveIntensity = 0.35 + ignite * 0.9;
    }
    atmoUniforms.uOpacity.value = v * (1 + ignite * 0.6);
  });

  return (
    <group ref={group} position={position}>
      {/* surface — self-lit emissive base, further shaped by the probe's light */}
      <mesh ref={surface}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          ref={surfaceMat}
          color="#243056"
          emissive={theme.primary}
          emissiveIntensity={0.35}
          roughness={0.8}
          metalness={0.15}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* atmosphere — additive fresnel rim */}
      <mesh scale={1.14}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={atmoUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
