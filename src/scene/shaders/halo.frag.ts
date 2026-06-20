/**
 * Radial-gradient glow disc — a soft, GPU-safe "fake bloom" aura. Additive, so
 * it lights up the scene without any postprocessing. Used for the core's halo
 * and the faint nebula clouds.
 */
export default /* glsl */ `
uniform vec3 uColor;
uniform float uFalloff;
uniform float uStrength;

varying vec2 vUv;

void main() {
  float d = length(vUv - 0.5) * 2.0;
  float glow = pow(clamp(1.0 - d, 0.0, 1.0), uFalloff) * uStrength;
  gl_FragColor = vec4(uColor, glow);
}
`;
