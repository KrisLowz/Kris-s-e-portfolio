import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../constants';
import { buildShip, makeFlameTexture, makeGlowTexture } from './Spaceship3D';
import { makeStarLayer, makeNebulaTexture, makeStreakTexture, makePlanetTexture } from './Experience';

declare global { interface Window { gsap: any; ScrollTrigger: any } }

const THEME: Record<string, number> = { trackpoint: 0xf59e0b, cinemate: 0x8b5cf6, splashaquatics: 0x06b6d4 };
const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

const Projects: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [failed, setFailed] = useState(false);
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Step 1: mode state machine
  const modeRef = useRef<'cruise' | 'warpIn' | 'world' | 'warpOut'>('cruise');
  const worldIdxRef = useRef(-1);
  const [worldIdx, setWorldIdx] = useState(-1);
  const enterWorld = (i: number) => { worldIdxRef.current = i; modeRef.current = 'warpIn'; setWorldIdx(i); };
  const exitWorld = () => { modeRef.current = 'warpOut'; setWorldIdx(-1); };

  // scroll pin (mirror Experience.tsx): scrub writes progress for the 3D scene
  useEffect(() => {
    if (reduced) return;
    const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current, start: 'top top',
        end: () => '+=' + window.innerHeight * (window.innerWidth < 640 ? 2.4 : 3.2),
        scrub: 1, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
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

      // backdrop (reuse): 3 star layers + nebula (lighter than Experience — projects are the focus)
      const starDefs = [
        { n: 150, sx: 70, sy: 36, z0: -17, z1: -11, c: 0x8fa6ff, sz: 1.4, par: 0.02 },
        { n: 150, sx: 64, sy: 32, z0: -10, z1: -5, c: 0xbfe6ff, sz: 2.0, par: 0.05 },
        { n: 110, sx: 56, sy: 28, z0: -5, z1: -1.5, c: 0xeafcff, sz: 2.6, par: 0.09 },
      ];
      const starLayers = starDefs.map((d) => { const L = makeStarLayer(THREE, isMobile ? Math.round(d.n * 0.6) : d.n, d.sx, d.sy, d.z0, d.z1, d.c, d.sz); track(L.geo); track(L.mat); scene.add(L.points); return { ...L, par: d.par }; });

      // ship escorts bottom-left (reuse hero model)
      const { ship, flames } = buildShip(THREE, isMobile, track, flameTex);
      ship.scale.setScalar(0.7); scene.add(ship);
      const SHIP_BASE = new THREE.Vector3(-3.6, -1.9, 2.6);

      // portal rail
      const STEP = 8;
      const rail = new THREE.Group(); scene.add(rail);
      const RAIL_A = 4, RAIL_B = -(STEP * PROJECTS.length + 4);
      const builtPortals = PROJECTS.map((p, i) => {
        const accent = THEME[p.id] ?? 0x22d3ee;
        const g = new THREE.Group(); g.position.x = i * STEP;
        // segmented neon ring = torus + a thinner bright inner torus
        const ringMat = track(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 }));
        const ring = new THREE.Mesh(track(new THREE.TorusGeometry(1.4, 0.12, 16, 64)), ringMat); g.add(ring);
        const innerMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
        const inner = new THREE.Mesh(track(new THREE.TorusGeometry(1.18, 0.03, 12, 64)), innerMat); g.add(inner);
        // event-horizon disc (additive glow) that brightens when active
        const glowMat = track(new THREE.SpriteMaterial({ map: glowTex, color: accent, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
        const glow = new THREE.Sprite(glowMat); glow.scale.set(3.2, 3.2, 1); glow.position.z = -0.2; g.add(glow);
        rail.add(g);
        const hit = new THREE.Mesh(track(new THREE.SphereGeometry(1.5, 8, 8)), track(new THREE.MeshBasicMaterial({ visible: false }))); hit.position.x = i * STEP; rail.add(hit);
        return { group: g, ring, glow, glowMat, idx: i, hit, accent };
      });

      // Step 3: wormhole warp tunnel
      const warpTex = track(makeStreakTexture(THREE));
      const warpMat = track(new THREE.MeshBasicMaterial({ map: warpTex, color: 0x9be6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      const warpTunnel = new THREE.Mesh(track(new THREE.CylinderGeometry(0.2, 3.5, 14, 24, 1, true)), warpMat);
      warpTunnel.rotation.x = Math.PI / 2; warpTunnel.visible = false; scene.add(warpTunnel);
      let warpT = 0;

      // Step 2: raycaster + NDC vector for click routing
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();

      const onPointerDown = (e: PointerEvent) => {
        const el = e.target as HTMLElement | null;
        if (el && el.closest('a, button, [data-exp-ui]')) return;
        if (modeRef.current !== 'cruise') return;
        const rect = canvas.getBoundingClientRect(); if (!rect.width) return;
        const fx = (e.clientX - rect.left) / rect.width, fy = (e.clientY - rect.top) / rect.height;
        if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;
        ndc.set(fx * 2 - 1, -(fy * 2 - 1)); raycaster.setFromCamera(ndc, camera);
        const hitResult = raycaster.intersectObjects(builtPortals.map((b) => b.hit), false)[0];
        if (hitResult) { const idx = builtPortals.findIndex((b) => b.hit === hitResult.object); const worldX = idx * STEP + rail.position.x; if (Math.abs(worldX) < 3) enterWorld(idx); }
      };
      window.addEventListener('pointerdown', onPointerDown);

      const tmp = new THREE.Vector3();
      let raf = 0, visible = true, last = performance.now();
      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = now * 0.001;
        const p = progressRef.current;

        // Step 4: mode machine
        const mode = modeRef.current;
        if (mode === 'warpIn') { warpT = Math.min(1, warpT + dt / 0.6); if (warpT >= 1) modeRef.current = 'world'; }
        else if (mode === 'warpOut') { warpT = Math.max(0, warpT - dt / 0.5); if (warpT <= 0) { modeRef.current = 'cruise'; worldIdxRef.current = -1; } }

        // warp visuals
        warpTunnel.visible = warpT > 0.01;
        warpMat.opacity = Math.sin(Math.min(1, warpT) * Math.PI) * 0.8;
        warpTunnel.position.z = 6 - warpT * 12;
        warpTunnel.rotation.y += dt * 6;

        // camera: cruise base, pushed forward (into the portal) by warpT, settling in 'world'
        const camZ = 10 - warpT * 7;
        camera.position.set(0, 1.3 - warpT * 0.6, camZ); camera.lookAt(0, 0, 0);

        // hide cruise actors while in world
        const inWorld = mode === 'world' || warpT > 0.5;
        rail.visible = !inWorld; ship.visible = !inWorld;

        if (!inWorld) {
          // cruise-only updates (Task 2)
          rail.position.x = RAIL_A + p * (RAIL_B - RAIL_A);
          const railX = rail.position.x;
          for (const L of starLayers) { L.mat.uniforms.uTime.value = t; L.points.position.x = -railX * L.par; }
          ship.position.set(SHIP_BASE.x, SHIP_BASE.y + Math.sin(t * 1.4) * 0.12, SHIP_BASE.z);
          ship.rotation.set(Math.sin(t * 0.9) * 0.05, 0, Math.sin(t * 1.1) * 0.06);
          const flick = 0.8 + 0.2 * Math.sin(t * 26);
          flames.forEach((fl: any) => { fl.scale.set(0.7 * flick, 0.5 * flick, 1); fl.material.opacity = 0.85; });
          let activeIdx = -1, bestAbs = 3;
          builtPortals.forEach((pt) => {
            const worldX = pt.idx * STEP + railX;
            const act = Math.max(0, 1 - Math.abs(worldX) / 3);
            if (Math.abs(worldX) < bestAbs) { bestAbs = Math.abs(worldX); activeIdx = act > 0.4 ? pt.idx : activeIdx; }
            pt.group.scale.setScalar(0.7 + act * 0.4);
            pt.group.rotation.z += dt * (0.2 + act * 0.5);
            pt.glowMat.opacity = 0.15 + act * 0.5;
            // preview card position (HTML)
            const card = previewRefs.current[pt.idx];
            if (card) { pt.group.getWorldPosition(tmp).project(camera); card.style.left = (tmp.x * 0.5 + 0.5) * 100 + '%'; card.style.top = (1 - (tmp.y * 0.5 + 0.5)) * 100 + '%'; card.style.opacity = String(act); card.style.pointerEvents = act > 0.5 ? 'auto' : 'none'; }
          });
        } else {
          // hide all preview cards while in world
          previewRefs.current.forEach((card) => { if (card) { card.style.opacity = '0'; card.style.pointerEvents = 'none'; } });
          // still animate star layers (subtle parallax keeps scene alive)
          for (const L of starLayers) { L.mat.uniforms.uTime.value = t; }
        }

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
        canvas.removeEventListener('webglcontextlost', onContextLost);
        // Step 6: remove click router
        window.removeEventListener('pointerdown', onPointerDown);
        disposables.forEach((d) => { try { (d as any).dispose && (d as any).dispose(); } catch {} });
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        try { renderer.forceContextLoss(); } catch {}
        renderer.dispose();
      };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [reduced]);

  if (reduced || failed) {
    return (
      <section id="projects" aria-labelledby="proj-heading" className="relative w-full bg-[#05030f] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
          <h2 id="proj-heading" className="mt-4 font-display text-4xl font-extrabold text-[#F5F3FF] sm:text-6xl">Worlds I&apos;ve built</h2>
          <div className="mt-12 space-y-16">
            {PROJECTS.map((p) => (
              <article key={p.id} className="rounded-3xl border border-white/10 bg-[#0a0814]/80 p-6 sm:p-8">
                <h3 className="font-display text-2xl font-extrabold text-[#F5F3FF]">{p.title}</h3>
                <p className="text-[#22D3EE]">{p.subtitle}</p>
                <p className="mt-3 text-[#A8A3C2]">{p.overview}</p>
                {p.achievements?.length ? (
                  <ul className="mt-4 space-y-1 text-sm text-[#dcd9ee]">{p.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                ) : null}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF2BD6]">Challenges</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#A8A3C2]">{p.challenges?.map((c) => <li key={c}>{c}</li>)}</ul></div>
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]">Solutions</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#A8A3C2]">{p.solutions?.map((s) => <li key={s}>{s}</li>)}</ul></div>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">{p.tags.map((t) => <li key={t} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-3 py-1 text-xs font-semibold text-[#dffaff]">{t}</li>)}</ul>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {p.screenshots.slice(0, 8).map((s) => <img key={s} src={s} alt="" loading="lazy" className="aspect-[9/16] w-full rounded-lg object-cover" />)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} id="projects" aria-labelledby="proj-heading" className="relative bg-[#05030f]">
      <div ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-[#05030f]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,#0a0a24_0%,#06051a_50%,#03020c_100%)]" />
        <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
        {PROJECTS.map((p, i) => (
          <div key={p.id} ref={(el) => (previewRefs.current[i] = el)} className="absolute z-20 w-64 -translate-x-1/2 -translate-y-[150%]" style={{ left: '50%', top: '50%', opacity: 0, pointerEvents: 'none' }}>
            <div data-exp-ui className="rounded-2xl border border-white/12 bg-[#0a0814]/90 p-4 text-center shadow-[0_16px_44px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <h3 className="font-display text-lg font-extrabold text-[#F5F3FF]">{p.title}</h3>
              <p className="text-sm text-[#22D3EE]">{p.subtitle}</p>
              <ul className="mt-2 flex flex-wrap justify-center gap-1.5">{p.tags.slice(0, 4).map((t) => <li key={t} className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-[#dcd9ee]">{t}</li>)}</ul>
              <button data-exp-ui onClick={() => enterWorld(i)} className="proj-enter mt-3 rounded-full border border-[#22D3EE]/50 bg-[#22D3EE]/10 px-4 py-1.5 text-xs font-bold text-[#22D3EE]" data-idx={i}>▶ Enter</button>
            </div>
          </div>
        ))}
        {/* Step 5: Project World HTML shell */}
        {worldIdx >= 0 && (() => { const p = PROJECTS[worldIdx]; const accent = hex(THEME[p.id] ?? 0x22d3ee); return (
          <div data-exp-ui className="absolute inset-0 z-30 overflow-y-auto px-6 py-16 sm:px-12">
            <div className="mx-auto max-w-3xl">
              <button data-exp-ui onClick={exitWorld} className="mb-6 rounded-full border border-white/15 px-4 py-1.5 text-xs font-bold text-[#C3BFD6] hover:bg-white/10">← Exit</button>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{p.subtitle}</p>
              <h3 className="mt-1 font-display text-3xl font-extrabold text-[#F5F3FF] sm:text-5xl">{p.title}</h3>
              {p.achievements?.length ? <ul className="mt-4 space-y-1 text-sm text-[#ffe8a3]">{p.achievements.map((a) => <li key={a}>{a}</li>)}</ul> : null}
              <p className="mt-5 leading-relaxed text-[#C3BFD6]">{p.overview}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#FF2BD6]/25 bg-[#160a18]/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF2BD6]">The challenge</p><ul className="mt-2 space-y-2 text-sm text-[#A8A3C2]">{p.challenges?.map((c) => <li key={c}>{c}</li>)}</ul></div>
                <div className="rounded-2xl border border-[#22D3EE]/25 bg-[#08161a]/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]">The solution</p><ul className="mt-2 space-y-2 text-sm text-[#A8A3C2]">{p.solutions?.map((s) => <li key={s}>{s}</li>)}</ul></div>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#22D3EE]/80">Tech deployed</p>
              <div className="mt-2 space-y-2">{p.techStackDetails?.map((g) => (<div key={g.category} className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase text-[#7c5cff]">{g.category}</span>{g.tools.map((t) => <span key={t} className="rounded-full border border-[#22D3EE]/40 bg-[#0a0820]/70 px-2.5 py-0.5 text-[11px] font-semibold text-[#dffaff]">{t}</span>)}</div>))}</div>
              <div id="proj-carousel-slot" className="mt-10" />
            </div>
          </div>
        ); })()}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-16 sm:px-10 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
          <h2 id="proj-heading" className="mt-3 font-display text-4xl font-extrabold leading-tight text-[#F5F3FF] sm:text-6xl">Worlds I&apos;ve built</h2>
        </div>
        <ul className="sr-only">{PROJECTS.map((p) => <li key={p.id}><strong>{p.title}</strong>: {p.overview}</li>)}</ul>
      </div>
    </section>
  );
};

export default Projects;
