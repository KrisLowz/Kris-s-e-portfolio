import React, { useEffect, useRef, useState } from 'react';

/* ============================================================================
   Hero space-shooter: a 3D cat spaceship that roams the hero and fires lasers
   (on click) at neon UFO aliens. 4–5 aliens drift around at once; when all are
   destroyed they respawn one by one. Rendered as a full-hero layer IN FRONT of
   the text/cat, but pointer-events:none so the CTAs stay clickable — firing is
   captured from a window listener and skipped when a button/link is clicked.
   three.js is dynamic-imported; hidden under reduced motion / no WebGL.
   ============================================================================ */

// Fresnel rim — a neon edge that reads on the WHITE hero (normal-blended, not additive).
export function rimMaterial(THREE: any, c1 = 0x22d3ee, c2 = 0xff2bd6) {
  return new THREE.ShaderMaterial({
    uniforms: { c1: { value: new THREE.Color(c1) }, c2: { value: new THREE.Color(c2) } },
    vertexShader:
      'varying float vF; void main(){ vec3 n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vec3 v=normalize(-mv.xyz); vF=pow(1.0-max(dot(n,v),0.0),2.2); gl_Position=projectionMatrix*mv; }',
    fragmentShader:
      'uniform vec3 c1; uniform vec3 c2; varying float vF; void main(){ gl_FragColor=vec4(mix(c1,c2,vF), vF); }',
    transparent: true,
    depthWrite: false,
  });
}

// Soft cyan thruster glow.
export function makeFlameTexture(THREE: any) {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.25, 'rgba(120,230,255,0.8)');
  g.addColorStop(0.6, 'rgba(34,211,238,0.35)');
  g.addColorStop(1.0, 'rgba(34,211,238,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// Generic white→transparent radial glow (tinted per-sprite) for explosions / muzzle flash.
export function makeGlowTexture(THREE: any) {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// Procedural hull skin — panel grid + grime + rivets (albedo + bump).
function makeHullTexture(THREE: any) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#241f3a');
  g.addColorStop(0.5, '#191427');
  g.addColorStop(1, '#0c0a18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(150,165,220,0.16)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const p = (i / 6) * s;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(s, p); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let k = 0; k < 14; k++) ctx.fillRect((k * 67) % s, (k * 113) % s, 30, 22);
  ctx.fillStyle = 'rgba(170,190,240,0.30)';
  for (let k = 0; k < 80; k++) ctx.fillRect((k * 97) % s, (k * 41) % s, 1.5, 1.5);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Glowing trim map — black with lengthwise cyan stripes + a magenta ring (emissive map).
function makeHullEmissive(THREE: any) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, s, s);
  ctx.shadowBlur = 6;
  ctx.strokeStyle = '#22d3ee'; ctx.shadowColor = '#22d3ee'; ctx.lineWidth = 4;
  [0.3, 0.7].forEach((u) => { const x = u * s; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); });
  ctx.strokeStyle = '#ff2bd6'; ctx.shadowColor = '#ff2bd6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, s * 0.78); ctx.lineTo(s, s * 0.78); ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Build the cat spaceship (faces +X = forward). Returns the group + its flame sprites.
export function buildShip(THREE: any, isMobile: boolean, track: <T>(o: T) => T, flameTex: any) {
  const ship = new THREE.Group();

  const hullMap = track(makeHullTexture(THREE));
  hullMap.repeat.set(3, 4);
  const hullEmis = track(makeHullEmissive(THREE));

  const profile = [
    [0.02, -1.30], [0.12, -1.20], [0.24, -1.02], [0.34, -0.78],
    [0.41, -0.35], [0.43, 0.05], [0.41, 0.42], [0.32, 0.82],
    [0.18, 1.18], [0.02, 1.50],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const bodyMat = track(new THREE.MeshStandardMaterial({
    color: 0xffffff, map: hullMap, bumpMap: hullMap, bumpScale: 0.02,
    emissive: 0xffffff, emissiveMap: hullEmis, emissiveIntensity: 0.9, metalness: 0.45, roughness: 0.6,
  }));
  const body = new THREE.Mesh(track(new THREE.LatheGeometry(profile, isMobile ? 22 : 40)), bodyMat);
  body.rotation.z = -Math.PI / 2;
  ship.add(body);

  const rim = new THREE.Mesh(
    track(new THREE.LatheGeometry(profile.map((p: any) => new THREE.Vector2(p.x * 1.05 + 0.012, p.y)), isMobile ? 22 : 40)),
    track(rimMaterial(THREE))
  );
  rim.rotation.z = -Math.PI / 2;
  ship.add(rim);

  const engineMat = track(new THREE.MeshStandardMaterial({ color: 0x14101f, metalness: 0.6, roughness: 0.5, flatShading: true }));
  const block = new THREE.Mesh(track(new THREE.CylinderGeometry(0.34, 0.28, 0.34, isMobile ? 8 : 10)), engineMat);
  block.rotation.z = Math.PI / 2;
  block.position.set(-1.02, 0, 0);
  ship.add(block);

  const nozzleMat = track(new THREE.MeshStandardMaterial({ color: 0x0c1530, metalness: 0.6, roughness: 0.35 }));
  const nozzleGeo = track(new THREE.CylinderGeometry(0.1, 0.15, 0.22, isMobile ? 10 : 16));
  const coreMat = track(new THREE.MeshBasicMaterial({ color: 0x6fe9ff }));
  const coreGeo = track(new THREE.CylinderGeometry(0.07, 0.1, 0.1, isMobile ? 8 : 14));
  const flames: any[] = [];
  [-0.17, 0.17].forEach((z) => {
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.rotation.z = Math.PI / 2; nozzle.position.set(-1.24, -0.02, z); ship.add(nozzle);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.z = Math.PI / 2; core.position.set(-1.32, -0.02, z); ship.add(core);
    const fMat = new THREE.SpriteMaterial({ map: flameTex, color: 0x9befff, transparent: true, opacity: 0.9, depthWrite: false });
    const flame = new THREE.Sprite(fMat);
    flame.scale.set(0.8, 0.55, 1); flame.position.set(-1.62, -0.02, z); ship.add(flame);
    flames.push(flame);
  });

  const domeMat = track(new THREE.MeshStandardMaterial({ color: 0x2ad4ff, metalness: 0.1, roughness: 0.12, transparent: true, opacity: 0.62, emissive: 0x22d3ee, emissiveIntensity: 0.85 }));
  const dome = new THREE.Mesh(track(new THREE.SphereGeometry(0.27, isMobile ? 16 : 24, isMobile ? 12 : 18)), domeMat);
  dome.position.set(0.34, 0.27, 0); ship.add(dome);
  const collar = new THREE.Mesh(track(new THREE.TorusGeometry(0.25, 0.035, 8, 22)), track(new THREE.MeshStandardMaterial({ color: 0x14101f, metalness: 0.7, roughness: 0.4 })));
  collar.position.set(0.34, 0.17, 0); collar.rotation.x = Math.PI / 2; ship.add(collar);

  const wingMat = track(new THREE.MeshStandardMaterial({ color: 0x1c1630, metalness: 0.55, roughness: 0.42, emissive: 0x0e7490, emissiveIntensity: 0.4, flatShading: true, side: THREE.DoubleSide }));
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.4, 0); wingShape.lineTo(-0.72, 0); wingShape.lineTo(-0.46, 0.82); wingShape.closePath();
  const wingGeo = track(new THREE.ExtrudeGeometry(wingShape, { depth: 0.05, bevelEnabled: false }));
  const wingletGeo = track(new THREE.BoxGeometry(0.2, 0.16, 0.04));
  [-1, 1].forEach((sgn) => {
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.rotation.x = (sgn * Math.PI) / 2; wing.position.set(0, -0.02, 0); ship.add(wing);
    const winglet = new THREE.Mesh(wingletGeo, wingMat);
    winglet.position.set(-0.5, 0.07, sgn * 0.8); winglet.rotation.y = sgn * -0.5; ship.add(winglet);
  });

  const finShape = new THREE.Shape();
  finShape.moveTo(-0.15, 0); finShape.lineTo(-0.8, 0); finShape.lineTo(-0.55, 0.42); finShape.closePath();
  const fin = new THREE.Mesh(track(new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false })), wingMat);
  fin.position.set(0, 0.28, -0.025); ship.add(fin);

  const belly = new THREE.Mesh(track(new THREE.BoxGeometry(1.1, 0.05, 0.12)), track(new THREE.MeshStandardMaterial({ color: 0x2a0a24, emissive: 0xff2bd6, emissiveIntensity: 0.7 })));
  belly.position.set(-0.1, -0.32, 0); ship.add(belly);

  const eyeMat = track(new THREE.MeshBasicMaterial({ color: 0x9bf0ff }));
  const eyeGeo = track(new THREE.SphereGeometry(0.055, 10, 10));
  [-0.12, 0.12].forEach((z) => { const eye = new THREE.Mesh(eyeGeo, eyeMat); eye.position.set(1.2, 0.04, z); ship.add(eye); });

  // model spans ~1.3 tall; the caller scales the whole group
  return { ship, flames };
}

// Build a villain UFO saucer (magenta theme, hostile eye). Returns the group + its eye material.
function buildAlien(THREE: any, isMobile: boolean, track: <T>(o: T) => T, idx: number) {
  const g = new THREE.Group();

  // saucer disc — flattened sphere, dark purple metal
  const disc = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.5, isMobile ? 16 : 24, isMobile ? 10 : 14)),
    track(new THREE.MeshStandardMaterial({ color: 0x2b1140, metalness: 0.6, roughness: 0.5, emissive: 0x3a0d33, emissiveIntensity: 0.4 }))
  );
  disc.scale.set(1, 0.34, 1);
  g.add(disc);

  // magenta rim glow so it pops on white
  const rim = new THREE.Mesh(track(new THREE.SphereGeometry(0.52, isMobile ? 16 : 24, isMobile ? 10 : 14)), track(rimMaterial(THREE, 0xff2bd6, 0x7c5cff)));
  rim.scale.set(1, 0.34, 1);
  g.add(rim);

  // equator light-ring (small emissive dots around the rim)
  const dotGeo = track(new THREE.SphereGeometry(0.05, 8, 8));
  const dotMat = track(new THREE.MeshBasicMaterial({ color: 0x9b6bff }));
  const N = isMobile ? 8 : 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5);
    g.add(dot);
  }

  // top dome — translucent
  const dome = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.26, isMobile ? 14 : 20, isMobile ? 10 : 14, 0, Math.PI * 2, 0, Math.PI / 2)),
    track(new THREE.MeshStandardMaterial({ color: 0xff7bf0, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.5, emissive: 0xff2bd6, emissiveIntensity: 0.5 }))
  );
  dome.position.y = 0.08;
  g.add(dome);

  // hostile eye inside the dome
  const eyeMat = track(new THREE.MeshBasicMaterial({ color: 0xff3b6b }));
  const eye = new THREE.Mesh(track(new THREE.SphereGeometry(0.11, 12, 12)), eyeMat);
  eye.position.y = 0.12;
  g.add(eye);

  g.userData.spin = 0.4 + (idx % 3) * 0.18;
  return { group: g, eyeMat };
}

const Spaceship3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      let THREE: any;
      try {
        THREE = await import('three');
      } catch {
        if (!cancelled) setFailed(true);
        return;
      }
      const mount = mountRef.current;
      if (cancelled || !mount) return;

      const isMobile = window.innerWidth < 640;
      const size = () => ({ w: Math.max(1, mount.clientWidth), h: Math.max(1, mount.clientHeight) });
      let { w, h } = size();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 1.0, 6);
      camera.lookAt(0, 0, 0);

      let renderer: any;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: 'default' });
      } catch {
        if (!cancelled) setFailed(true);
        return;
      }
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

      // lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const l1 = new THREE.DirectionalLight(0x22d3ee, 1.5); l1.position.set(-2, 2, 3); scene.add(l1);
      const l2 = new THREE.DirectionalLight(0xff2bd6, 1.1); l2.position.set(2, -1.5, 1.5); scene.add(l2);
      const l3 = new THREE.DirectionalLight(0xffffff, 0.7); l3.position.set(0, 3, 2); scene.add(l3);

      // ---- screen(0..1) ↔ world on the z=0 plane (so everything stays framed regardless of camera) ----
      const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const screenToWorld = (fx: number, fy: number, out: any) => {
        ndc.set(fx * 2 - 1, -(fy * 2 - 1));
        ray.setFromCamera(ndc, camera);
        ray.ray.intersectPlane(planeZ0, out);
        return out;
      };
      const _a = new THREE.Vector3(), _b = new THREE.Vector3();
      let worldH = 4;
      const computeScale = () => { screenToWorld(0.5, 0, _a); screenToWorld(0.5, 1, _b); worldH = Math.max(2, _a.distanceTo(_b)); };
      computeScale();

      const flameTex = track(makeFlameTexture(THREE));
      const glowTex = track(makeGlowTexture(THREE));

      // ---- ship ----
      const { ship, flames } = buildShip(THREE, isMobile, track, flameTex);
      scene.add(ship);
      const shipScale = () => worldH * 0.085;
      const shipPos = { fx: 0.28, fy: 0.62 };       // current (screen space)
      const shipWp = { fx: 0.5, fy: 0.5 };          // waypoint
      let shipYaw = 0, shipRoll = 0, fireFace = 0;  // fireFace: -1/+1 forces facing on shooting
      const newWaypoint = () => { shipWp.fx = 0.14 + Math.random() * 0.5; shipWp.fy = 0.32 + Math.random() * 0.46; };
      newWaypoint();

      // ---- aliens (pooled) ----
      const POP = isMobile ? 4 : 5;
      const PLAY_RIGHT = isMobile ? 0.8 : 0.6; // keep saucers in the open left/centre, clear of the cat on the right
      const aliens = Array.from({ length: POP }, (_, i) => {
        const { group } = buildAlien(THREE, isMobile, track, i);
        group.visible = false;
        scene.add(group);
        return {
          group,
          active: false,
          // Lissajous motion in screen space
          cx: 0, cy: 0, ax: 0, ay: 0, sx: 0, sy: 0, px: 0, py: 0,
          fx: 0.5, fy: 0.5,
        };
      });
      const alienWorld = aliens.map(() => new THREE.Vector3());
      const alienScale = () => worldH * 0.07;

      const spawnAlien = (a: typeof aliens[number]) => {
        a.ax = 0.06 + Math.random() * 0.14;
        a.ay = 0.06 + Math.random() * 0.13;
        // centre placed so the full drift (cx ± ax) stays left of PLAY_RIGHT
        a.cx = 0.14 + Math.random() * Math.max(0.05, PLAY_RIGHT - 0.18 - a.ax);
        a.cy = 0.18 + Math.random() * 0.5;
        a.sx = 0.25 + Math.random() * 0.4;
        a.sy = 0.3 + Math.random() * 0.5;
        a.px = Math.random() * Math.PI * 2;
        a.py = Math.random() * Math.PI * 2;
        a.active = true;
        a.group.visible = true;
        a.group.scale.setScalar(0.001); // pop-in
      };
      aliens.forEach(spawnAlien); // 4–5 at once to start

      let respawnQueue = 0;   // how many still to bring back, one by one
      let respawnTimer = 0;

      // ---- laser pool ----
      const laserMat = track(new THREE.MeshBasicMaterial({ color: 0xaffcff, transparent: true, opacity: 0.95 }));
      const laserGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 1, 6));
      const UP = new THREE.Vector3(0, 1, 0);
      const lasers = Array.from({ length: 10 }, () => {
        const m = new THREE.Mesh(laserGeo, laserMat);
        m.visible = false; scene.add(m);
        return { mesh: m, active: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, targetIdx: -1 };
      });

      // ---- particle pool (explosions + muzzle flash) ----
      const particles = Array.from({ length: 64 }, () => {
        const mat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
        disposables.push(mat);
        const sp = new THREE.Sprite(mat);
        sp.visible = false; scene.add(sp);
        return { sp, mat, active: false, vel: new THREE.Vector3(), age: 0, life: 1, base: 1, grow: 0 };
      });
      const spawnParticle = (pos: any, color: number, vx: number, vy: number, base: number, life: number, grow: number) => {
        const p = particles.find((q) => !q.active);
        if (!p) return;
        p.active = true; p.age = 0; p.life = life; p.base = base; p.grow = grow;
        p.vel.set(vx, vy, 0);
        p.mat.color.setHex(color); p.mat.opacity = 1;
        p.sp.position.copy(pos); p.sp.scale.setScalar(base); p.sp.visible = true;
      };
      const explode = (pos: any) => {
        const u = worldH;
        spawnParticle(pos, 0xffffff, 0, 0, u * 0.02, 0.35, u * 0.16);          // flash
        spawnParticle(pos, 0xff2bd6, 0, 0, u * 0.06, 0.45, u * 0.1);           // magenta bloom
        const sparks = isMobile ? 6 : 9;
        for (let i = 0; i < sparks; i++) {
          const a = (i / sparks) * Math.PI * 2 + Math.random();
          const spd = u * (0.5 + Math.random() * 0.8);
          spawnParticle(pos, i % 2 ? 0x9b6bff : 0x6fe9ff, Math.cos(a) * spd, Math.sin(a) * spd, u * 0.022, 0.5, -u * 0.01);
        }
      };

      // ---- firing ----
      const shipNose = new THREE.Vector3();
      const target = new THREE.Vector3();
      const fire = (fx: number, fy: number) => {
        screenToWorld(fx, fy, target);
        // ship nose in world (offset forward along the current facing)
        ship.getWorldPosition(shipNose);
        shipNose.x += (shipYaw < Math.PI / 2 ? 1 : -1) * 1.4 * shipScale();
        // pick the nearest alien to the click as a lock-on target (reliable kill on the thing you clicked)
        let lock = -1, best = worldH * 0.12;
        aliens.forEach((al, i) => { if (al.active) { const d = alienWorld[i].distanceTo(target); if (d < best) { best = d; lock = i; } } });
        const slot = lasers.find((l) => !l.active);
        if (!slot) return;
        const aim = lock >= 0 ? alienWorld[lock] : target;
        const dir = new THREE.Vector3().subVectors(aim, shipNose); dir.z = 0;
        if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0);
        dir.normalize();
        slot.active = true; slot.life = 1.1; slot.targetIdx = lock;
        slot.pos.copy(shipNose);
        slot.vel.copy(dir).multiplyScalar(worldH * 1.7);
        slot.mesh.visible = true;
        slot.mesh.position.copy(shipNose);
        slot.mesh.scale.set(1, worldH * 0.16, 1);
        slot.mesh.quaternion.setFromUnitVectors(UP, dir);
        // face the shot + muzzle flash
        fireFace = aim.x >= shipNose.x ? 1 : -1;
        spawnParticle(shipNose, 0x9befff, 0, 0, worldH * 0.03, 0.18, worldH * 0.04);
      };

      const onPointerDown = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const fx = (e.clientX - rect.left) / rect.width;
        const fy = (e.clientY - rect.top) / rect.height;
        if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;             // outside the hero
        const el = e.target as HTMLElement | null;
        if (el && el.closest('a, button, [role="button"], input, textarea, select')) return; // let CTAs work
        fire(fx, fy);
      };
      window.addEventListener('pointerdown', onPointerDown);

      // ---- render loop ----
      let raf = 0, visible = true, last = performance.now();
      const tmp = new THREE.Vector3();
      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = now * 0.001;

        // ---- ship steers toward its waypoint (screen space) ----
        const dx = shipWp.fx - shipPos.fx, dy = shipWp.fy - shipPos.fy;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.02) newWaypoint();
        const sp = 0.16;
        shipPos.fx += (dx / (dist || 1)) * Math.min(dist, sp * dt);
        shipPos.fy += (dy / (dist || 1)) * Math.min(dist, sp * dt);

        // ---- aliens follow their Lissajous paths (screen space) ----
        let activeCount = 0;
        aliens.forEach((al) => {
          if (!al.active) return;
          activeCount++;
          al.fx = Math.min(PLAY_RIGHT, Math.max(0.05, al.cx + al.ax * Math.sin(t * al.sx + al.px)));
          al.fy = Math.min(0.92, Math.max(0.08, al.cy + al.ay * Math.sin(t * al.sy + al.py)));
        });

        // ---- separation: nudge the ship + saucers apart so they never overlap/collide ----
        // Solved in pixel space (so the keep-apart zone is visually circular despite the aspect
        // ratio). The ship yields less (lower mobility) than the saucers; saucers also separate
        // from each other.
        {
          const W2 = Math.max(1, mount.clientWidth), H2 = Math.max(1, mount.clientHeight);
          const movers: any[] = [{ ship: true, fx: shipPos.fx, fy: shipPos.fy, r: H2 * 0.085, mob: 0.5 }];
          aliens.forEach((al, i) => { if (al.active) movers.push({ idx: i, fx: al.fx, fy: al.fy, r: H2 * 0.05, mob: 1 }); });
          const pad = H2 * 0.025;
          for (let it = 0; it < 2; it++) {
            for (let a = 0; a < movers.length; a++) {
              for (let b = a + 1; b < movers.length; b++) {
                const A = movers[a], B = movers[b];
                const ox = (B.fx - A.fx) * W2, oy = (B.fy - A.fy) * H2;
                const d = Math.hypot(ox, oy) || 0.0001;
                const min = A.r + B.r + pad;
                if (d < min) {
                  const ov = min - d, nx = ox / d, ny = oy / d, tot = A.mob + B.mob;
                  A.fx -= (nx * ov * (A.mob / tot)) / W2; A.fy -= (ny * ov * (A.mob / tot)) / H2;
                  B.fx += (nx * ov * (B.mob / tot)) / W2; B.fy += (ny * ov * (B.mob / tot)) / H2;
                }
              }
            }
          }
          movers.forEach((m) => {
            if (m.ship) { shipPos.fx = Math.min(0.66, Math.max(0.1, m.fx)); shipPos.fy = Math.min(0.9, Math.max(0.1, m.fy)); }
            else { aliens[m.idx].fx = Math.min(PLAY_RIGHT, Math.max(0.05, m.fx)); aliens[m.idx].fy = Math.min(0.92, Math.max(0.08, m.fy)); }
          });
        }

        // ---- apply ship transform ----
        screenToWorld(shipPos.fx, shipPos.fy, tmp);
        ship.position.copy(tmp);
        ship.scale.setScalar(shipScale());
        const goRight = fireFace !== 0 ? fireFace > 0 : dx >= 0;
        const targetYaw = goRight ? 0 : Math.PI;
        shipYaw += (targetYaw - shipYaw) * Math.min(1, dt * 6);
        ship.rotation.y = shipYaw;
        const targetRoll = -dy * 2.2 + Math.sin(t * 1.3) * 0.05;
        shipRoll += (targetRoll - shipRoll) * Math.min(1, dt * 4);
        ship.rotation.z = shipRoll;
        ship.rotation.x = Math.sin(t * 1.1) * 0.06;
        fireFace *= 0.92; if (Math.abs(fireFace) < 0.05) fireFace = 0;
        const flick = 0.8 + 0.2 * Math.sin(t * 26);
        flames.forEach((fl, i) => { fl.scale.set(0.8 * flick, 0.55 * flick, 1); fl.material.opacity = 0.85 * (0.8 + 0.2 * Math.sin(t * 24 + i)); });

        // ---- apply saucer transforms ----
        aliens.forEach((al, i) => {
          if (!al.active) return;
          screenToWorld(al.fx, al.fy, alienWorld[i]);
          al.group.position.copy(alienWorld[i]);
          al.group.position.y += Math.sin(t * 1.5 + i) * worldH * 0.01;
          const ts = alienScale();
          const cur = al.group.scale.x;
          al.group.scale.setScalar(cur + (ts - cur) * Math.min(1, dt * 6));
          al.group.rotation.y += dt * al.group.userData.spin;
        });

        // respawn: only once ALL are dead, bring them back one by one
        if (activeCount === 0 && respawnQueue === 0) { respawnQueue = POP; respawnTimer = 0.4; }
        if (respawnQueue > 0) {
          respawnTimer -= dt;
          if (respawnTimer <= 0) {
            const slot = aliens.find((a) => !a.active);
            if (slot) spawnAlien(slot);
            respawnQueue--;
            respawnTimer = 0.7;
          }
        }

        // lasers travel + collide
        lasers.forEach((l) => {
          if (!l.active) return;
          l.life -= dt;
          l.pos.addScaledVector(l.vel, dt);
          l.mesh.position.copy(l.pos);
          let hit = false;
          const hr = worldH * 0.06;
          // lock-on target first
          if (l.targetIdx >= 0 && aliens[l.targetIdx].active && alienWorld[l.targetIdx].distanceTo(l.pos) < hr * 1.8) hit = true;
          if (!hit) {
            for (let i = 0; i < aliens.length; i++) {
              if (aliens[i].active && alienWorld[i].distanceTo(l.pos) < hr) { l.targetIdx = i; hit = true; break; }
            }
          }
          if (hit && l.targetIdx >= 0 && aliens[l.targetIdx].active) {
            aliens[l.targetIdx].active = false;
            aliens[l.targetIdx].group.visible = false;
            explode(alienWorld[l.targetIdx]);
            l.active = false; l.mesh.visible = false;
          } else if (l.life <= 0) {
            l.active = false; l.mesh.visible = false;
          }
        });

        // particles
        particles.forEach((p) => {
          if (!p.active) return;
          p.age += dt;
          const f = p.age / p.life;
          if (f >= 1) { p.active = false; p.sp.visible = false; return; }
          p.sp.position.addScaledVector(p.vel, dt);
          p.sp.scale.setScalar(Math.max(0.001, p.base + p.grow * f));
          p.mat.opacity = (1 - f) * (1 - f);
        });

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
        computeScale();
        if (!raf) renderer.render(scene, camera);
      });
      ro.observe(mount);
      start();

      cleanup = () => {
        stop();
        io.disconnect(); ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        disposables.forEach((d) => { try { (d as any).dispose && (d as any).dispose(); } catch {} });
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        try { renderer.forceContextLoss(); } catch {}
        renderer.dispose();
      };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [reduced]);

  if (reduced || failed) return null; // decorative combat layer; hero works without it

  return <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />;
};

export default Spaceship3D;
