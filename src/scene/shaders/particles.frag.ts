/**
 * Soft round additive particle. Roundness comes from the quad's own UVs (NOT
 * gl_PointCoord), so it's reliable on every GPU. Brightness is baked into the
 * color so the glow shows even without the bloom pass.
 */
export default /* glsl */ `
uniform vec3 uColor;

varying vec2 vUv;
varying float vTwinkle;

void main() {
  float d = length(vUv - 0.5) * 2.0;
  float disc = smoothstep(1.0, 0.0, d);
  float alpha = disc * vTwinkle;
  if (alpha < 0.01) discard;
  // A bright core within each star so additive blending reads as a glow.
  vec3 col = uColor + vec3(disc * disc * 0.5);
  gl_FragColor = vec4(col, alpha);
}
`;
