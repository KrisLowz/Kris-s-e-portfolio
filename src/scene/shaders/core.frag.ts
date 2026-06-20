/** Core fragment shader: fresnel-rim energy glow in HDR so bloom catches it. */
export default /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uIntensity;

varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  float fres = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.5);
  float pulse = 0.85 + 0.15 * sin(uTime * 2.0);

  vec3 col = mix(uColorA, uColorB, fres);
  // Luminous body + bright HDR rim (>1) so bloom blooms the edge.
  vec3 hdr = col * (0.9 + fres * uIntensity) * pulse;

  gl_FragColor = vec4(hdr, 1.0);
}
`;
