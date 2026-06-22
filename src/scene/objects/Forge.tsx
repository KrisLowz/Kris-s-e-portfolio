import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress } from '../../animations/scroll';
import { buildShardSeeds, computeForge } from '../forge/forgeLayout';
import { createIridescent } from '../materials/iridescent';
import type { ThemeColors } from '../hooks/useThemeColors';

/** Warm pole of the iridescent sheen (awards/gold accent — a fixed accent, not a theme token). */
const GOLD = new THREE.Color('#ffd56b');
/** Carry-forward target, relative to the forge origin: up and toward the Experience beacon. */
const BEACON = new THREE.Vector3(-2.0, 1.6, -2.0);

/** Additive "charge" shell — the planet glows hotter as it nears detonation. */
const CHARGE_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vView;
void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vN=normalize(mat3(modelMatrix)*normal);
  vView=normalize(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }
`;
const CHARGE_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vView;
void main(){ float rim=pow(1.0-max(dot(vN,vView),0.0),2.0); gl_FragColor=vec4(uColor, rim*uOpacity); }
`;

/**
 * The Skills "Forge": an iridescent planet that charges and detonates into 17
 * drifting crystal shards as the #skills section scrolls through view. Pure
 * scroll-driven (computeForge), no React state, no pointer interaction — the
 * canvas is pointer-events:none in Phase 1.
 */
export default function Forge({
  theme,
  position,
}: {
  theme: ThemeColors;
  position: [number, number, number];
}) {
  const seeds = useMemo(() => buildShardSeeds(), []);
  const sections = getSectionProgress();
  const time = useRef(0);

  const planetGroup = useRef<THREE.Group>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);

  const planetMat = useMemo(() => createIridescent(theme.primary, theme.secondary, GOLD), [theme]);
  const shardMats = useMemo(
    () => seeds.map(() => createIridescent(theme.primary, theme.secondary, GOLD)),
    [seeds, theme]
  );
  const shardGeo = useMemo(() => new THREE.IcosahedronGeometry(0.18, 0), []);
  const chargeUniforms = useMemo(
    () => ({ uColor: { value: theme.primary }, uOpacity: { value: 0 } }),
    [theme]
  );

  useEffect(() => {
    return () => {
      planetMat.dispose();
      shardMats.forEach((m) => m.dispose());
      shardGeo.dispose();
    };
  }, [planetMat, shardMats, shardGeo]);

  useFrame((_, delta) => {
    time.current += delta;
    const st = computeForge(sections.skills, seeds, time.current, BEACON);

    const pg = planetGroup.current;
    if (pg) {
      pg.visible = st.planetOpacity > 0.01;
      pg.scale.setScalar(st.planetScale);
      pg.rotation.y += delta * 0.1;
    }
    planetMat.uniforms.uOpacity.value = st.planetOpacity;
    chargeUniforms.uOpacity.value = st.planetCharge * st.planetOpacity;

    for (let i = 0; i < seeds.length; i++) {
      const m = shardRefs.current[i];
      const tr = st.shards[i];
      if (!m) continue;
      m.visible = tr.opacity > 0.01;
      m.position.copy(tr.pos);
      m.rotation.copy(tr.rot);
      m.scale.setScalar(tr.scale);
      shardMats[i].uniforms.uOpacity.value = tr.opacity;
    }
  });

  return (
    <group position={position}>
      <group ref={planetGroup}>
        <mesh material={planetMat}>
          <sphereGeometry args={[0.9, 48, 48]} />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <shaderMaterial
            vertexShader={CHARGE_VERT}
            fragmentShader={CHARGE_FRAG}
            uniforms={chargeUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {seeds.map((s, i) => (
        <mesh
          key={s.id}
          geometry={shardGeo}
          material={shardMats[i]}
          visible={false}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
        />
      ))}
    </group>
  );
}
