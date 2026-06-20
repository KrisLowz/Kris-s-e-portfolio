/** Particle vertex shader: slow drift + per-point twinkle, size-attenuated. */
export default /* glsl */ `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute float aPhase;

varying float vTwinkle;

void main() {
  vec3 pos = position;

  // Very slow drift so the field feels alive without distracting.
  pos.x += sin(uTime * 0.05 + aPhase) * 0.25;
  pos.y += cos(uTime * 0.04 + aPhase) * 0.25;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  vTwinkle = 0.55 + 0.45 * sin(uTime * 1.5 + aPhase);
  gl_PointSize = clamp(uSize * aScale * (100.0 / -mv.z), 1.0, 26.0);
}
`;
