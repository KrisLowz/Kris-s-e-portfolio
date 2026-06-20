import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SKILLS } from '../constants';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/** Deterministic pseudo-random in [0,1) so the star layout is stable per reload. */
const rand = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

interface Pt {
  x: number;
  y: number;
}

/** Jittered-grid star positions (percent) + nearest-neighbour connector edges. */
function useConstellation() {
  return useMemo(() => {
    const count = SKILLS.length;
    const cols = Math.ceil(Math.sqrt(count * 1.9));
    const rows = Math.ceil(count / cols);
    const pts: Pt[] = SKILLS.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jx = (rand(i * 2.1) - 0.5) * 0.78;
      const jy = (rand(i * 3.7 + 1) - 0.5) * 0.78;
      return {
        x: 6 + ((col + 0.5 + jx) / cols) * 88,
        y: 10 + ((row + 0.5 + jy) / rows) * 80,
      };
    });
    const seen = new Set<string>();
    const edges: [number, number][] = [];
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([i, j]);
          }
        });
    });
    return { pts, edges };
  }, []);
}

/**
 * Skills as a living constellation: each skill is a star node, related stars are
 * linked by light-lines. Hovering a star flares it, ignites its connectors, and
 * fires the world:focus event so the matching 3D skill-star in the background
 * lights up too. Frameless and luminous — no cards.
 */
const SkillsConstellation: React.FC = () => {
  const { pts, edges } = useConstellation();
  const [hot, setHot] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Subtle cursor parallax on the whole constellation (lines + stars together).
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `translate(${cx * 12}px, ${cy * 9}px)`;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const enter = (i: number) => {
    setHot(i);
    emitWorldFocus({ type: 'skill', id: SKILLS[i].id });
  };
  const leave = (i: number) => {
    setHot((h) => (h === i ? null : h));
    emitWorldBlur({ type: 'skill', id: SKILLS[i].id });
  };

  return (
    <section id="skills" data-tint="#a78bfa" className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative z-10 mb-6 text-center const-heading">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-primary/80">
            The Constellation
          </p>
          <h2 className="const-title text-4xl font-extrabold text-pop-text-main md:text-5xl">
            Skills &amp; Stack
          </h2>
          <p className="mt-3 text-sm text-pop-text-muted/80">Hover a star to chart it</p>
        </div>

        <div className="const-stage relative mx-auto">
          <div ref={innerRef} className="const-inner">
            <svg className="const-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="const-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>
              {edges.map(([a, b], k) => (
                <line
                  key={k}
                  x1={pts[a].x}
                  y1={pts[a].y}
                  x2={pts[b].x}
                  y2={pts[b].y}
                  className={`const-line ${hot === a || hot === b ? 'lit' : ''}`}
                />
              ))}
            </svg>

            <div className="const-layer">
              {SKILLS.map((skill, i) => (
                <div
                  key={skill.id}
                  className={`const-node ${hot === i ? 'hot' : ''}`}
                  style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
                  data-skill-id={skill.id}
                  onMouseEnter={() => enter(i)}
                  onMouseLeave={() => leave(i)}
                >
                  <span className="const-star" style={{ animationDelay: `${(i % 7) * 0.45}s` }} />
                  <i className={`${skill.iconClass} const-icon`} />
                  <span className="const-label">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsConstellation;
