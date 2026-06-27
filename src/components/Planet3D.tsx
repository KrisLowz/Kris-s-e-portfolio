import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, MessageCircle, Brain, Repeat2, Users, Timer, ListChecks } from 'lucide-react';

const PLANET_IMG = '/assets/world/about/origin-planet-cutout-opt.webp';

// Soft skills — each becomes a node on the planet. [latitude, longitude] (deg) place the node on the
// front hemisphere so they all face the camera in the "skills pose".
export const SKILLS: { name: string; desc: string; lat: number; lon: number }[] = [
  { name: 'Problem Solving', desc: 'Analyzing complex issues to find efficient, scalable solutions.', lat: 52, lon: 3 },
  { name: 'Communication', desc: 'Translating technical concepts for non-technical stakeholders.', lat: 22, lon: 44 },
  { name: 'Critical Thinking', desc: 'Evaluating data objectively to make informed technical decisions.', lat: 18, lon: -46 },
  { name: 'Adaptability', desc: 'Quickly learning new stacks (like Flutter/React) as projects evolve.', lat: -6, lon: 58 },
  { name: 'Teamwork', desc: 'Collaborating across cross-functional teams to drive product success.', lat: -10, lon: -58 },
  { name: 'Time Management', desc: 'Prioritizing tasks effectively to meet strict deployment deadlines.', lat: -46, lon: 26 },
  { name: 'Project Management', desc: 'Agile methodologies, sprint planning, and backlog management.', lat: -44, lon: -24 },
];

// One lucide icon per skill (matched by name) for the constellation chips.
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

/**
 * WebGL 3D planet (dark sphere + neon network + ring + glow) that spins continuously.
 * Hovering it (when landed) freezes the spin, turns to a "skills pose", and reveals the soft-skill
 * constellation: HTML labels at each node's projected screen position, with connector lines.
 * three.js is dynamic-imported; falls back to the flat image on any failure.
 */
const Planet3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
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
      const planetEl = mount.parentElement as HTMLElement; // .about-planet (GSAP-scaled)

      const isMobile = window.innerWidth < 640;
      const MAX_SCALE = isMobile ? 1.25 : 1.7;
      // GSAP scales .about-planet to this when landed; the chips live inside it, so without a
      // counter-scale their text/cards would be blown up by the same factor. Counter-scale the
      // labels overlay by 1/LAND_SCALE so chips render at 1:1 (premium, crisp), and remap their
      // coords by the inverse (in positionLabels) so they still land on the right screen point.
      const LAND_SCALE = isMobile ? 1.25 : 1.7;
      if (labelsRef.current) {
        labelsRef.current.style.transform = 'scale(' + 1 / LAND_SCALE + ')';
        labelsRef.current.style.transformOrigin = '50% 50%';
      }
      const size = () => ({ w: Math.max(1, mount.clientWidth), h: Math.max(1, mount.clientHeight) });
      let { w, h } = size();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 0, 7);

      let renderer: any;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: 'default' });
      } catch {
        if (!cancelled) setFailed(true);
        return;
      }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w * MAX_SCALE, h * MAX_SCALE, false);
      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      mount.appendChild(canvas);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        if (cancelled) return;
        cleanup(); // tear the live scene down (RAF loop, observers, listeners, GL) — React won't,
        cleanup = () => {}; // because deps are [] so its cleanup only runs on unmount. Don't double-run.
        setFailed(true);
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);

      const R = 1.25;
      const planet = new THREE.Group();
      planet.rotation.z = 0.18;
      scene.add(planet);

      const bodyGeo = new THREE.SphereGeometry(R, isMobile ? 48 : 96, isMobile ? 48 : 96);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x180f36,
        roughness: 0.55,
        metalness: 0.35,
        emissive: 0x130a2c,
        emissiveIntensity: 0.5,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      planet.add(bodyMesh); // hover hit-test target (raycast against the actual sphere, not the div)

      const rimGeo = new THREE.SphereGeometry(R * 1.015, 64, 64);
      const rimMat = new THREE.ShaderMaterial({
        uniforms: { c1: { value: new THREE.Color(0x22d3ee) }, c2: { value: new THREE.Color(0xff2bd6) } },
        vertexShader: `varying float vF; void main(){ vec3 n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vec3 v=normalize(-mv.xyz); vF=pow(1.0-max(dot(n,v),0.0),2.6); gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 c1; uniform vec3 c2; varying float vF; void main(){ gl_FragColor=vec4(mix(c1,c2,vF),vF); }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
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

      // Skill nodes — brighter markers the HTML labels point to; they spin with the planet and settle
      // into the front-facing "skills pose" when it freezes on hover.
      const skillGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const skillMat = new THREE.MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
      const skillNodes: any[] = [];
      SKILLS.forEach((s) => {
        const la = (s.lat * Math.PI) / 180;
        const lo = (s.lon * Math.PI) / 180;
        const rr = R * 1.06;
        const m = new THREE.Mesh(skillGeo, skillMat);
        m.position.set(rr * Math.cos(la) * Math.sin(lo), rr * Math.sin(la), rr * Math.cos(la) * Math.cos(lo));
        planet.add(m);
        skillNodes.push(m);
      });

      scene.add(new THREE.AmbientLight(0x3a3a60, 1.3));
      const l1 = new THREE.DirectionalLight(0x22d3ee, 2.2); l1.position.set(-3, 2, 3); scene.add(l1);
      const l2 = new THREE.DirectionalLight(0xff2bd6, 1.5); l2.position.set(3, -1, 1.5); scene.add(l2);
      const l3 = new THREE.DirectionalLight(0xffffff, 0.45); l3.position.set(0, 3, 2); scene.add(l3);

      // ---- interaction state ----
      // The spin freezes (and the skills reveal) when the cursor is over the actual planet SPHERE —
      // hit-tested by raycasting, NOT the square container. It stays frozen while a skill chip is
      // hovered so the description is readable; on touch, a tap on the planet toggles it (no hover).
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const landed = () => (planetEl?.getBoundingClientRect().width || 0) > 360;
      let hover = false; // cursor over the sphere (mouse/pen)
      let pinned = false; // tap-to-toggle on touch
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
        if (e.pointerType === 'touch') return; // touch path uses tap-to-pin
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

      // Keep it frozen while the cursor is on a chip (which sits outside the sphere, so the raycast
      // would otherwise drop the hover and the labels would fade as you reach for them).
      const chipEnter = () => { chipHoverCount++; };
      const chipLeave = () => { chipHoverCount = Math.max(0, chipHoverCount - 1); };
      const chipEls = chipRefs.current.filter(Boolean) as HTMLDivElement[];
      chipEls.forEach((chip) => {
        chip.addEventListener('pointerenter', chipEnter);
        chip.addEventListener('pointerleave', chipLeave);
      });

      const tmp = new THREE.Vector3();
      let labelAlpha = 0;
      let active = false; // landed() result, refreshed on a throttle
      let landedT = 999; // forces an immediate landed check on the first frame
      let lastEngaged = -1e9; // timestamp of the last real engagement (for the grace window)
      const GRACE_MS = 480; // stay engaged briefly so you can move from the sphere onto a chip

      // Inverse of the overlay counter-scale: map a 0–100 coord about the centre so that, after the
      // overlay's 1/LAND_SCALE scale, it resolves to the same on-screen point it would have at 1:1.
      const m = (p: number) => 50 + (p - 50) * LAND_SCALE;
      const positionLabels = () => {
        for (let i = 0; i < skillNodes.length; i++) {
          const chip = chipRefs.current[i];
          const line = lineRefs.current[i];
          if (!chip) continue;
          skillNodes[i].getWorldPosition(tmp).project(camera);
          const lx = (tmp.x * 0.5 + 0.5) * 100;
          const ly = (1 - (tmp.y * 0.5 + 0.5)) * 100;
          // fan the chip outward from the planet centre
          let dx = lx - 50, dy = ly - 50;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len; dy /= len;
          const off = 16;
          const cx = lx + dx * off;
          const cy = ly + dy * off;
          chip.style.left = m(cx) + '%';
          chip.style.top = m(cy) + '%';
          // chips low on screen open their detail card upward so it doesn't clip off the bottom
          chip.classList.toggle('skill-up', cy > 58);
          chip.style.opacity = String(labelAlpha);
          // stay interactive well into the fade so chips remain grabbable as they linger
          chip.style.pointerEvents = labelAlpha > 0.2 ? 'auto' : 'none';
          if (line) {
            line.setAttribute('x1', String(m(lx)));
            line.setAttribute('y1', String(m(ly)));
            line.setAttribute('x2', String(m(cx)));
            line.setAttribute('y2', String(m(cy)));
            line.style.opacity = String(labelAlpha * 0.5);
          }
        }
      };

      // ---- render loop ----
      let raf = 0;
      let visible = true;
      let last = performance.now();
      const TWO_PI = Math.PI * 2;
      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        // Re-validate "is the planet landed/active" ~7×/sec; when it isn't, drop any latched
        // hover/pin so scrolling away always resumes the spin (it never sticks frozen).
        landedT += dt;
        if (landedT > 0.14) {
          landedT = 0;
          active = landed();
          if (!active) { hover = false; pinned = false; chipHoverCount = 0; }
        }

        const rawEngaged = hover || pinned || chipHoverCount > 0;
        if (rawEngaged) lastEngaged = now;
        // grace window bridges the gap between the sphere and a chip, so the labels don't fade
        // out before you can move the cursor onto a skill
        const engaged = active && (rawEngaged || now - lastEngaged < GRACE_MS);
        const k = Math.min(1, dt * 4);

        if (engaged) {
          // freeze: ease to the nearest full turn so the nodes face the camera (skills pose)
          const ty = Math.round(planet.rotation.y / TWO_PI) * TWO_PI;
          planet.rotation.y += (ty - planet.rotation.y) * k;
          planet.rotation.x += (-0.08 - planet.rotation.x) * k;
        } else {
          planet.rotation.y += dt * 0.18;
          planet.rotation.x += (0 - planet.rotation.x) * k;
          ring.rotation.z += dt * 0.06;
        }
        // labels fade IN fast but OUT slowly, so there's plenty of time to hover each skill
        const targetAlpha = engaged ? 1 : 0;
        labelAlpha += (targetAlpha - labelAlpha) * Math.min(1, dt * (targetAlpha > labelAlpha ? 6 : 1.7));

        const pulse = 1 + 0.18 * Math.sin(now * 0.004);
        skillNodes.forEach((m, i) => m.scale.setScalar(pulse + (engaged ? 0.25 : 0) + 0.05 * Math.sin(now * 0.005 + i)));
        skillMat.opacity = engaged ? 1 : 0.92;

        renderer.render(scene, camera);
        if (labelAlpha > 0.001) positionLabels();
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
        renderer.setSize(s.w * MAX_SCALE, s.h * MAX_SCALE, false);
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

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  if (failed) {
    return (
      <>
        <img src={PLANET_IMG} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 h-full w-full object-contain select-none" />
        <ul className="sr-only">
          {SKILLS.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong>: {s.desc}
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <div ref={mountRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {/* Skill constellation labels — positioned imperatively at each node's projected screen point.
          Counter-scaled (in the effect) by 1/LAND_SCALE so chips render at 1:1, not blown up by the planet. */}
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 overflow-visible">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {SKILLS.map((s, i) => (
            <line
              key={s.name}
              ref={(el) => (lineRefs.current[i] = el)}
              x1="50" y1="50" x2="50" y2="50"
              stroke="#22D3EE"
              strokeWidth="0.2"
              style={{ opacity: 0 }}
            />
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
              {/* Collapsed node pill — refined glass, subtle border, gentle lift on hover */}
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0a0916]/80 px-2.5 py-1 shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 group-hover/skill:-translate-y-0.5 group-hover/skill:border-[#22D3EE]/55 group-hover/skill:bg-[#0a0916]/95 group-hover/skill:shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                <Icon size={12} strokeWidth={2} className="shrink-0 text-[#22D3EE]/90" />
                <span className="whitespace-nowrap text-[12px] font-semibold tracking-wide text-[#dcd9ee]">{s.name}</span>
              </div>
              {/* Expanded glass detail card on hover; .skill-up (positionLabels) flips it above for low chips.
                  Its contents (icon, name, desc) fade + slide in with a slight stagger. */}
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
      {/* Accessible list for screen readers / keyboard (the visual reveal is a pointer enhancement) */}
      <ul className="sr-only">
        {SKILLS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong>: {s.desc}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Planet3D;
