/**
 * Core fragment shader — luminous in plain LDR so the core glows on EVERY GPU,
 * not only when the bloom pass is available. The fresnel rim and a white-hot
 * edge highlight read as energy without postprocessing; on capable GPUs the
 * bright parts (>1) additionally bloom.
 */
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
  vec3 outc = col * (0.8 + fres * uIntensity) * pulse;
  // White-hot rim so the edge reads as energy even with bloom off.
  outc += vec3(fres * fres) * 0.55;

  gl_FragColor = vec4(outc, 1.0);
}
`;
