import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { SKILLS } from '../constants';

const PILLS = SKILLS.slice(0, 10);

/**
 * A playful Matter.js physics moment: the tech stack as draggable pills that
 * drop in under gravity, collide, pile up, and can be flung around with inertia.
 * DOM pills are synced to physics bodies each frame. Falls back to a static
 * flex layout on mobile / reduced motion.
 */
export default function PhysicsPlayground() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    if (reduce || mobile) return; // leave the static flex fallback

    setActive(true);

    const STAGE_H = 300; // matches .physics-stage.active height (read before .active applies)
    let W = stage.clientWidth;
    const H = STAGE_H;

    const engine = Matter.Engine.create();
    engine.gravity.y = 1;
    const world = engine.world;

    const wallOpts = { isStatic: true, render: { visible: false } };
    const makeWalls = () => [
      Matter.Bodies.rectangle(W / 2, H + 40, W + 240, 80, wallOpts),
      Matter.Bodies.rectangle(-40, H / 2, 80, H * 3, wallOpts),
      Matter.Bodies.rectangle(W + 40, H / 2, 80, H * 3, wallOpts),
    ];
    let walls = makeWalls();
    Matter.World.add(world, walls);

    const bodies = pillRefs.current
      .map((el, i) => {
        if (!el) return null;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const body = Matter.Bodies.rectangle(
          60 + Math.random() * Math.max(1, W - 120),
          -60 - i * 55,
          w,
          h,
          { chamfer: { radius: h / 2 }, restitution: 0.45, friction: 0.35, frictionAir: 0.012 }
        );
        (body as Matter.Body & { __el?: HTMLElement }).__el = el;
        return body;
      })
      .filter(Boolean) as Matter.Body[];
    Matter.World.add(world, bodies);

    const mouse = Matter.Mouse.create(stage);
    const mc = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(world, mc);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let raf = 0;
    const sync = () => {
      for (const b of bodies) {
        const el = (b as Matter.Body & { __el?: HTMLElement }).__el;
        if (!el) continue;
        el.style.opacity = '1';
        el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${
          b.position.y - el.offsetHeight / 2
        }px) rotate(${b.angle}rad)`;
      }
      raf = requestAnimationFrame(sync);
    };
    sync();

    const onResize = () => {
      W = stage.clientWidth;
      Matter.World.remove(world, walls);
      walls = makeWalls();
      Matter.World.add(world, walls);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={stageRef} className={`physics-stage ${active ? 'active' : ''}`}>
      {PILLS.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => {
            pillRefs.current[i] = el;
          }}
          className="physics-pill"
        >
          <i className={s.iconClass} />
          <span>{s.name}</span>
        </div>
      ))}
    </div>
  );
}
