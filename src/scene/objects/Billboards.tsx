import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vert from '../shaders/particles.vert';
import frag from '../shaders/particles.frag';

interface Props {
  offsets: Float32Array;
  scales: Float32Array;
  phases: Float32Array;
  count: number;
  size: number;
  color: THREE.Color;
  /** Horizontal drift amplitude (0 for rigid clusters like rings). */
  drift?: number;
}

const QUAD_POS = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]);
const QUAD_UV = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
const QUAD_IDX = new Uint16Array([0, 1, 2, 0, 2, 3]);

/**
 * GPU-safe additive particle cloud: an InstancedBufferGeometry of camera-facing
 * billboard quads (one per particle). Replaces THREE.Points/gl.POINTS, which
 * render as squares on some Intel drivers. One draw call; all motion in the
 * vertex shader. Reused for the star field and the orbit rings.
 */
export default function Billboards({ offsets, scales, phases, count, size, color, drift = 0 }: Props) {
  const geometry = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(QUAD_IDX, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(QUAD_POS, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(QUAD_UV, 2));
    geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
    geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    geo.instanceCount = count;
    return geo;
  }, [offsets, scales, phases, count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uColor: { value: color },
      uDrift: { value: drift },
    }),
    [size, color, drift]
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
