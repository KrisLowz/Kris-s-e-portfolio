import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, MessageCircle, Brain, Repeat2, Users, Timer, ListChecks } from 'lucide-react';

const PLANET_IMG = '/assets/world/about/origin-planet-cutout-opt.webp';

// Soft skills — each is a node on the planet. [lat, lon] (deg) put them on the front hemisphere.
export const SKILLS: { name: string; desc: string; lat: number; lon: number }[] = [
  { name: 'Problem Solving', desc: 'Analyzing complex issues to find efficient, scalable solutions.', lat: 52, lon: 3 },
  { name: 'Communication', desc: 'Translating technical concepts for non-technical stakeholders.', lat: 22, lon: 44 },
  { name: 'Critical Thinking', desc: 'Evaluating data objectively to make informed technical decisions.', lat: 18, lon: -46 },
  { name: 'Adaptability', desc: 'Quickly learning new stacks (like Flutter/React) as projects evolve.', lat: -6, lon: 58 },
  { name: 'Teamwork', desc: 'Collaborating across cross-functional teams to drive product success.', lat: -10, lon: -58 },
  { name: 'Time Management', desc: 'Prioritizing tasks effectively to meet strict deployment deadlines.', lat: -46, lon: 26 },
  { name: 'Project Management', desc: 'Agile methodologies, sprint planning, and backlog management.', lat: -44, lon: -24 },
];

const SKILL_ICONS: Record<string, React.ComponentType<any>> = {
  'Problem Solving': Lightbulb,
  Communication: MessageCircle,
  'Critical Thinking': Brain,
  Adaptability: Repeat2,
  Teamwork: Users,
  'Time Management': Timer,
  'Project Management': ListChecks,
};

function makeGlowTexture(THREE: any) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.22, 'rgba(150,120,255,0.45)');
  g.addColorStop(0.55, 'rgba(80,40,160,0.16)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (t: number) => { const c = clamp01(t); return c * c * (3 - 2 * c); };

// The planet's pop → grow → land entrance, reproduced in 3D (group scale 0→1 of S_FINAL), keyed on
// the shared scroll progress. Mirrors the old GSAP keyframes: pop 0.30, grow 0.46, land 0.70→0.96.
function entranceScale(p: number) {
  if (p <= 0.3) return 0;
  if (p < 0.46) return smooth((p - 0.3) / 0.16) * 0.3;
  if (p < 0.7) return 0.3 + smooth((p - 0.46) / 0.24) * 0.3;
  if (p < 0.96) return 0.6 + smooth((p - 0.7) / 0.26) * 0.4;
  return 1;
}
// drift to the "landed" framing happens only in the land phase
const driftFrac = (p: number) => (p < 0.7 ? 0 : smooth((p - 0.7) / 0.26));

/**
 * Shared WebGL world (one renderer / scene / camera / loop). Currently holds the "About act": the
 * 3D planet + soft-skill constellation. Its pop/grow/land entrance and (later) the 90° camera turn
 * are driven imperatively from a scroll-progress ref (no React re-renders). three.js is dynamic-
 * imported; any failure falls back to the flat planet image.
 */
const SpaceScene: React.FC<{ progressRef: React.MutableRefObject<number> }> = ({ progressRef }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
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
      const S_FINAL = isMobile ? 0.8 : 1.05; // landed planet scale (smaller on mobile)
      const LAND_X = isMobile ? 0 : 2.2; // landed drift: right on desktop
      const LAND_Y = isMobile ? 1.25 : 0; // landed drift: up on mobile
      const size = () => ({ w: Math.max(1, mount.clientWidth), h: Math.max(1, mount.clientHeight) });
      let { w, h } = size();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 0, 7);
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
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      mount.appendChild(canvas);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        if (cancelled) return;
        cleanup();
        cleanup = () => {};
        setFailed(true);
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);

      // ---- planet (About act) ----
      const R = 1.25;
      const planet = new THREE.Group();
      planet.rotation.z = 0.18;
      planet.scale.setScalar(0); // starts hidden; entrance drives the scale
      scene.add(planet);

      const bodyGeo = new THREE.SphereGeometry(R, isMobile ? 48 : 96, isMobile ? 48 : 96);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x180f36, roughness: 0.55, metalness: 0.35, emissive: 0x130a2c, emissiveIntensity: 0.5 });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      planet.add(bodyMesh);

      const rimGeo = new THREE.SphereGeometry(R * 1.015, 64, 64);
      const rimMat = new THREE.ShaderMaterial({
        uniforms: { c1: { value: new THREE.Color(0x22d3ee) }, c2: { value: new THREE.Color(0xff2bd6) } },
        vertexShader: `varying float vF; void main(){ vec3 n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vec3 v=normalize(-mv.xyz); vF=pow(1.0-max(dot(n,v),0.0),2.6); gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 c1; uniform vec3 c2; varying float vF; void main(){ gl_FragColor=vec4(mix(c1,c2,vF),vF); }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      planet.add(new THREE.Mesh(rimGeo, rimMat));

      const icoGeo = new THREE.IcosahedronGeometry(R * 1.04, isMobile ? 2 : 3);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
      const wireGeo = new THREE.WireframeGeometry(icoGeo);
      planet.add(new THREE.LineSegments(wireGeo, wireMat));

      const nodeMat = new THREE.PointsMaterial({ color: 0x9be7ff, size: isMobile ? 0.06 : 0.045, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
      planet.add(new THREE.Points(icoGeo, nodeMat));

      const ringGeo = new THREE.RingGeometry(R * 1.5, R * 1.57, 110);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.46;
      ring.rotation.y = 0.2;
      planet.add(ring);

      const glowTex = makeGlowTexture(THREE);
      const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0x7a4dff, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.5, depthWrite: false });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(R * 4.2, R * 4.2, 1);
      glow.position.z = -0.6;
      planet.add(glow);

      const skillGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const skillMat = new THREE.MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
      const skillNodes: any[] = [];
      SKILLS.forEach((s) => {
        const la = (s.lat * Math.PI) / 180;
        const lo = (s.lon * Math.PI) / 180;
        const rr = R * 1.06;
        const mNode = new THREE.Mesh(skillGeo, skillMat);
        mNode.position.set(rr * Math.cos(la) * Math.sin(lo), rr * Math.sin(la), rr * Math.cos(la) * Math.cos(lo));
        planet.add(mNode);
        skillNodes.push(mNode);
      });

      scene.add(new THREE.AmbientLight(0x3a3a60, 1.3));
      const l1 = new THREE.DirectionalLight(0x22d3ee, 2.2); l1.position.set(-3, 2, 3); scene.add(l1);
      const l2 = new THREE.DirectionalLight(0xff2bd6, 1.5); l2.position.set(3, -1, 1.5); scene.add(l2);
      const l3 = new THREE.DirectionalLight(0xffffff, 0.45); l3.position.set(0, 3, 2); scene.add(l3);

      // ---- interaction (freeze + reveal constellation when the cursor is over the actual sphere) ----
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const landed = () => progressRef.current > 0.93; // only interactive once the planet has settled (entrance finishes ~0.96)
      let hover = false;
      let pinned = false;
      let chipHoverCount = 0;

      const hitsPlanet = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
        raycaster.setFromCamera(ndc, camera);
        return raycaster.intersectObject(bodyMesh, false).length > 0;
      };
      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        hover = landed() && hitsPlanet(e.clientX, e.clientY);
        mount.style.cursor = hover ? 'pointer' : '';
      };
      const onPointerLeave = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        hover = false;
        mount.style.cursor = '';
      };
      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerType !== 'touch' || !landed()) return;
        if (hitsPlanet(e.clientX, e.clientY)) pinned = !pinned;
      };
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('pointerup', onPointerUp);

      const chipEnter = () => { chipHoverCount++; };
      const chipLeave = () => { chipHoverCount = Math.max(0, chipHoverCount - 1); };
      const chipEls = chipRefs.current.filter(Boolean) as HTMLDivElement[];
      chipEls.forEach((chip) => {
        chip.addEventListener('pointerenter', chipEnter);
        chip.addEventListener('pointerleave', chipLeave);
      });

      const tmp = new THREE.Vector3();
      const pc = new THREE.Vector3();
      const pe = new THREE.Vector3();
      let labelAlpha = 0;
      let lastEngaged = -1e9;
      const GRACE_MS = 480;

      // Project nodes to screen and fan the chips outward from the planet's projected centre. Works in
      // pixels (the canvas is full-viewport, not CSS-scaled), so no counter-scale is needed.
      const positionLabels = () => {
        const W = mount.clientWidth, H = mount.clientHeight;
        bodyMesh.getWorldPosition(pc); pc.project(camera);
        const pcx = (pc.x * 0.5 + 0.5) * W, pcy = (1 - (pc.y * 0.5 + 0.5)) * H;
        // planet's apparent radius in px (project a point one world-radius to the right of centre)
        bodyMesh.getWorldPosition(pe); pe.x += R * planet.scale.x; pe.project(camera);
        const radPx = Math.max(40, Math.abs((pe.x * 0.5 + 0.5) * W - pcx));
        const off = radPx * 0.42; // fan the chips just outside the sphere
        for (let i = 0; i < skillNodes.length; i++) {
          const chip = chipRefs.current[i];
          const line = lineRefs.current[i];
          if (!chip) continue;
          skillNodes[i].getWorldPosition(tmp).project(camera);
          const lx = (tmp.x * 0.5 + 0.5) * W, ly = (1 - (tmp.y * 0.5 + 0.5)) * H;
          let dx = lx - pcx, dy = ly - pcy;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len; dy /= len;
          const cx = lx + dx * off, cy = ly + dy * off;
          chip.style.left = cx + 'px';
          chip.style.top = cy + 'px';
          chip.classList.toggle('skill-up', cy > H * 0.6);
          chip.style.opacity = String(labelAlpha);
          chip.style.pointerEvents = labelAlpha > 0.2 ? 'auto' : 'none';
          if (line) {
            line.setAttribute('x1', String(lx)); line.setAttribute('y1', String(ly));
            line.setAttribute('x2', String(cx)); line.setAttribute('y2', String(cy));
            line.style.opacity = String(labelAlpha * 0.5);
          }
        }
      };

      // ---- render loop ----
      let raf = 0;
      let visible = true;
      let last = performance.now();
      const TWO_PI = Math.PI * 2;
      let idle = false;
      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const p = progressRef.current;
        const sc = entranceScale(p);

        // Hero/idle phase: planet hidden (scale 0) and nothing revealed — skip the per-frame work; clear
        // the canvas once so no stale frame lingers, and keep the loop scheduled so it resumes on scroll.
        if (sc === 0 && labelAlpha < 0.001) {
          if (!idle) {
            idle = true;
            renderer.clear();
            for (let i = 0; i < chipRefs.current.length; i++) { const c = chipRefs.current[i]; if (c) c.style.opacity = '0'; }
          }
          raf = visible ? requestAnimationFrame(tick) : 0;
          return;
        }
        idle = false;

        // entrance: scale + drift from scroll progress
        planet.scale.setScalar(sc * S_FINAL);
        const d = driftFrac(p);
        planet.position.set(d * LAND_X, d * LAND_Y, 0);

        const active = landed();
        if (!active) { hover = false; pinned = false; chipHoverCount = 0; mount.style.cursor = ''; }
        const rawEngaged = hover || pinned || chipHoverCount > 0;
        if (rawEngaged) lastEngaged = now;
        const engaged = active && (rawEngaged || now - lastEngaged < GRACE_MS);
        const k = Math.min(1, dt * 4);

        if (engaged) {
          const ty = Math.round(planet.rotation.y / TWO_PI) * TWO_PI;
          planet.rotation.y += (ty - planet.rotation.y) * k;
          planet.rotation.x += (-0.08 - planet.rotation.x) * k;
        } else {
          planet.rotation.y += dt * 0.18;
          planet.rotation.x += (0 - planet.rotation.x) * k;
          ring.rotation.z += dt * 0.06;
        }
        const targetAlpha = engaged ? 1 : 0;
        labelAlpha += (targetAlpha - labelAlpha) * Math.min(1, dt * (targetAlpha > labelAlpha ? 6 : 1.7));

        const pulse = 1 + 0.18 * Math.sin(now * 0.004);
        skillNodes.forEach((mNode, i) => mNode.scale.setScalar(pulse + (engaged ? 0.25 : 0) + 0.05 * Math.sin(now * 0.005 + i)));
        skillMat.opacity = engaged ? 1 : 0.92;

        renderer.render(scene, camera);
        if (labelAlpha > 0.001) positionLabels();
        else for (let i = 0; i < chipRefs.current.length; i++) { const c = chipRefs.current[i]; if (c) c.style.opacity = '0'; }
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
        camera.aspect = s.w / s.h;
        camera.updateProjectionMatrix();
        if (!raf) renderer.render(scene, camera);
      });
      ro.observe(mount);
      start();

      cleanup = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('pointerup', onPointerUp);
        chipEls.forEach((chip) => {
          chip.removeEventListener('pointerenter', chipEnter);
          chip.removeEventListener('pointerleave', chipLeave);
        });
        canvas.removeEventListener('webglcontextlost', onContextLost);
        bodyGeo.dispose(); bodyMat.dispose(); rimGeo.dispose(); rimMat.dispose();
        icoGeo.dispose(); wireGeo.dispose(); wireMat.dispose(); nodeMat.dispose();
        ringGeo.dispose(); ringMat.dispose(); glowTex.dispose(); glowMat.dispose();
        skillGeo.dispose(); skillMat.dispose();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        try { renderer.forceContextLoss(); } catch {}
        renderer.dispose();
      };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [progressRef]);

  if (failed) {
    // WebGL unavailable: static planet + a VISIBLE skill list (the hover-reveal is impossible here, so
    // sighted users still get the skills — not only screen readers).
    return (
      <>
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center sm:justify-end sm:pr-[8vw]">
          <img src={PLANET_IMG} alt="" aria-hidden="true" draggable={false} className="h-[60vmin] w-[60vmin] object-contain select-none" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center px-6">
          <ul className="flex max-w-2xl flex-wrap justify-center gap-2">
            {SKILLS.map((s) => (
              <li key={s.name} title={s.desc} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
        <ul className="sr-only">
          {SKILLS.map((s) => (<li key={s.name}><strong>{s.name}</strong>: {s.desc}</li>))}
        </ul>
      </>
    );
  }

  return (
    <>
      <div ref={mountRef} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" />
      {/* Constellation labels — full-viewport overlay above the copy (z-30), positioned in px each frame */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
          {SKILLS.map((s, i) => (
            <line key={s.name} ref={(el) => (lineRefs.current[i] = el)} x1="0" y1="0" x2="0" y2="0" stroke="#22D3EE" strokeWidth="1" style={{ opacity: 0 }} />
          ))}
        </svg>
        {SKILLS.map((s, i) => {
          const Icon = SKILL_ICONS[s.name] || Lightbulb;
          return (
            <div
              key={s.name}
              ref={(el) => (chipRefs.current[i] = el)}
              className="group/skill absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer will-change-transform hover:z-30"
              style={{ left: '50%', top: '50%', opacity: 0, pointerEvents: 'none' }}
            >
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0a0916]/80 px-2.5 py-1 shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 group-hover/skill:-translate-y-0.5 group-hover/skill:border-[#22D3EE]/55 group-hover/skill:bg-[#0a0916]/95 group-hover/skill:shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                <Icon size={12} strokeWidth={2} className="shrink-0 text-[#22D3EE]/90" />
                <span className="whitespace-nowrap text-[12px] font-semibold tracking-wide text-[#dcd9ee]">{s.name}</span>
              </div>
              <div className="skill-detail pointer-events-none absolute left-1/2 top-[calc(100%+8px)] w-48 -translate-x-1/2 translate-y-1 scale-[0.97] rounded-xl border border-white/10 bg-[#0a0914]/95 p-3 text-left opacity-0 shadow-[0_16px_44px_rgba(0,0,0,0.62)] backdrop-blur-xl transition-all duration-300 group-hover/skill:translate-y-0 group-hover/skill:scale-100 group-hover/skill:opacity-100">
                <span aria-hidden="true" className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/55 to-transparent"></span>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Icon size={13} strokeWidth={2} className="shrink-0 translate-y-0.5 text-[#22D3EE] opacity-0 transition-all duration-300 delay-75 group-hover/skill:translate-y-0 group-hover/skill:opacity-100" />
                  <span className="translate-y-0.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#ece9fa] opacity-0 transition-all duration-300 delay-100 group-hover/skill:translate-y-0 group-hover/skill:opacity-100">{s.name}</span>
                </div>
                <p className="translate-y-0.5 text-[11px] leading-relaxed text-[#a8a3c2] opacity-0 transition-all delay-150 duration-300 group-hover/skill:translate-y-0 group-hover/skill:opacity-100">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <ul className="sr-only">
        {SKILLS.map((s) => (<li key={s.name}><strong>{s.name}</strong>: {s.desc}</li>))}
      </ul>
    </>
  );
};

export default SpaceScene;
