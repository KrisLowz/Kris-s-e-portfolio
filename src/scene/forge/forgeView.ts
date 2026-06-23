/** Half-extents (world units) of the z=0 plane visible to a perspective camera
 *  at (0,0,camZ) looking at the origin, given vertical fov + viewport aspect. */
export function viewBounds(camZ: number, fovDeg: number, aspect: number): { halfW: number; halfH: number } {
  const halfH = camZ * Math.tan((fovDeg * Math.PI) / 360); // tan(fov/2 in rad)
  return { halfW: halfH * aspect, halfH };
}

/** Map a pixel within the canvas (px:0..w left→right, py:0..h top→bottom) to a
 *  world (x,y) on the z=0 plane. Screen y is inverted so up is +y. */
export function screenToWorld(
  px: number,
  py: number,
  w: number,
  h: number,
  b: { halfW: number; halfH: number }
): { x: number; y: number } {
  const nx = (px / w) * 2 - 1; // -1..1
  const ny = -((py / h) * 2 - 1); // +1 (top) .. -1 (bottom)
  return { x: nx * b.halfW, y: ny * b.halfH };
}
