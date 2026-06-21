import { useEffect, useRef } from 'react';
import { getScrollProgress, type SectionKey } from '../animations/scroll';

/**
 * Cinematic flight-HUD overlay — corner readouts that "boot" on load and track
 * the voyage as you scroll: current act, distance travelled, velocity and a
 * pseudo star-coordinate. Pure DOM (no three.js import, so it stays out of the
 * lazy 3D bundle); reads the THREE-free scroll-progress ref each frame. Mounted
 * only when the 3D scene is active (App gates it), and the boot animation is
 * disabled under prefers-reduced-motion via the global CSS media query.
 */
/** One act per section, in voyage order — keyed so the HUD tracks the section
 *  actually centred in view (sections are unevenly sized, so a flat progress
 *  split would drift out of sync). */
const ACTS: [SectionKey, string][] = [
  ['hero', 'BOOT · LAUNCH'],
  ['about', 'ORIGIN WORLD'],
  ['skills', 'SKILL NEBULA'],
  ['experience', 'TRAJECTORY'],
  ['projects', 'PROJECT WORLDS'],
  ['contact', 'THE BEACON'],
];

export default function VoyageHUD() {
  const actEl = useRef<HTMLSpanElement>(null);
  const idxEl = useRef<HTMLSpanElement>(null);
  const distEl = useRef<HTMLSpanElement>(null);
  const velEl = useRef<HTMLSpanElement>(null);
  const coordEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prog = getScrollProgress();
    const mid = () => window.innerHeight / 2;
    let raf = 0;
    let vel = 0;
    let prev = prog.value;
    let act = -1;

    const tick = () => {
      const p = prog.value;
      const d = Math.abs(p - prev);
      prev = p;
      vel += (d - vel) * 0.1;

      // Current act = the section under the viewport centre. getBoundingClientRect
      // is layout-accurate, so this stays correct even while the Projects section
      // is pinned (where per-section scroll progress is unreliable).
      const m = mid();
      let a = act < 0 ? 0 : act;
      let bestDist = Infinity;
      for (let i = 0; i < ACTS.length; i++) {
        const el = document.getElementById(ACTS[i][0]);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= m && r.bottom >= m) {
          a = i;
          break;
        }
        const dist = Math.abs((r.top + r.bottom) / 2 - m);
        if (dist < bestDist) {
          bestDist = dist;
          a = i;
        }
      }
      if (a !== act) {
        act = a;
        if (actEl.current) {
          actEl.current.textContent = ACTS[a][1];
          actEl.current.classList.remove('hud-switch');
          // reflow to restart the flicker animation
          void actEl.current.offsetWidth;
          actEl.current.classList.add('hud-switch');
        }
        if (idxEl.current) idxEl.current.textContent = `0${a + 1}`;
      }
      if (distEl.current) distEl.current.textContent = (p * 482.6).toFixed(1);
      if (velEl.current) velEl.current.textContent = (vel * 9200).toFixed(0);
      if (coordEl.current) {
        const x = (Math.sin(p * 6.283) * 64 + 128).toFixed(0);
        const y = (Math.cos(p * 4.1) * 48 + 96).toFixed(0);
        coordEl.current.textContent = `X${x} · Y${y} · Z${(p * 256).toFixed(0)}`;
      }
      if (barEl.current) barEl.current.style.transform = `scaleY(${0.04 + p * 0.96})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="voyage-hud" aria-hidden="true">
      {/* top-left — system status */}
      <div className="hud-corner hud-tl" style={{ animationDelay: '0.1s' }}>
        <div className="hud-row">
          <span className="hud-dot" /> PROBE · ONLINE
        </div>
        <div className="hud-dim">NAV LINK SYNCED</div>
      </div>

      {/* top-right — coordinates / velocity */}
      <div className="hud-corner hud-tr" style={{ animationDelay: '0.22s' }}>
        <div className="hud-dim">SECTOR</div>
        <div className="hud-row">
          <span ref={coordEl}>X128 · Y96 · Z0</span>
        </div>
        <div className="hud-dim">
          VEL <span ref={velEl}>0</span> c
        </div>
      </div>

      {/* bottom-left — current act */}
      <div className="hud-corner hud-bl" style={{ animationDelay: '0.34s' }}>
        <div className="hud-dim">
          ACT <span ref={idxEl}>01</span>
        </div>
        <div className="hud-act">
          <span ref={actEl} className="hud-switch">
            BOOT · LAUNCH
          </span>
        </div>
      </div>

      {/* bottom-right — distance + progress bar */}
      <div className="hud-corner hud-br" style={{ animationDelay: '0.46s' }}>
        <div className="hud-dim">DISTANCE</div>
        <div className="hud-row">
          <span ref={distEl}>0.0</span> ly
        </div>
      </div>
      <div className="hud-track" style={{ animationDelay: '0.5s' }}>
        <div ref={barEl} className="hud-bar" />
      </div>
    </div>
  );
}
