import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SKILLS } from '../constants';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/**
 * Skills as an in-world HOLOGRAM, not a logo grid. The stack is projected from
 * the nebula core as a scanning sci-fi readout: orbital signal-nodes on two
 * elliptical rings, radar sweep, corner brackets, scanlines, and a decode-boot
 * when the section scrolls into view. Hovering a node "locks" it (full colour +
 * label) and lights the matching star in the real 3D nebula behind it.
 */
interface HoloNode {
  id: string;
  name: string;
  iconClass: string;
  x: number; // % of stage width
  y: number; // % of stage height
  core: boolean;
}

function layout(): HoloNode[] {
  const inner = SKILLS.filter((s) => s.ring === 'inner');
  const outer = SKILLS.filter((s) => s.ring === 'outer');
  const place = (list: typeof SKILLS, rx: number, ry: number, phase: number, core: boolean) =>
    list.map((s, i) => {
      const a = phase + (i / list.length) * Math.PI * 2;
      return {
        id: s.id,
        name: s.name,
        iconClass: s.iconClass,
        x: 50 + Math.cos(a) * rx,
        y: 50 + Math.sin(a) * ry,
        core,
      };
    });
  return [
    ...place(inner, 19, 28, -Math.PI / 2, true),
    ...place(outer, 36, 42, -Math.PI / 2 + 0.32, false),
  ];
}

const HoloSkills: React.FC = () => {
  const nodes = useMemo(layout, []);
  const stageRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  // Decode-boot when the projection enters the viewport.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setLive(true)),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="skills" data-tint="#22d3ee" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* system header — a readout, not a title card */}
        <div className="holo-head">
          <span className="holo-head-tag">▸ NEBULA SCAN</span>
          <h2 className="holo-head-title">DEV.STACK</h2>
          <span className="holo-head-meta">
            <span className="holo-rec" /> {SKILLS.length} SIGNALS LOCKED · HOVER TO DECODE
          </span>
        </div>

        <div ref={stageRef} className={`holo-stage${live ? ' is-live' : ''}`}>
          {/* projection chrome */}
          <span className="holo-bracket tl" />
          <span className="holo-bracket tr" />
          <span className="holo-bracket bl" />
          <span className="holo-bracket br" />
          <div className="holo-grid" />
          <div className="holo-sweep" />
          <div className="holo-scanlines" />

          {/* spokes from the emitter core to each signal */}
          <svg className="holo-spokes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {nodes.map((n) => (
              <line key={n.id} x1="50" y1="50" x2={n.x} y2={n.y} />
            ))}
          </svg>

          {/* emitter core */}
          <div className="holo-core">
            <span className="holo-core-ring" />
            <span className="holo-core-dot" />
          </div>

          {/* signal nodes */}
          {nodes.map((n, i) => (
            <div
              key={n.id}
              className={`holo-node${n.core ? ' core' : ''}`}
              style={{ left: `${n.x}%`, top: `${n.y}%`, ['--d' as string]: `${0.4 + i * 0.05}s` }}
              onMouseEnter={() => emitWorldFocus({ type: 'skill', id: n.id })}
              onMouseLeave={() => emitWorldBlur({ type: 'skill', id: n.id })}
            >
              <span className="holo-node-ring" />
              <i className={`holo-node-glyph ${n.iconClass}`} aria-hidden />
              <span className="holo-node-label">{n.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HoloSkills;
