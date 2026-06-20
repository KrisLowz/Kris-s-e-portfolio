/** Core vertex shader: gentle multi-axis pulsation + fresnel data for the frag. */
export default /* glsl */ `
uniform float uTime;
uniform float uDisplace;

varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  vec3 pos = position;

  // Organic energy-core pulsation (cheap, no noise texture).
  float d =
    sin(pos.x * 3.0 + uTime * 1.3) *
    sin(pos.y * 3.0 + uTime * 1.1) *
    sin(pos.z * 3.0 + uTime * 0.9);
  pos += normal * d * uDisplace;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;
