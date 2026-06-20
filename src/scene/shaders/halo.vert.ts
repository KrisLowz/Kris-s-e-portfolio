/** Plain pass-through for a billboarded glow quad (oriented by drei <Billboard>). */
export default /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
