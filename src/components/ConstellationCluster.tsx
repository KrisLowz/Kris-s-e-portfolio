import React, { useEffect, useMemo, useRef, useState } from 'react';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

export interface ConstNode {
  id: string;
  label: string;
  /** Devicon class, e.g. "devicon-kotlin-plain colored". */
  iconClass?: string;
  /** Or a React icon node (lucide etc.) — already sized. */
  icon?: React.ReactNode;
}

/** Deterministic pseudo-random so the layout is stable across reloads. */
const rand = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

interface Pt {
  x: number;
  y: number;
}

function build(count: number, density: number) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * density)));
  const rows = Math.ceil(count / cols);
  const pts: Pt[] = Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jx = (rand(i * 2.1) - 0.5) * 0.78;
    const jy = (rand(i * 3.7 + 1) - 0.5) * 0.78;
    return {
      x: 8 + ((col + 0.5 + jx) / cols) * 84,
      y: 12 + ((row + 0.5 + jy) / rows) * 76,
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
}

interface Props {
  nodes: ConstNode[];
  /** Higher = wider/sparser. */
  density?: number;
  /** Fire world:focus/blur on hover so a matching 3D node lights up (skills). */
  sync3d?: boolean;
  /** Unique per instance so multiple constellations don't share an SVG gradient id. */
  gradientId: string;
  className?: string;
}

/**
 * A cluster of info rendered as a luminous star map: each node is a star with an
 * icon + label, related stars joined by light-lines. Hover flares the star and
 * ignites its connectors; with `sync3d` it also lights the matching 3D node.
 * The shared visual language of the redesign — see `.const-*` in style.css.
 */
const ConstellationCluster: React.FC<Props> = ({
  nodes,
  density = 1.9,
  sync3d = false,
  gradientId,
  className = '',
}) => {
  const { pts, edges } = useMemo(() => build(nodes.length, density), [nodes.length, density]);
  const [hot, setHot] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

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
    if (sync3d) emitWorldFocus({ type: 'skill', id: nodes[i].id });
  };
  const leave = (i: number) => {
    setHot((h) => (h === i ? null : h));
    if (sync3d) emitWorldBlur({ type: 'skill', id: nodes[i].id });
  };

  return (
    <div className={`const-stage relative mx-auto ${className}`}>
      <div ref={innerRef} className="const-inner">
        <svg className="const-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
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
              stroke={`url(#${gradientId})`}
              className={`const-line ${hot === a || hot === b ? 'lit' : ''}`}
            />
          ))}
        </svg>
        <div className="const-layer">
          {nodes.map((node, i) => (
            <div
              key={node.id}
              className={`const-node ${hot === i ? 'hot' : ''}`}
              style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
              data-skill-id={sync3d ? node.id : undefined}
              onMouseEnter={() => enter(i)}
              onMouseLeave={() => leave(i)}
            >
              <span className="const-star" style={{ animationDelay: `${(i % 7) * 0.45}s` }} />
              {node.iconClass ? (
                <i className={`${node.iconClass} const-icon`} />
              ) : (
                <span className="const-icon const-icon-r">{node.icon}</span>
              )}
              <span className="const-label">{node.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConstellationCluster;
