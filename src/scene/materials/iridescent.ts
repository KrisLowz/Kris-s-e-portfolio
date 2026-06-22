import * as THREE from 'three';

/** View-dependent prismatic sheen: base color shifts across A→B by facing, with
 *  a C-colored fresnel rim. Self-lit so it reads without scene lights (matches
 *  the additive/emissive idiom used across the scene). */
const VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vView;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const FRAG = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vView;
void main() {
  float fres = pow(1.0 - max(dot(vN, vView), 0.0), 1.6);
  float facing = clamp(dot(vN, normalize(vec3(0.3, 0.6, 0.5))) * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = mix(uA, uB, facing);
  vec3 col = mix(base, uC, fres);
  col += fres * 0.6; // rim brighten
  gl_FragColor = vec4(col, uOpacity);
}
`;

export function createIridescent(
  a: THREE.Color,
  b: THREE.Color,
  c: THREE.Color
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uA: { value: a },
      uB: { value: b },
      uC: { value: c },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: true,
    toneMapped: false,
  });
}
