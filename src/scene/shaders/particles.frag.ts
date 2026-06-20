/** Particle fragment shader: soft round additive point with twinkle alpha. */
export default /* glsl */ `
uniform vec3 uColor;

varying float vTwinkle;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
  gl_FragColor = vec4(uColor, alpha);
}
`;
