import Matter from 'matter-js';

/** matter-js is tuned for pixel-scale; we sim in world-units × this factor. */
export const PHYS_SCALE = 100;

export interface ForgeWorld {
  engine: Matter.Engine;
  bodies: Matter.Body[];
}

/** Build a zero-g world: one circle body per world-unit position, 4 static walls
 *  at the (scaled) view bounds so nothing escapes the stage. */
export function createForgeWorld(
  positions: { x: number; y: number }[],
  bounds: { halfW: number; halfH: number },
  radius: number
): ForgeWorld {
  const engine = Matter.Engine.create();
  engine.gravity.x = 0;
  engine.gravity.y = 0;

  const r = radius * PHYS_SCALE;
  const bodies = positions.map((p) =>
    Matter.Bodies.circle(p.x * PHYS_SCALE, p.y * PHYS_SCALE, r, {
      restitution: 0.7,
      frictionAir: 0.02,
      friction: 0,
    })
  );

  const W = bounds.halfW * PHYS_SCALE;
  const H = bounds.halfH * PHYS_SCALE;
  const t = 1000; // wall thickness — must exceed max body displacement per step to prevent tunneling
  const walls = [
    Matter.Bodies.rectangle(0, -H - t / 2, W * 2 + t * 2, t, { isStatic: true }),
    Matter.Bodies.rectangle(0, H + t / 2, W * 2 + t * 2, t, { isStatic: true }),
    Matter.Bodies.rectangle(-W - t / 2, 0, t, H * 2 + t * 2, { isStatic: true }),
    Matter.Bodies.rectangle(W + t / 2, 0, t, H * 2 + t * 2, { isStatic: true }),
  ];

  Matter.Composite.add(engine.world, [...bodies, ...walls]);
  return { engine, bodies };
}

/** Advance the sim. Clamp dt so a tab-switch stall doesn't explode the world. */
export function stepForge(world: ForgeWorld, dtMs: number): void {
  Matter.Engine.update(world.engine, Math.min(dtMs, 33));
}

/** Index of the body whose centre is within `radius` of the world point, else null. */
export function grabAt(world: ForgeWorld, wx: number, wy: number): number | null {
  const x = wx * PHYS_SCALE;
  const y = wy * PHYS_SCALE;
  let best: number | null = null;
  let bestD = Infinity;
  world.bodies.forEach((b, i) => {
    const d = Math.hypot(b.position.x - x, b.position.y - y);
    if (d < (b.circleRadius ?? 0) * 1.6 && d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/** Drag a grabbed body to a world point; setting position tracks velocity so a
 *  release throws it. */
export function dragTo(world: ForgeWorld, index: number, wx: number, wy: number): void {
  const b = world.bodies[index];
  Matter.Body.setPosition(b, { x: wx * PHYS_SCALE, y: wy * PHYS_SCALE });
}

/** Nothing special on release — the velocity from dragTo's position deltas carries
 *  the throw. Kept as an explicit hook for clarity / future tuning. */
export function release(_world: ForgeWorld, _index: number): void {}
