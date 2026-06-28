import React, { useEffect, useRef, useState } from 'react';
import { EXPERIENCE } from '../constants';
import { buildShip, makeFlameTexture, makeGlowTexture, rimMaterial } from './Spaceship3D';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

/* ============================================================================
   Experience as a scroll-driven flight path. The ship holds station-keeping on the
   left while a rail of "stations" (one per job) flows right→left as you scroll,
   each docking at centre (powers on + lifts, info panel flies in, docking beam, YEAR
   HUD + radar). Click a station to zoom in on its mission report. The backdrop is a
   2D-style space field: layered twinkling stars + dust, nebulae, distant planets, a
   comet, meteor streaks, an asteroid drift, and scroll-velocity warp streaks.
   Reduced motion / no-WebGL falls back to a clean static timeline.
   ============================================================================ */

// Earliest first (the constant lists newest first). + an end beacon → Contact.
const ONE_ERP = EXPERIENCE.find((e) => e.id === 'one-erp');
const MR_BUR = EXPERIENCE.find((e) => e.id === 'mr-bur');
type Stop = {
  exp?: typeof EXPERIENCE[number];
  beacon?: boolean;
  kind: 'data' | 'relay' | 'beacon';
  accent: number;
  short: string;
  localX: number;
};
const STOPS: Stop[] = [
  { exp: ONE_ERP, kind: 'data', accent: 0x3b82f6, short: 'ONE ERP', localX: 0 },
  { exp: MR_BUR, kind: 'relay', accent: 0x22d3ee, short: 'MR BUR', localX: 8 },
  { beacon: true, kind: 'beacon', accent: 0xff2bd6, short: '2026', localX: 16 },
];

// conveyor: rail.x = A + p*(B-A); a stop docks (worldX≈0) when rail.x = -localX
const RAIL_A = 4, RAIL_B = -20;

// A twinkling star layer: round points with per-star random phase so each blinks independently,
// size scaled by depth. Returned geo/mat are tracked + the caller sets parallax.
function makeStarLayer(THREE: any, count: number, sx: number, sy: number, z0: number, z1: number, color: number, size: number) {
  const pos = new Float32Array(count * 3);
  const aph = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * sx;
    pos[i * 3 + 1] = (Math.random() - 0.5) * sy;
    pos[i * 3 + 2] = z0 + Math.random() * (z1 - z0);
    aph[i] = Math.random() * 6.283;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aph', new THREE.BufferAttribute(aph, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uSize: { value: size } },
    vertexShader:
      'attribute float aph; varying float vph; uniform float uSize; void main(){ vph=aph; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=uSize*(140.0/max(0.001,-mv.z)); gl_Position=projectionMatrix*mv; }',
    fragmentShader:
      'uniform float uTime; uniform vec3 uColor; varying float vph; void main(){ vec2 d=gl_PointCoord-0.5; float r=smoothstep(0.5,0.0,length(d)); float tw=0.35+0.65*sin(uTime*2.0+vph); gl_FragColor=vec4(uColor, r*tw); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  return { points: new THREE.Points(geo, mat), mat, geo };
}

// Horizontal streak gradient (transparent tail → bright head) for meteors + the comet tail.
function makeStreakTexture(THREE: any) {
  const w = 64, h = 8;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.65, 'rgba(180,230,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
}

// Soft cloud (several overlapping additive blobs) for nebulae.
function makeNebulaTexture(THREE: any) {
  const s = 128;
  const c = document.createElement('canvas'); c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 6; k++) {
    const cx = s * (0.3 + 0.4 * ((k * 53) % 100) / 100), cy = s * (0.3 + 0.4 * ((k * 31) % 100) / 100), rad = s * (0.18 + 0.16 * ((k * 17) % 100) / 100);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  }
  return new THREE.CanvasTexture(c);
}

// A dim shaded planet disc (light from upper-left, transparent outside the circle).
function makePlanetTexture(THREE: any, c1: string, c2: string) {
  const s = 128;
  const c = document.createElement('canvas'); c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s * 0.36, s * 0.36, s * 0.04, s * 0.5, s * 0.5, s * 0.52);
  g.addColorStop(0, c1); g.addColorStop(0.72, c2); g.addColorStop(1, '#04030c');
  ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  return new THREE.CanvasTexture(c);
}

// enterprise data-station: stacked server cylinders + rotating data rings + glowing core
function buildDataStation(THREE: any, isMobile: boolean, track: <T>(o: T) => T, accent: number) {
  const g = new THREE.Group();
  const bodyMat = track(new THREE.MeshStandardMaterial({ color: 0x141a2e, metalness: 0.7, roughness: 0.4, emissive: accent, emissiveIntensity: 0.18, flatShading: true }));
  const rackGeo = track(new THREE.CylinderGeometry(0.55, 0.6, 0.42, isMobile ? 8 : 12));
  [-0.55, 0, 0.55].forEach((y) => { const r = new THREE.Mesh(rackGeo, bodyMat); r.position.y = y; g.add(r); });
  const core = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.34, 0)), track(new THREE.MeshBasicMaterial({ color: accent })));
  g.add(core);
  const ringMat = track(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  const rings: any[] = [];
  [0.95, 1.2].forEach((rad, i) => {
    const ring = new THREE.Mesh(track(new THREE.TorusGeometry(rad, 0.025, 8, 48)), ringMat);
    ring.rotation.x = Math.PI / 2 + (i ? 0.5 : 0);
    g.add(ring); rings.push(ring);
  });
  const rim = new THREE.Mesh(track(new THREE.CylinderGeometry(0.62, 0.66, 1.5, isMobile ? 8 : 12)), track(rimMaterial(THREE, accent, 0x7c5cff)));
  g.add(rim);
  return { group: g, rings, core, nodes: null, ring: null };
}

// web/edge relay: octagon body + dish + solar wings + orbiting edge nodes
function buildRelayStation(THREE: any, isMobile: boolean, track: <T>(o: T) => T, accent: number) {
  const g = new THREE.Group();
  const bodyMat = track(new THREE.MeshStandardMaterial({ color: 0x16202c, metalness: 0.7, roughness: 0.4, emissive: accent, emissiveIntensity: 0.2, flatShading: true }));
  const body = new THREE.Mesh(track(new THREE.CylinderGeometry(0.6, 0.72, 0.7, 8)), bodyMat);
  g.add(body);
  const dishMat = track(new THREE.MeshStandardMaterial({ color: 0x9fb3c8, metalness: 0.5, roughness: 0.4, emissive: accent, emissiveIntensity: 0.15, side: THREE.DoubleSide }));
  const dish = new THREE.Mesh(track(new THREE.ConeGeometry(0.6, 0.42, isMobile ? 12 : 20, 1, true)), dishMat);
  dish.position.set(0, 0.62, 0); dish.rotation.x = -0.5;
  g.add(dish);
  const mast = new THREE.Mesh(track(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6)), bodyMat);
  mast.position.y = 0.5; g.add(mast);
  const wingMat = track(new THREE.MeshStandardMaterial({ color: 0x0a2a3a, metalness: 0.4, roughness: 0.5, emissive: 0x0e7490, emissiveIntensity: 0.4 }));
  [-1, 1].forEach((s) => { const wmesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.7, 0.04, 0.42)), wingMat); wmesh.position.set(s * 0.95, 0, 0); g.add(wmesh); });
  const nodeMat = track(new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
  const nodeGeo = track(new THREE.SphereGeometry(0.07, 8, 8));
  const nodes: any[] = [];
  const M = isMobile ? 3 : 4;
  for (let i = 0; i < M; i++) { const nd = new THREE.Mesh(nodeGeo, nodeMat); g.add(nd); nodes.push({ mesh: nd, phase: (i / M) * Math.PI * 2, rad: 1.15 }); }
  const rim = new THREE.Mesh(track(new THREE.CylinderGeometry(0.74, 0.86, 0.72, 8)), track(rimMaterial(THREE, accent, 0xff2bd6)));
  g.add(rim);
  return { group: g, rings: null, core: null, nodes, ring: null };
}

// end beacon: a glowing gate ring + pulsing core → invites onward to Contact
function buildBeacon(THREE: any, track: <T>(o: T) => T, accent: number) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.9, 0.08, 12, 48)), track(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 })));
  g.add(ring);
  const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.3, 16, 16)), track(new THREE.MeshBasicMaterial({ color: 0xffffff })));
  g.add(core);
  return { group: g, rings: null, core, nodes: null, ring };
}

const Experience: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const radarLabelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const focusIdxRef = useRef(-1);
  const wantFocusRef = useRef(false);
  const focusProgRef = useRef(0);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [failed, setFailed] = useState(false);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const closeFocus = () => { wantFocusRef.current = false; setFocusedIdx(-1); };

  // ---- scroll pin (mirrors Journey): scrub writes progress for the 3D scene to read ----
  useEffect(() => {
    if (reduced) return;
    const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 2.2 : 3),
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self: any) => { progressRef.current = self.progress; },
      });
    }, trackRef);
    return () => ctx.revert();
  }, [reduced]);

  // ---- 3D scene ----
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      let THREE: any;
      try { THREE = await import('three'); } catch { if (!cancelled) setFailed(true); return; }
      const mount = mountRef.current;
      if (cancelled || !mount) return;

      const isMobile = window.innerWidth < 640;
      const size = () => ({ w: Math.max(1, mount.clientWidth), h: Math.max(1, mount.clientHeight) });
      let { w, h } = size();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(0, 1.3, 10);
      camera.lookAt(0, 0, 0);

      let renderer: any;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: 'default' }); }
      catch { if (!cancelled) setFailed(true); return; }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      const canvas = renderer.domElement;
      canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block'; canvas.style.pointerEvents = 'none';
      mount.appendChild(canvas);

      const onContextLost = (e: Event) => { e.preventDefault(); if (cancelled) return; cleanup(); cleanup = () => {}; setFailed(true); };
      canvas.addEventListener('webglcontextlost', onContextLost, false);

      const disposables: any[] = [];
      const track = <T,>(o: T): T => { disposables.push(o); return o; };

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const l1 = new THREE.DirectionalLight(0x22d3ee, 1.4); l1.position.set(-3, 2, 4); scene.add(l1);
      const l2 = new THREE.DirectionalLight(0xff2bd6, 1.0); l2.position.set(3, -1, 2); scene.add(l2);
      const l3 = new THREE.DirectionalLight(0xffffff, 0.6); l3.position.set(0, 4, 3); scene.add(l3);

      const flameTex = track(makeFlameTexture(THREE));
      const glowTex = track(makeGlowTexture(THREE));
      const { ship, flames } = buildShip(THREE, isMobile, track, flameTex);
      ship.scale.setScalar(0.8);
      scene.add(ship);
      // ship sits in the bottom-left foreground, out of the station rail's lane, escorting + beaming up
      const SHIP_BASE = new THREE.Vector3(-3.4, -1.8, 2.6);

      // ===== 2D-style space backdrop: layered twinkling stars + dust, nebula, distant planets,
      // a comet, meteor streaks, an asteroid drift, and scroll-velocity warp streaks. =====
      const starDefs = [
        { n: 170, sx: 70, sy: 36, z0: -17, z1: -11, c: 0x8fa6ff, sz: 1.4, par: 0.02 },
        { n: 170, sx: 64, sy: 32, z0: -10, z1: -5, c: 0xbfe6ff, sz: 2.0, par: 0.05 },
        { n: 130, sx: 56, sy: 28, z0: -5, z1: -1.5, c: 0xeafcff, sz: 2.6, par: 0.09 },
      ];
      const starLayers = starDefs.map((d) => {
        const L = makeStarLayer(THREE, isMobile ? Math.round(d.n * 0.6) : d.n, d.sx, d.sy, d.z0, d.z1, d.c, d.sz);
        track(L.geo); track(L.mat); scene.add(L.points);
        return { ...L, par: d.par, phase: Math.random() * 6.28 };
      });
      const dust = makeStarLayer(THREE, isMobile ? 80 : 140, 40, 22, 1, 4.5, 0xb9a6d8, 2.2);
      track(dust.geo); track(dust.mat); scene.add(dust.points);

      const nebulaTex = track(makeNebulaTexture(THREE));
      const nebulae = [
        { color: 0x22d3ee, x: -10, y: 5, z: -13, s: 16, o: 0.18, par: 0.03 },
        { color: 0xff2bd6, x: 9, y: -4, z: -12, s: 14, o: 0.16, par: 0.035 },
        { color: 0x7c5cff, x: 2, y: 7, z: -14, s: 18, o: 0.12, par: 0.025 },
      ].map((n) => {
        const m = new THREE.SpriteMaterial({ map: nebulaTex, color: n.color, transparent: true, opacity: n.o, blending: THREE.AdditiveBlending, depthWrite: false });
        disposables.push(m);
        const sp = new THREE.Sprite(m); sp.position.set(n.x, n.y, n.z); sp.scale.set(n.s, n.s, 1); scene.add(sp);
        return { sp, base: new THREE.Vector3(n.x, n.y, n.z), par: n.par, phase: Math.random() * 6.28 };
      });

      const planets = [
        { tex: track(makePlanetTexture(THREE, '#5b8cff', '#1b2a6b')), x: -11, y: 6.5, z: -15, s: 5, par: 0.015 },
        { tex: track(makePlanetTexture(THREE, '#ff7bbf', '#5b1140')), x: 12, y: -6, z: -16, s: 7, par: 0.012 },
      ].map((pl) => {
        const m = new THREE.SpriteMaterial({ map: pl.tex, transparent: true, opacity: 0.7, depthWrite: false });
        disposables.push(m);
        const sp = new THREE.Sprite(m); sp.position.set(pl.x, pl.y, pl.z); sp.scale.set(pl.s, pl.s, 1); scene.add(sp);
        return { sp, baseX: pl.x, par: pl.par };
      });

      const streakTex = track(makeStreakTexture(THREE));
      const streakGeo = track(new THREE.PlaneGeometry(1, 0.08));
      const streaks = Array.from({ length: 5 }, () => {
        const m = new THREE.MeshBasicMaterial({ map: streakTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        disposables.push(m);
        const mesh = new THREE.Mesh(streakGeo, m); mesh.visible = false; mesh.position.z = -4; scene.add(mesh);
        return { mesh, m, active: false, vx: 0, vy: 0, age: 0, life: 1 };
      });
      let streakTimer = 1.5;

      const cometHeadMat = track(new THREE.SpriteMaterial({ map: glowTex, color: 0xbff2ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      const cometHead = new THREE.Sprite(cometHeadMat); cometHead.scale.set(1.1, 1.1, 1);
      const cometTailMat = track(new THREE.MeshBasicMaterial({ map: streakTex, color: 0x9be6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      const cometTail = new THREE.Mesh(streakGeo, cometTailMat); cometTail.scale.set(4.5, 0.5, 1); cometTail.position.x = -2.5;
      const comet = new THREE.Group(); comet.add(cometTail); comet.add(cometHead); comet.position.z = -9; comet.visible = false; scene.add(comet);
      let cometT = -1, cometWait = 6, cometDir = 1;

      const astGeo = track(new THREE.IcosahedronGeometry(1, 0));
      const astMat = track(new THREE.MeshStandardMaterial({ color: 0x3a2c28, roughness: 1, metalness: 0, emissive: 0x140d0a, emissiveIntensity: 0.4, flatShading: true }));
      const SPAN = 26;
      const asteroids = Array.from({ length: isMobile ? 6 : 10 }, () => {
        const mesh = new THREE.Mesh(astGeo, astMat);
        mesh.scale.setScalar(0.12 + Math.random() * 0.34);
        mesh.position.set((Math.random() - 0.5) * SPAN, (Math.random() - 0.5) * 16, -2 - Math.random() * 4);
        scene.add(mesh);
        return { mesh, rx: (Math.random() - 0.5) * 0.6, ry: (Math.random() - 0.5) * 0.6, spd: 1.1 + Math.random() * 1.6 };
      });

      const warpN = isMobile ? 24 : 48;
      const warpPos = new Float32Array(warpN * 2 * 3);
      for (let i = 0; i < warpN; i++) {
        const x = (Math.random() - 0.5) * 30, y = (Math.random() - 0.5) * 18, z = -3 - Math.random() * 5, len = 1.2 + Math.random() * 1.8;
        warpPos[i * 6] = x - len; warpPos[i * 6 + 1] = y; warpPos[i * 6 + 2] = z;
        warpPos[i * 6 + 3] = x + len; warpPos[i * 6 + 4] = y; warpPos[i * 6 + 5] = z;
      }
      const warpGeo = track(new THREE.BufferGeometry()); warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPos, 3));
      const warpMat = track(new THREE.LineBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      const warpLines = new THREE.LineSegments(warpGeo, warpMat); scene.add(warpLines);
      let warp = 0, lastP = 0;

      // focus-on-station camera state (click a station → zoom in)
      const BASE_CAM = new THREE.Vector3(0, 1.3, 10);
      const BASE_LOOK = new THREE.Vector3(0, 0, 0);
      const tmpStation = new THREE.Vector3();
      const lookTarget = new THREE.Vector3();
      const focusCamPos = new THREE.Vector3();
      let focusT = 0;

      const beamMat = track(new THREE.MeshBasicMaterial({ color: 0x9befff, transparent: true, opacity: 0, depthWrite: false }));
      const beam = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, 1, 6)), beamMat);
      beam.visible = false;
      scene.add(beam);

      const rail = new THREE.Group();
      scene.add(rail);
      const builtStops = STOPS.map((stop) => {
        let b: any;
        if (stop.kind === 'data') b = buildDataStation(THREE, isMobile, track, stop.accent);
        else if (stop.kind === 'relay') b = buildRelayStation(THREE, isMobile, track, stop.accent);
        else b = buildBeacon(THREE, track, stop.accent);
        b.group.position.x = stop.localX;
        b.group.scale.setScalar(0.6);
        rail.add(b.group);
        const hit = new THREE.Mesh(track(new THREE.SphereGeometry(1.3, 8, 8)), track(new THREE.MeshBasicMaterial({ visible: false })));
        hit.position.x = stop.localX; rail.add(hit);
        return { ...b, stop, hit, hoverT: 0 };
      });

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let hoverIdx = -1;
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0) return;
        const fx = (e.clientX - rect.left) / rect.width, fy = (e.clientY - rect.top) / rect.height;
        if (fx < 0 || fx > 1 || fy < 0 || fy > 1) { hoverIdx = -1; if (stageRef.current) stageRef.current.style.cursor = ''; return; }
        ndc.set(fx * 2 - 1, -(fy * 2 - 1));
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(builtStops.map((s) => s.hit), false)[0];
        hoverIdx = hit ? builtStops.findIndex((s) => s.hit === hit.object) : -1;
        if (stageRef.current) stageRef.current.style.cursor = hoverIdx >= 0 ? 'pointer' : '';
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      // click router: station → focus-zoom, empty → close focus (HUD/links opt out via data-exp-ui)
      const onPointerDown = (e: PointerEvent) => {
        const el = e.target as HTMLElement | null;
        if (el && el.closest('a, button, [data-exp-ui]')) return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0) return;
        const fx = (e.clientX - rect.left) / rect.width, fy = (e.clientY - rect.top) / rect.height;
        if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;
        ndc.set(fx * 2 - 1, -(fy * 2 - 1));
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(builtStops.map((s) => s.hit), false)[0];
        if (hit) {
          const idx = builtStops.findIndex((s) => s.hit === hit.object);
          focusIdxRef.current = idx; wantFocusRef.current = true; focusProgRef.current = progressRef.current; setFocusedIdx(idx);
          return;
        }
        if (focusIdxRef.current >= 0) { wantFocusRef.current = false; setFocusedIdx(-1); }
      };
      window.addEventListener('pointerdown', onPointerDown);

      const tmp = new THREE.Vector3();
      const shipNose = new THREE.Vector3();
      const UP = new THREE.Vector3(0, 1, 0);
      let raf = 0, visible = true, last = performance.now();
      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = now * 0.001;
        const p = progressRef.current;

        // focus (click-to-zoom): ease in/out. While it's still opening, track the (scrub-settling)
        // scroll so residual drift doesn't self-close it; once fully open, a real scroll closes it.
        if (focusIdxRef.current >= 0 && wantFocusRef.current) {
          if (focusT < 0.9) focusProgRef.current = p;
          else if (Math.abs(p - focusProgRef.current) > 0.04) { wantFocusRef.current = false; setFocusedIdx(-1); }
        }
        focusT += ((wantFocusRef.current ? 1 : 0) - focusT) * Math.min(1, dt * 4);
        if (focusT < 0.01 && !wantFocusRef.current) focusIdxRef.current = -1;
        const fIdx = focusIdxRef.current;

        rail.position.x = RAIL_A + p * (RAIL_B - RAIL_A);
        const railX = rail.position.x;

        // ---- background FX ----
        for (const L of starLayers) { L.mat.uniforms.uTime.value = t + L.phase; L.points.position.x = -railX * L.par; }
        dust.mat.uniforms.uTime.value = t;
        dust.points.position.set(-railX * 0.14, Math.sin(t * 0.2) * 0.5, 0);
        for (const nb of nebulae) nb.sp.position.set(nb.base.x - railX * nb.par + Math.sin(t * 0.1 + nb.phase) * 0.6, nb.base.y + Math.cos(t * 0.08 + nb.phase) * 0.4, nb.base.z);
        for (const pl of planets) pl.sp.position.x = pl.baseX - railX * pl.par;
        // meteor streaks
        streakTimer -= dt;
        if (streakTimer <= 0) {
          streakTimer = 1.2 + Math.random() * 3;
          const sk = streaks.find((q) => !q.active);
          if (sk) {
            const ang = -0.5 - Math.random() * 0.6, spd = 14 + Math.random() * 10, sgn = Math.random() < 0.5 ? 1 : -1;
            sk.vx = Math.cos(ang) * spd * sgn; sk.vy = Math.sin(ang) * spd;
            sk.active = true; sk.age = 0; sk.life = 0.5 + Math.random() * 0.4;
            sk.mesh.scale.set(2 + Math.random() * 2.5, 0.08, 1);
            sk.mesh.position.set((Math.random() - 0.5) * 18, 7 + Math.random() * 3, -4);
            sk.mesh.rotation.z = Math.atan2(sk.vy, sk.vx);
            sk.mesh.visible = true;
          }
        }
        streaks.forEach((sk) => {
          if (!sk.active) return;
          sk.age += dt; const f = sk.age / sk.life;
          if (f >= 1) { sk.active = false; sk.mesh.visible = false; return; }
          sk.mesh.position.x += sk.vx * dt; sk.mesh.position.y += sk.vy * dt;
          sk.m.opacity = Math.sin(f * Math.PI) * 0.9;
        });
        // comet (slow, periodic)
        if (cometT < 0) {
          cometWait -= dt;
          if (cometWait <= 0) { cometT = 0; comet.visible = true; cometDir = Math.random() < 0.5 ? 1 : -1; comet.position.y = 3 + Math.random() * 3; cometTail.rotation.z = cometDir > 0 ? Math.PI : 0; }
        } else {
          cometT += dt / 9;
          if (cometT >= 1) { cometT = -1; comet.visible = false; cometWait = 14 + Math.random() * 14; }
          else {
            comet.position.x = cometDir * (-14 + cometT * 28);
            const fade = Math.sin(cometT * Math.PI);
            cometHeadMat.opacity = fade; cometTailMat.opacity = fade * 0.8;
          }
        }
        // asteroid drift (flows left, recycles)
        asteroids.forEach((a) => {
          a.mesh.position.x -= a.spd * dt;
          a.mesh.rotation.x += a.rx * dt; a.mesh.rotation.y += a.ry * dt;
          if (a.mesh.position.x < -SPAN / 2) { a.mesh.position.x = SPAN / 2; a.mesh.position.y = (Math.random() - 0.5) * 16; }
        });
        // warp streaks driven by scroll velocity
        const scrollSpeed = Math.abs(p - lastP) / Math.max(dt, 1e-3); lastP = p;
        warp += (Math.min(1, Math.max(0, (scrollSpeed - 0.18) * 2.2)) - warp) * Math.min(1, dt * 5);
        warpMat.opacity = warp * 0.55;
        warpLines.position.x = -railX * 0.1;

        ship.position.set(SHIP_BASE.x, SHIP_BASE.y + Math.sin(t * 1.4) * 0.12, SHIP_BASE.z);
        ship.rotation.y = 0;
        ship.rotation.z = Math.sin(t * 1.1) * 0.06;
        ship.rotation.x = Math.sin(t * 0.9) * 0.05;
        const flick = 0.8 + 0.2 * Math.sin(t * 26);
        flames.forEach((fl: any, i: number) => { fl.scale.set(0.8 * flick, 0.55 * flick, 1); fl.material.opacity = 0.85 * (0.8 + 0.2 * Math.sin(t * 24 + i)); });

        let bestDock = 0, bestIdx = -1;
        let radarDocked: string | null = null, radarNextWX = Infinity, radarNext: string | null = null;
        builtStops.forEach((s, i) => {
          const worldX = s.stop.localX + rail.position.x;
          const dock = Math.max(0, 1 - Math.abs(worldX) / 3);
          if (dock > bestDock) { bestDock = dock; bestIdx = i; }
          const hov = hoverIdx === i ? 1 : 0;
          s.hoverT += (hov - s.hoverT) * Math.min(1, dt * 8);
          const lift = dock * 0.35 + s.hoverT * 0.18;
          // dock a touch below centre so the info panel (which rises above) has headroom
          s.group.position.y = -0.6 + lift + Math.sin(t * 1.3 + i) * 0.06;
          // focus zoom: the focused station grows, the others shrink away
          const fscale = fIdx === i ? 1 + focusT * 0.25 : 1 - focusT * 0.85;
          s.group.scale.setScalar((0.6 + dock * 0.4 + s.hoverT * 0.08) * fscale);
          s.group.rotation.y += dt * (0.25 + dock * 0.2);
          if (s.rings) s.rings.forEach((r: any, k: number) => { r.rotation.z += dt * (0.6 + k * 0.4); });
          if (s.nodes) s.nodes.forEach((n: any) => { n.phase += dt * 0.9; n.mesh.position.set(Math.cos(n.phase) * n.rad, Math.sin(n.phase * 1.3) * 0.3, Math.sin(n.phase) * n.rad); });
          if (s.core) s.core.scale.setScalar(1 + 0.12 * Math.sin(t * 4 + i) + dock * 0.2);
          if (s.ring) s.ring.rotation.z += dt * 0.8;

          const panel = panelRefs.current[i];
          if (panel) {
            s.group.getWorldPosition(tmp).project(camera);
            panel.style.left = (tmp.x * 0.5 + 0.5) * 100 + '%';
            panel.style.top = (1 - (tmp.y * 0.5 + 0.5)) * 100 + '%';
            const a = Math.max(dock, s.hoverT * 0.6) * (1 - focusT); // hide fly-in panels while focused
            panel.style.opacity = String(a);
            panel.style.pointerEvents = a > 0.4 ? 'auto' : 'none';
          }

          // radar blip: worldX → scope position (incoming on the right, passed on the left)
          const blip = blipRefs.current[i];
          if (blip) {
            const nx = Math.max(-1, Math.min(1, worldX / 10));
            blip.style.left = 50 + nx * 38 + '%';
            blip.style.top = 50 + (i - (STOPS.length - 1) / 2) * 16 + '%';
            blip.style.opacity = String(Math.max(0.25, 1 - Math.abs(worldX) / 12));
            blip.style.transform = `translate(-50%,-50%) scale(${1 + dock * 0.8})`;
          }
          if (dock > 0.55) radarDocked = s.stop.short;
          else if (worldX > 0.4 && worldX < radarNextWX) { radarNextWX = worldX; radarNext = s.stop.short; }
        });
        if (radarLabelRef.current) radarLabelRef.current.textContent = radarDocked ? 'DOCKED · ' + radarDocked : radarNext ? 'NEXT · ' + radarNext : 'ROUTE CLEAR';

        if (bestIdx >= 0 && bestDock > 0.25) {
          ship.getWorldPosition(shipNose); shipNose.x += 1.0; shipNose.y += 0.5;
          builtStops[bestIdx].group.getWorldPosition(tmp);
          const dir = new THREE.Vector3().subVectors(tmp, shipNose);
          const len = dir.length();
          beam.visible = true;
          beam.position.copy(shipNose).addScaledVector(dir, 0.5);
          beam.scale.set(1, len, 1);
          beam.quaternion.setFromUnitVectors(UP, dir.normalize());
          beamMat.opacity = (bestDock - 0.25) * 0.9 * (1 - focusT);
        } else { beam.visible = false; }

        // camera: base framing, or zoomed in on the focused station
        if (fIdx >= 0 && focusT > 0.001) {
          builtStops[fIdx].group.getWorldPosition(tmpStation);
          focusCamPos.set(tmpStation.x + 2.0, tmpStation.y + 0.8, tmpStation.z + 4.0);
          camera.position.lerpVectors(BASE_CAM, focusCamPos, focusT);
          lookTarget.lerpVectors(BASE_LOOK, tmpStation, focusT);
          camera.lookAt(lookTarget);
        } else {
          // entrance: continue the Skills exit's vertical camera-DOWN — the camera starts high and DESCENDS to
          // its base (no tilt: position + look offset equally), so the flight-path rises in from below. Settles
          // just before the first station docks (p≈0.17), reading as one continuous downward move.
          const ent = Math.min(1, Math.max(0, p / 0.14));
          const e = ent * ent * (3 - 2 * ent); // smoothstep
          const drop = (1 - e) * 9;
          camera.position.copy(BASE_CAM); camera.position.y += drop;
          lookTarget.copy(BASE_LOOK); lookTarget.y += drop;
          camera.lookAt(lookTarget);
        }

        if (yearRef.current) yearRef.current.textContent = String(Math.round(2023 + Math.min(1, Math.max(0, p)) * 3));

        renderer.render(scene, camera);
        raf = visible ? requestAnimationFrame(tick) : 0;
      };
      const start = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(tick); } };
      const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; visible ? start() : stop(); }, { threshold: 0 });
      io.observe(mount);
      const onVis = () => { visible = !document.hidden; visible ? start() : stop(); };
      document.addEventListener('visibilitychange', onVis);

      const ro = new ResizeObserver(() => {
        const s = size();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(s.w, s.h, false);
        camera.aspect = s.w / s.h; camera.updateProjectionMatrix();
        if (!raf) renderer.render(scene, camera);
      });
      ro.observe(mount);
      start();

      cleanup = () => {
        stop(); io.disconnect(); ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        if (stageRef.current) stageRef.current.style.cursor = '';
        canvas.removeEventListener('webglcontextlost', onContextLost);
        disposables.forEach((d) => { try { (d as any).dispose && (d as any).dispose(); } catch {} });
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        try { renderer.forceContextLoss(); } catch {}
        renderer.dispose();
      };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [reduced]);

  // ---- reduced-motion / no-WebGL: clean static timeline ----
  if (reduced || failed) {
    return (
      <section id="experience" aria-labelledby="exp-heading" className="relative w-full bg-[#05030f] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Flight Log // Experience</p>
          <h2 id="exp-heading" className="mt-4 font-display text-4xl font-extrabold text-[#F5F3FF] sm:text-6xl">The route so far</h2>
          <ol className="mt-12 space-y-8 border-l border-white/15 pl-8">
            {[ONE_ERP, MR_BUR].filter(Boolean).map((e) => (
              <li key={e!.id} className="relative">
                <span className="absolute -left-[2.1rem] top-1.5 h-3 w-3 rounded-full bg-[#22D3EE] shadow-[0_0_12px_#22D3EE]" />
                <p className="text-sm font-semibold text-[#22D3EE]">{e!.period}</p>
                <h3 className="mt-1 text-xl font-bold text-[#F5F3FF]">{e!.role} · <span className="text-[#C3BFD6]">{e!.company}</span></h3>
                <p className="mt-2 text-[#A8A3C2]">{e!.description}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {e!.skills.map((s) => (
                    <li key={s} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]">{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} id="experience" aria-labelledby="exp-heading" className="relative bg-[#05030f]">
      <div ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-[#05030f]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,#0a0a24_0%,#06051a_50%,#03020c_100%)]" />
        <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-16 sm:px-10 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Flight Log // Experience</p>
          <h2 id="exp-heading" className="mt-3 font-display text-4xl font-extrabold leading-tight text-[#F5F3FF] sm:text-6xl">
            The route so far
          </h2>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-6 z-20 sm:left-10">
          <div className="rounded-xl border border-[#22D3EE]/30 bg-[#070518]/70 px-4 py-2 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]/80">Stardate</p>
            <p className="font-display text-3xl font-extrabold text-[#F5F3FF]"><span ref={yearRef}>2023</span></p>
          </div>
        </div>

        {/* RADAR — ship at centre, stations drift in from the right and pass through */}
        <div className="pointer-events-none absolute bottom-10 right-6 z-20 sm:right-10">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border border-[#22D3EE]/30 bg-[#070518]/70 backdrop-blur-md">
            <div className="absolute inset-[18%] rounded-full border border-[#22D3EE]/15" />
            <div className="absolute inset-[38%] rounded-full border border-[#22D3EE]/15" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#22D3EE]/10" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#22D3EE]/10" />
            <div className="radar-sweep absolute inset-0 rounded-full" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            {STOPS.map((stop, i) => {
              const c = '#' + stop.accent.toString(16).padStart(6, '0');
              return <div key={i} ref={(el) => (blipRefs.current[i] = el)} className="absolute h-2 w-2 rounded-full" style={{ left: '50%', top: '50%', background: c, boxShadow: `0 0 6px ${c}`, transform: 'translate(-50%,-50%)' }} />;
            })}
          </div>
          <p className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#22D3EE]/80"><span ref={radarLabelRef}>SCANNING</span></p>
        </div>

        {STOPS.map((stop, i) => (
          <div
            key={i}
            ref={(el) => (panelRefs.current[i] = el)}
            className="absolute z-20 w-64 -translate-x-1/2 -translate-y-[130%] will-change-transform"
            style={{ left: '50%', top: '50%', opacity: 0, pointerEvents: 'none' }}
          >
            {stop.beacon ? (
              <a href="#contact" className="block rounded-2xl border border-[#FF2BD6]/40 bg-[#0a0814]/90 p-4 text-center shadow-[0_16px_44px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <p className="font-display text-lg font-extrabold text-[#F5F3FF]">→ 2026</p>
                <p className="mt-1 text-sm text-[#C3BFD6]">Open for new missions — let&apos;s talk.</p>
              </a>
            ) : stop.exp ? (
              <div className="rounded-2xl border border-white/12 bg-[#0a0814]/90 p-4 shadow-[0_16px_44px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]">{stop.exp.period}</p>
                <h3 className="mt-1.5 font-display text-lg font-extrabold leading-tight text-[#F5F3FF]">{stop.exp.role}</h3>
                <p className="text-sm font-semibold text-[#C3BFD6]">{stop.exp.company}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#A8A3C2]">{stop.exp.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {stop.exp.skills.map((s) => (
                    <li key={s} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-2.5 py-0.5 text-[11px] font-semibold text-[#dffaff]">{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}

        {/* focus modal — click a station to zoom in + read the full mission report; click away / ✕ to exit */}
        {focusedIdx >= 0 && (
          <div data-exp-ui className="absolute inset-0 z-30 flex items-center justify-center p-6">
            <div data-exp-ui onClick={closeFocus} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/12 bg-[#0a0814]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
              <button data-exp-ui onClick={closeFocus} aria-label="Close" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/15 text-[#C3BFD6] transition-colors hover:bg-white/10 hover:text-white">✕</button>
              {STOPS[focusedIdx].beacon ? (
                <div className="text-center">
                  <p className="font-display text-3xl font-extrabold text-[#F5F3FF]">→ 2026</p>
                  <p className="mt-2 text-[#C3BFD6]">Open for new missions.</p>
                  <a data-exp-ui href="#contact" onClick={closeFocus} className="mt-5 inline-block rounded-full border border-[#FF2BD6]/50 bg-[#FF2BD6]/10 px-6 py-2.5 text-sm font-bold text-[#FF2BD6] transition-colors hover:bg-[#FF2BD6]/20">Hail me →</a>
                </div>
              ) : STOPS[focusedIdx].exp ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#22D3EE]">{STOPS[focusedIdx].exp!.period}</p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-[#F5F3FF]">{STOPS[focusedIdx].exp!.role}</h3>
                  <p className="text-base font-semibold text-[#C3BFD6]">{STOPS[focusedIdx].exp!.company}</p>
                  <p className="mt-4 leading-relaxed text-[#A8A3C2]">{STOPS[focusedIdx].exp!.description}</p>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#22D3EE]/80">Tech deployed</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {STOPS[focusedIdx].exp!.skills.map((s) => (
                      <li key={s} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]">{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        )}

        <ul className="sr-only">
          {[ONE_ERP, MR_BUR].filter(Boolean).map((e) => (
            <li key={e!.id}><strong>{e!.role} at {e!.company}</strong> ({e!.period}): {e!.description}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Experience;
