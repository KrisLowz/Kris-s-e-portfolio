/**
 * Instanced billboard vertex shader. Each particle is a camera-facing quad
 * (NOT a gl.POINTS sprite — those render as squares on some Intel drivers).
 * `position`/`uv` come from a unit plane; `aOffset`/`aScale`/`aPhase` are
 * per-instance. The quad is built in world space facing the camera, so it works
 * identically on every GPU.
 */
export default /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uDrift;

attribute vec3 aOffset;
attribute float aScale;
attribute float aPhase;

varying vec2 vUv;
varying float vTwinkle;

void main() {
  vUv = uv;

  vec3 offset = aOffset;
  offset.x += sin(uTime * 0.05 + aPhase) * uDrift;
  offset.y += cos(uTime * 0.04 + aPhase) * uDrift;

  // World-space center of this instance (modelMatrix carries any parent rotation).
  vec3 center = (modelMatrix * vec4(offset, 1.0)).xyz;

  // Camera basis vectors → billboard the quad toward the camera.
  vec3 camRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  float size = uSize * aScale;
  vec3 worldPos = center + (camRight * position.x + camUp * position.y) * size;

  vTwinkle = 0.6 + 0.4 * sin(uTime * 1.5 + aPhase);
  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`;
