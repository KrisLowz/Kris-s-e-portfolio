import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, MessageCircle, Brain, Repeat2, Users, Timer, ListChecks } from 'lucide-react';
import { buildShip, makeFlameTexture } from './Spaceship3D';

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

// A glowing ring (hot core → transparent) for the meteor's destruction shockwave.
function makeRingTexture(THREE: any) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,0)');
  g.addColorStop(0.62, 'rgba(255,150,60,0)');
  g.addColorStop(0.8, 'rgba(255,210,140,0.95)');
  g.addColorStop(0.9, 'rgba(255,120,40,0.55)');
  g.addColorStop(1.0, 'rgba(255,90,20,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// Soft galaxy/nebula for the skills universe (cyan core → violet → magenta falloff).
function makeNebulaTexture(THREE: any) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(196,232,255,0.5)');
  g.addColorStop(0.32, 'rgba(124,92,255,0.3)');
  g.addColorStop(0.62, 'rgba(255,43,214,0.12)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// Scroll-progress phases of the journey (shared with Journey's GSAP timeline). About (planet + copy)
// plays over [0, ABOUT_END]; the camera turns right into the skills universe over [TURN_START, TURN_END].
export const PHASES = { ABOUT_END: 0.5, TURN_START: 0.62, TURN_END: 0.82 };

// The 17 technical skills that crystallise in the skills universe (two waves: languages, then tools).
// `dev` = the Devicon icon-font class (the font + CSS are already loaded in index.html, so the glyph is
// available with no runtime network fetch). Empty `dev` falls back to the short name as text.
export const TECH_SKILLS: { name: string; short: string; desc: string; color: string; dev: string; group: 'lang' | 'tool' }[] = [
  { name: 'HTML5', short: 'HTML', desc: 'The semantic, accessible backbone of every interface I build.', color: '#E34F26', dev: 'devicon-html5-plain', group: 'lang' },
  { name: 'CSS3', short: 'CSS', desc: 'Layout, motion, and responsive design — where structure becomes experience.', color: '#1572B6', dev: 'devicon-css3-plain', group: 'lang' },
  { name: 'JavaScript', short: 'JS', desc: 'My go-to for interactivity, from DOM logic to async APIs.', color: '#F7DF1E', dev: 'devicon-javascript-plain', group: 'lang' },
  { name: 'Python', short: 'PY', desc: 'My toolkit for backends, scripting, and data-heavy problem solving.', color: '#3776AB', dev: 'devicon-python-plain', group: 'lang' },
  { name: 'Java', short: 'Java', desc: 'OOP fundamentals and robust application logic from my CS foundation.', color: '#5382A1', dev: 'devicon-java-plain', group: 'lang' },
  { name: 'C++', short: 'C++', desc: 'Low-level performance and the algorithms that taught me how machines think.', color: '#00599C', dev: 'devicon-cplusplus-plain', group: 'lang' },
  { name: 'C#', short: 'C#', desc: 'Strongly-typed application development across the .NET ecosystem.', color: '#9B4F96', dev: 'devicon-csharp-plain', group: 'lang' },
  { name: 'SQL', short: 'SQL', desc: 'Designing and querying relational data with precision.', color: '#E38C00', dev: 'devicon-azuresqldatabase-plain', group: 'lang' },
  { name: 'Figma', short: 'Figma', desc: 'Where I prototype and design before a single line of code.', color: '#F24E1E', dev: 'devicon-figma-plain', group: 'tool' },
  { name: 'Tailwind CSS', short: 'TW', desc: 'Utility-first styling for fast, consistent, maintainable UIs.', color: '#06B6D4', dev: 'devicon-tailwindcss-original', group: 'tool' },
  { name: 'PostgreSQL', short: 'PSQL', desc: 'Production-grade relational databases for real-world data.', color: '#4169E1', dev: 'devicon-postgresql-plain', group: 'tool' },
  { name: 'Firebase', short: 'FB', desc: 'Realtime data, auth, and hosting for shipping apps fast.', color: '#FFCA28', dev: 'devicon-firebase-plain', group: 'tool' },
  { name: 'Kotlin', short: 'KT', desc: 'Modern, expressive Android development.', color: '#7F52FF', dev: 'devicon-kotlin-plain', group: 'tool' },
  { name: 'Flutter', short: 'Flutter', desc: 'Cross-platform apps from one codebase — my mobile framework of choice.', color: '#02569B', dev: 'devicon-flutter-plain', group: 'tool' },
  { name: 'Android', short: 'Android', desc: "Native mobile development for the world's biggest platform.", color: '#3DDC84', dev: 'devicon-android-plain', group: 'tool' },
  { name: 'Git', short: 'Git', desc: 'Version control and collaboration: the spine of every project.', color: '#F05032', dev: 'devicon-git-plain', group: 'tool' },
  { name: 'VS Code', short: 'Code', desc: 'My daily driver, tuned for speed and flow.', color: '#007ACC', dev: 'devicon-vscode-plain', group: 'tool' },
];

// The Devicon slug for a skill (e.g. 'devicon-cplusplus-plain' -> 'cplusplus'); names the local SVG file.
export const iconSlug = (dev: string) => dev.replace(/^devicon-/, '').replace(/-(plain|original|line|wordmark).*$/, '');

// A transparent CanvasTexture holding a crystal's logo, drawn from its committed local SVG
// (/assets/tech-icons/<slug>.svg — same-origin, so no taint and no network needed). It rides a sprite
// placed INSIDE the gem and drawn before the glass body, so the translucent facets render over it.
// Guarded so a late draw after unmount doesn't touch a disposed texture.
function makeIconTexture(THREE: any, slug: string, isCancelled: () => boolean) {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  if (typeof document === 'undefined') return tex;
  const img = new Image();
  img.onload = () => {
    if (isCancelled()) return;
    ctx.clearRect(0, 0, size, size);
    const pad = 10;
    ctx.drawImage(img, pad, pad, size - 2 * pad, size - 2 * pad);
    tex.needsUpdate = true;
  };
  img.src = '/assets/tech-icons/' + slug + '.svg';
  return tex;
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
  const [focused, setFocused] = useState(-1); // index of the crystal whose detail card is open (-1 = none)
  const focusRef = useRef(-1); // mirror read by the render loop (no stale closure)

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

      // ---- skills universe (revealed by the 90° camera turn toward +X) ----
      // A starfield spread across the world (parallax/depth as the camera turns) + a nebula marking the
      // destination. Both fade in during the turn; the tech-skill crystals will live here (M3).
      const STAR_N = isMobile ? 280 : 560;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(STAR_N * 3);
      for (let i = 0; i < STAR_N; i++) {
        starPos[i * 3] = -10 + Math.random() * 46; // x: biased toward +X (skills direction)
        starPos[i * 3 + 1] = -22 + Math.random() * 44; // y
        starPos[i * 3 + 2] = -24 + Math.random() * 42; // z
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xcfeaff, size: isMobile ? 0.09 : 0.07, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      const SKILLS_X = 13; // the skills destination sits to the camera's right
      const nebTex = makeNebulaTexture(THREE);
      const nebMat = new THREE.SpriteMaterial({ map: nebTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const nebula = new THREE.Sprite(nebMat);
      nebula.scale.set(22, 22, 1);
      nebula.position.set(SKILLS_X, 0, 7);
      scene.add(nebula);

      // ---- the 17 tech-skill crystals: smaller brand-tinted gems on a flat plane below the heading.
      // The logo sprite sits INSIDE the gem (drawn before the glass body via renderOrder, so the translucent
      // facets + edges render over it). Once settled they're a draggable physics field (spring to home,
      // collide/bounce, walls keep them on-screen). ----
      const VFOV = (40 * Math.PI) / 180;
      const crystalsGroup = new THREE.Group();
      crystalsGroup.visible = false;
      scene.add(crystalsGroup);
      const cGeo = new THREE.OctahedronGeometry(0.5, 0); // ~20% smaller gem
      const cEdgeGeo = new THREE.EdgesGeometry(cGeo);
      const crystals: any[] = [];
      const crystalMats: any[] = [];
      const iconTexes: any[] = [];
      const crystalHits: any[] = [];
      const hitGeo = new THREE.SphereGeometry(0.85, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const CRYS_DEPTH = 11, CRYS_R = 0.62, CRYS_COLS = 6, COL_GAP = 2.05, ROW_GAP = 1.5, Y_TOP = 1.15;
      const rowCounts: number[] = [];
      for (let r = 0; r * CRYS_COLS < TECH_SKILLS.length; r++) rowCounts.push(Math.min(CRYS_COLS, TECH_SKILLS.length - r * CRYS_COLS));
      TECH_SKILLS.forEach((skill, i) => {
        const row = Math.floor(i / CRYS_COLS), col = i % CRYS_COLS;
        const n = rowCounts[row];
        const homeY = Y_TOP - row * ROW_GAP;
        const homeZ = 7 + (col - (n - 1) / 2) * COL_GAP;
        const g = new THREE.Group();
        g.position.set(CRYS_DEPTH, homeY, homeZ); // flat plane (no depth variation → clean physics + bounds)
        g.rotation.y = Math.random() * Math.PI;
        const color = new THREE.Color(skill.color);
        // glow (behind) → icon → glass body → edges, so the translucent body tints the logo from in front
        const cgMat = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        const cglow = new THREE.Sprite(cgMat); cglow.scale.set(2.2, 2.2, 1); cglow.position.z = -0.15; cglow.renderOrder = 0; g.add(cglow);
        const iconTex = makeIconTexture(THREE, iconSlug(skill.dev), () => cancelled);
        const iconMat = new THREE.SpriteMaterial({ map: iconTex, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
        const icon = new THREE.Sprite(iconMat); icon.scale.set(0.528, 0.528, 1); icon.renderOrder = 1; g.add(icon);
        const bodyMat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0, roughness: 0.12, metalness: 0.25, emissive: color, emissiveIntensity: 0.2, flatShading: true, depthWrite: false, side: THREE.DoubleSide });
        const body = new THREE.Mesh(cGeo, bodyMat); body.renderOrder = 2; g.add(body);
        const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        const edges = new THREE.LineSegments(cEdgeGeo, edgeMat); edges.renderOrder = 3; body.add(edges);
        const hitProxy = new THREE.Mesh(hitGeo, hitMat); g.add(hitProxy); crystalHits.push(hitProxy);
        crystalsGroup.add(g);
        crystals.push({ body, bodyMat, edgeMat, iconMat, cgMat, g, gridPos: new THREE.Vector3(CRYS_DEPTH, homeY, homeZ), homeY, homeZ, py: homeY, pz: homeZ, vy: 0, vz: 0, r: CRYS_R, spin: 0.18 + (i % 3) * 0.05, arc: (Math.random() - 0.5) * 2.0, delay: (i % CRYS_COLS) * 0.015, hoverT: 0 });
        crystalMats.push(bodyMat, edgeMat, iconMat, cgMat);
        iconTexes.push(iconTex);
      });

      // ---- the big meteor: hurtles in during the turn, then SHATTERS into the crystals (v2 cinematic).
      // Scrubbed: scroll forward = meteor flies in → explodes → fragments fly out to the grid; reverse = re-forms.
      const MET_FLY0 = 0.64, MET_FLY1 = 0.80, SHA0 = 0.87, SHA1 = 0.975;
      const meteorCenterV = new THREE.Vector3(CRYS_DEPTH, -0.2, 7);
      const meteorStartV = new THREE.Vector3(CRYS_DEPTH + 5, 8.5, 7 + 15);
      const meteorGeo = new THREE.IcosahedronGeometry(1.7, 1);
      {
        const mp = meteorGeo.attributes.position, v = new THREE.Vector3();
        for (let i = 0; i < mp.count; i++) { v.fromBufferAttribute(mp, i); v.multiplyScalar(1 + (Math.sin(v.x * 3.3) + Math.cos(v.y * 4.1) + Math.sin(v.z * 5.2)) * 0.13); mp.setXYZ(i, v.x, v.y, v.z); }
        meteorGeo.computeVertexNormals();
      }
      const meteorMat = new THREE.MeshStandardMaterial({ color: 0x1b140d, roughness: 1, metalness: 0, emissive: 0xff4a12, emissiveIntensity: 0, flatShading: true });
      const meteor = new THREE.Mesh(meteorGeo, meteorMat);
      const meteorGlowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xff5a18, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const meteorGlow = new THREE.Sprite(meteorGlowMat); meteorGlow.scale.set(7.5, 7.5, 1);
      const meteorGroup = new THREE.Group(); meteorGroup.visible = false; meteorGroup.add(meteor); meteorGroup.add(meteorGlow);
      scene.add(meteorGroup);

      // ---- meteor fragments: chunks of rock that burst out when the laser cracks it open ("break into pieces") ----
      const fragGeo = new THREE.IcosahedronGeometry(1, 0);
      { const fp = fragGeo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < fp.count; i++) { v.fromBufferAttribute(fp, i); v.multiplyScalar(1 + (Math.sin(v.x * 5) + Math.cos(v.z * 6)) * 0.24); fp.setXYZ(i, v.x, v.y, v.z); } fragGeo.computeVertexNormals(); }
      const fragMat = new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 1, metalness: 0, emissive: 0xff5212, emissiveIntensity: 0.55, flatShading: true });
      const FRAG_N = isMobile ? 11 : 18;
      const frags: any[] = [];
      for (let i = 0; i < FRAG_N; i++) {
        const m = new THREE.Mesh(fragGeo, fragMat); m.visible = false;
        const base = 0.16 + Math.random() * 0.32; m.scale.setScalar(base);
        const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        scene.add(m);
        frags.push({ m, base, dir: new THREE.Vector3(s * Math.cos(th), u, s * Math.sin(th)), dist: 3.5 + Math.random() * 7, spin: new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7), delay: Math.random() * 0.12 });
      }

      const DEBRIS_N = isMobile ? 70 : 120;
      const debrisGeo = new THREE.BufferGeometry();
      const debrisPos = new Float32Array(DEBRIS_N * 3);
      const debrisDir = new Float32Array(DEBRIS_N * 4); // dir.xyz + travel distance
      for (let i = 0; i < DEBRIS_N; i++) {
        const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        debrisDir[i * 4] = s * Math.cos(th); debrisDir[i * 4 + 1] = u; debrisDir[i * 4 + 2] = s * Math.sin(th); debrisDir[i * 4 + 3] = 3 + Math.random() * 8;
        debrisPos[i * 3] = meteorCenterV.x; debrisPos[i * 3 + 1] = meteorCenterV.y; debrisPos[i * 3 + 2] = meteorCenterV.z;
      }
      debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPos, 3));
      const debrisMat = new THREE.PointsMaterial({ color: 0xffb070, size: isMobile ? 0.12 : 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
      const debris = new THREE.Points(debrisGeo, debrisMat); debris.visible = false;
      scene.add(debris);

      // ---- the drama: a spaceship weaves in dodging small meteors, then fires on the big one ----
      const SHIP0 = 0.66, FIRE0 = 0.81, SHIP_OUT0 = 0.885, SHIP_OUT1 = 0.99;
      const _yAxis = new THREE.Vector3(0, 1, 0);
      // the actual 3D cat-ship (shared with the hero scene). Model faces +X; it travels +Z here, so we yaw it.
      const shipDisposables: any[] = [];
      const trackShip = <T,>(o: T): T => { shipDisposables.push(o); return o; };
      const flameTex = makeFlameTexture(THREE);
      const { ship, flames: shipFlames } = buildShip(THREE, isMobile, trackShip, flameTex);
      const SHIP_SCALE = 0.78;
      ship.visible = false;
      scene.add(ship);
      // a follow-light so the hull reads bright (the scene's planet lights are dim/coloured); ramped with the ship
      const shipLight = new THREE.PointLight(0xdcefff, 0, 20, 1.1); scene.add(shipLight);

      const smallGeo = new THREE.IcosahedronGeometry(0.34, 0);
      { const sp = smallGeo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < sp.count; i++) { v.fromBufferAttribute(sp, i); v.multiplyScalar(1 + (Math.sin(v.x * 6) + Math.cos(v.y * 7)) * 0.2); sp.setXYZ(i, v.x, v.y, v.z); } smallGeo.computeVertexNormals(); }
      const smallMat = new THREE.MeshStandardMaterial({ color: 0x2a211a, roughness: 1, metalness: 0, emissive: 0x933008, emissiveIntensity: 0.5, flatShading: true });
      const smalls: any[] = [];
      for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(smallGeo, smallMat); m.visible = false; scene.add(m); smalls.push({ m, z0: 12 + i * 2.5, y: [2.1, -1.3, 0.7][i], spd: 1 + i * 0.3, off: i * 0.18 }); }

      // laser: a bright core beam + a soft outer glow tube, plus a muzzle flash and an impact burst
      const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xeafdff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const beam = new THREE.Mesh(beamGeo, beamMat); beam.visible = false; scene.add(beam);
      const beamGlowGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
      const beamGlowMat = new THREE.MeshBasicMaterial({ color: 0x49e8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const beamGlow = new THREE.Mesh(beamGlowGeo, beamGlowMat); beamGlow.visible = false; scene.add(beamGlow);
      const muzzleMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xbafaff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const muzzle = new THREE.Sprite(muzzleMat); muzzle.visible = false; scene.add(muzzle);
      const impactMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffd070, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const impact = new THREE.Sprite(impactMat); impact.visible = false; scene.add(impact);
      // final-blast FX: a white flash + an expanding shockwave ring (peak right on the kill)
      const flashMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const flash = new THREE.Sprite(flashMat); flash.visible = false; scene.add(flash);
      const blastRingTex = makeRingTexture(THREE);
      const blastRingMat = new THREE.SpriteMaterial({ map: blastRingTex, color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const blastRing = new THREE.Sprite(blastRingMat); blastRing.visible = false; scene.add(blastRing);

      // ---- interaction (freeze + reveal constellation when the cursor is over the actual sphere) ----
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      // Constellation is interactive only once the planet has settled (About sub-progress > 0.93) AND
      // before the camera starts turning away to the skills universe.
      const landed = () => { const p = progressRef.current; return p / PHASES.ABOUT_END > 0.93 && p < PHASES.TURN_START; };
      let hover = false;
      let pinned = false;
      let chipHoverCount = 0;

      const setNdc = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
        return true;
      };
      const hitsPlanet = (clientX: number, clientY: number) => {
        if (!setNdc(clientX, clientY)) return false;
        raycaster.setFromCamera(ndc, camera);
        return raycaster.intersectObject(bodyMesh, false).length > 0;
      };
      // skills crystals are interactive once they've mostly settled out of the meteor shatter
      const skillsSettled = () => (progressRef.current - SHA0) / (SHA1 - SHA0) > 0.8;
      const hitsCrystal = (clientX: number, clientY: number) => {
        if (!setNdc(clientX, clientY)) return -1;
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(crystalHits, false)[0];
        return hit ? crystalHits.indexOf(hit.object) : -1;
      };
      // map a screen point onto the crystals' plane (x = CRYS_DEPTH) so a drag follows the cursor
      const dragPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -CRYS_DEPTH);
      const planeHit = new THREE.Vector3();
      const cursorOnPlane = (clientX: number, clientY: number) => {
        if (!setNdc(clientX, clientY)) return null;
        raycaster.setFromCamera(ndc, camera);
        return raycaster.ray.intersectPlane(dragPlane, planeHit);
      };
      let hoverIdx = -1;
      // tap-vs-drag: press a crystal; move past a small threshold → drag (throw + bounce others); else tap → card
      let dragIdx = -1, dragTY = 0, dragTZ = 0;
      let downIdx = -1, downX = 0, downY = 0;
      const onPointerDown = (e: PointerEvent) => {
        if (focusRef.current >= 0 || !skillsSettled()) return;
        const ci = hitsCrystal(e.clientX, e.clientY);
        if (ci >= 0) { downIdx = ci; downX = e.clientX; downY = e.clientY; dragIdx = -1; (canvas as any).setPointerCapture?.(e.pointerId); }
      };
      const onPointerMove = (e: PointerEvent) => {
        if (focusRef.current >= 0) { mount.style.cursor = 'pointer'; return; }
        if (downIdx >= 0) {
          if (dragIdx < 0 && Math.hypot(e.clientX - downX, e.clientY - downY) > 6) dragIdx = downIdx; // promote to a drag
          if (dragIdx >= 0) {
            const p = cursorOnPlane(e.clientX, e.clientY);
            if (p) { dragTY = p.y; dragTZ = p.z; }
            mount.style.cursor = 'grabbing';
          }
          return;
        }
        if (e.pointerType === 'touch') return;
        hover = landed() && hitsPlanet(e.clientX, e.clientY);
        hoverIdx = !hover && skillsSettled() ? hitsCrystal(e.clientX, e.clientY) : -1;
        mount.style.cursor = hover ? 'pointer' : hoverIdx >= 0 ? 'grab' : '';
      };
      const onPointerLeave = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        hover = false; hoverIdx = -1;
        if (dragIdx < 0) downIdx = -1;
        mount.style.cursor = '';
      };
      const onPointerUp = (e: PointerEvent) => {
        (canvas as any).releasePointerCapture?.(e.pointerId);
        if (focusRef.current >= 0) return; // the detail-card overlay handles closing
        if (dragIdx >= 0) { dragIdx = -1; downIdx = -1; return; } // release a throw — its momentum carries on
        if (downIdx >= 0) { const ci = downIdx; downIdx = -1; focusRef.current = ci; setFocused(ci); return; } // tap → card
        if (e.pointerType === 'touch' && landed() && hitsPlanet(e.clientX, e.clientY)) pinned = !pinned;
      };
      canvas.addEventListener('pointerdown', onPointerDown);
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
      const _v1 = new THREE.Vector3();
      const _v2 = new THREE.Vector3();
      const _tA = new THREE.Vector3();
      const _tB = new THREE.Vector3();
      const _quat = new THREE.Quaternion();
      let copyEl: HTMLElement | null = null; // the About copy, carried through the camera turn (looked up lazily)
      let focusT = 0; // 0..1 zoom-to-crystal animation
      let lastFocusIdx = -1;
      let labelAlpha = 0;
      let lastEngaged = -1e9;
      const GRACE_MS = 480;

      // ---- crystal physics (active once settled): spring to home, collide/bounce, walls keep them on-screen ----
      const runCrystalPhysics = (dt: number) => {
        const pdt = Math.min(dt, 0.03);
        const halfH = Math.tan(VFOV * 0.5) * CRYS_DEPTH;
        const halfW = halfH * (mount.clientWidth / Math.max(1, mount.clientHeight));
        const yTop = 1.3, yBot = -(halfH - CRYS_R - 0.15); // top wall stays below the heading
        const zMin = 7 - (halfW - CRYS_R - 0.15), zMax = 7 + (halfW - CRYS_R - 0.15);
        const fixed = (i: number) => i === dragIdx || i === focusRef.current;
        for (let i = 0; i < crystals.length; i++) {
          const cr = crystals[i];
          if (i === focusRef.current) { cr.vy = cr.vz = 0; continue; } // hold the focused gem still under the camera
          if (i === dragIdx) {
            // responsive follow with a touch of lag (swing); track velocity so a release throws it
            const f = Math.min(1, 24 * pdt);
            const ny = cr.py + (dragTY - cr.py) * f, nz = cr.pz + (dragTZ - cr.pz) * f;
            cr.vy = (ny - cr.py) / pdt; cr.vz = (nz - cr.pz) / pdt;
            cr.py = ny; cr.pz = nz;
            continue;
          }
          cr.vy += (cr.homeY - cr.py) * 9 * pdt; cr.vz += (cr.homeZ - cr.pz) * 9 * pdt; // spring back to its slot
          cr.vy *= 0.88; cr.vz *= 0.88;
          cr.py += cr.vy * pdt; cr.pz += cr.vz * pdt;
        }
        for (let a = 0; a < crystals.length; a++) {
          for (let b = a + 1; b < crystals.length; b++) {
            const A = crystals[a], B = crystals[b];
            const dy = B.py - A.py, dz = B.pz - A.pz;
            const d = Math.hypot(dy, dz), min = A.r + B.r;
            if (d > 1e-4 && d < min) {
              const nx = dy / d, nz = dz / d, overlap = min - d;
              const aFix = fixed(a), bFix = fixed(b);
              if (aFix && !bFix) { B.py += nx * overlap; B.pz += nz * overlap; }
              else if (bFix && !aFix) { A.py -= nx * overlap; A.pz -= nz * overlap; }
              else if (!aFix && !bFix) { A.py -= nx * overlap * 0.5; A.pz -= nz * overlap * 0.5; B.py += nx * overlap * 0.5; B.pz += nz * overlap * 0.5; }
              const rel = (B.vy - A.vy) * nx + (B.vz - A.vz) * nz; // closing speed along the contact normal
              if (rel < 0) {
                const e = 0.6;
                if (aFix && !bFix) { const j = -(1 + e) * rel; B.vy += j * nx; B.vz += j * nz; }
                else if (bFix && !aFix) { const j = -(1 + e) * rel; A.vy -= j * nx; A.vz -= j * nz; }
                else if (!aFix && !bFix) { const j = -(1 + e) * rel * 0.5; A.vy -= j * nx; A.vz -= j * nz; B.vy += j * nx; B.vz += j * nz; }
              }
            }
          }
        }
        for (let i = 0; i < crystals.length; i++) {
          const cr = crystals[i];
          if (fixed(i)) continue;
          if (cr.py < yBot) { cr.py = yBot; cr.vy = Math.abs(cr.vy) * 0.55; }
          else if (cr.py > yTop) { cr.py = yTop; cr.vy = -Math.abs(cr.vy) * 0.55; }
          if (cr.pz < zMin) { cr.pz = zMin; cr.vz = Math.abs(cr.vz) * 0.55; }
          else if (cr.pz > zMax) { cr.pz = zMax; cr.vz = -Math.abs(cr.vz) * 0.55; }
        }
      };
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
        const pa = Math.min(1, p / PHASES.ABOUT_END); // About sub-progress (planet entrance + copy)
        const sc = entranceScale(pa);
        const turn = smooth(clamp01((p - PHASES.TURN_START) / (PHASES.TURN_END - PHASES.TURN_START)));

        // Hero/idle phase: planet hidden (scale 0), nothing revealed, camera not yet turning — skip the
        // per-frame work; clear the canvas once so no stale frame lingers, keep the loop scheduled.
        if (sc === 0 && labelAlpha < 0.001 && turn === 0) {
          if (!idle) {
            idle = true;
            renderer.clear();
            for (let i = 0; i < chipRefs.current.length; i++) { const c = chipRefs.current[i]; if (c) c.style.opacity = '0'; }
          }
          raf = visible ? requestAnimationFrame(tick) : 0;
          return;
        }
        idle = false;

        // entrance: scale + drift from the About sub-progress
        planet.scale.setScalar(sc * S_FINAL);
        const d = driftFrac(pa);
        planet.position.set(d * LAND_X, d * LAND_Y, 0);

        // camera: scroll-driven yaw into the skills universe, OR (M4) zoom to a clicked crystal
        const fIdx = focusRef.current;
        if (fIdx >= 0) lastFocusIdx = fIdx;
        focusT += ((fIdx >= 0 ? 1 : 0) - focusT) * Math.min(1, dt * 3.5);
        if (focusT > 0.001 && lastFocusIdx >= 0) {
          const fc = crystals[lastFocusIdx];
          const cp = tmp.set(CRYS_DEPTH, fc.py, fc.pz); // its live position, not the home slot
          const fe = smooth(focusT);
          camera.position.set(0, 0, 7).lerp(_v1.set(cp.x - 3.4, cp.y - 0.4, cp.z), fe);
          camera.up.set(0, 1, 0);
          camera.lookAt(_v2.set(30, 0, 7).lerp(cp, fe));
        } else {
          camera.position.set(0, 0, 7);
          camera.rotation.y = -turn * (Math.PI / 2);
          if (turn > 0 && turn < 1) camera.translateZ(-Math.sin(turn * Math.PI) * 2.0); // dolly in mid-turn, settle back
        }
        starMat.opacity = turn * 0.95;
        nebMat.opacity = turn * 0.7;

        // ---- carry the About copy through the SAME camera move as the planet, so text + planet leave as one
        // 3D shot (and reverse together on scroll-up). We anchor the copy to the planet's world point and
        // project it through the LIVE camera, so it inherits the planet's exact screen motion + zoom, then
        // foreshorten it by the camera yaw. Driven imperatively here (not GSAP) to share the real camera. ----
        if (!copyEl) copyEl = (typeof document !== 'undefined' ? (document.querySelector('.about-copy') as HTMLElement | null) : null);
        if (copyEl) {
          if (turn <= 0.0001 || focusT > 0.001) {
            copyEl.style.transform = ''; copyEl.style.opacity = ''; copyEl.style.visibility = '';
          } else {
            const W = mount.clientWidth, H = mount.clientHeight, aspect = W / H;
            const halfH0 = Math.tan((camera.fov * Math.PI) / 360) * 7; // apparent half-height at the rest depth (z=7)
            const px = planet.position.x, py = planet.position.y;      // anchor = planet ⇒ identical screen delta
            const Tx0 = (px / (halfH0 * aspect) * 0.5 + 0.5) * W;
            const Ty0 = (1 - (py / halfH0 * 0.5 + 0.5)) * H;
            const u0 = (0.5 * H) / halfH0;                             // rest px per world unit (vertical)
            _tA.set(px, py, 0).project(camera);
            const Tx = (_tA.x * 0.5 + 0.5) * W, Ty = (1 - (_tA.y * 0.5 + 0.5)) * H;
            _tB.set(px, py + 1, 0).project(camera);
            const scale = Math.max(0.2, Math.abs((1 - (_tB.y * 0.5 + 0.5)) * H - Ty) / u0);
            const yawDeg = (camera.rotation.y * 180) / Math.PI;        // = -turn*90
            copyEl.style.transformOrigin = '50% 50%';
            copyEl.style.transform = `perspective(1100px) translate3d(${(Tx - Tx0).toFixed(1)}px,${(Ty - Ty0).toFixed(1)}px,0) rotateY(${yawDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
            copyEl.style.opacity = String(clamp01(1.3 - turn * 1.45));
            copyEl.style.visibility = turn > 0.9 ? 'hidden' : 'visible';
          }
        }

        // ---- meteor: flies in → HOLDS under sustained fire (progressive damage) → final blast → fragments ----
        const flyT = smooth(clamp01((p - MET_FLY0) / (MET_FLY1 - MET_FLY0)));
        const shatterT = smooth(clamp01((p - SHA0) / (SHA1 - SHA0)));
        const dmgT = clamp01((p - FIRE0) / Math.max(0.001, SHA0 - FIRE0)); // 0 at first shot → 1 at the kill
        const blastPulse = Math.sin(clamp01(shatterT / 0.4) * Math.PI);     // sharp flash right after the kill
        meteorGroup.visible = flyT > 0.001 && shatterT < 0.5;
        if (meteorGroup.visible) {
          meteorGroup.position.lerpVectors(meteorStartV, meteorCenterV, flyT);
          if (dmgT > 0 && shatterT < 0.001) { // shudder/recoil as it's hammered (escalating), before it blows
            meteorGroup.position.x += (Math.random() - 0.5) * dmgT * 0.5;
            meteorGroup.position.y += (Math.random() - 0.5) * dmgT * 0.5;
            meteorGroup.position.z += (Math.random() - 0.5) * dmgT * 0.5;
          }
          const shrink = 1 - smooth(clamp01(shatterT / 0.35));
          meteorGroup.scale.setScalar(Math.max(0.001, (0.55 + flyT * 0.45) * (1 - dmgT * 0.18) * shrink)); // chips down as hit
          meteor.rotation.x += dt * (0.8 + dmgT * 3); meteor.rotation.y += dt * (1.1 + dmgT * 3); // spins up under fire
          meteorMat.emissiveIntensity = 0.12 + flyT * 0.33 + dmgT * 1.6 + dmgT * 0.5 * Math.sin(now * 0.04) + shatterT * 2.2; // glows hotter + flickers
          meteorGlowMat.opacity = (0.3 + flyT * 0.4 + dmgT * 0.5) * (1 - smooth(clamp01(shatterT / 0.4)));
        }
        // camera shake — builds while the meteor is hammered, spikes on the blast (skipped during crystal focus)
        if (focusT < 0.001) {
          const shake = (shatterT < 0.001 ? dmgT * 0.045 : 0) + blastPulse * 0.18;
          if (shake > 0.0001) {
            camera.position.x += (Math.random() - 0.5) * shake;
            camera.position.y += (Math.random() - 0.5) * shake;
            camera.position.z += (Math.random() - 0.5) * shake;
          }
        }
        // meteor fragments burst out as it cracks apart (visible chunks; shrink + spin as they fly)
        for (let i = 0; i < frags.length; i++) {
          const fr = frags[i];
          const ft = smooth(clamp01((shatterT - fr.delay) * 1.45));
          fr.m.visible = ft > 0.001 && ft < 0.999;
          if (fr.m.visible) {
            const d = ft * fr.dist;
            fr.m.position.set(meteorCenterV.x + fr.dir.x * d, meteorCenterV.y + fr.dir.y * d, meteorCenterV.z + fr.dir.z * d);
            fr.m.rotation.x += dt * fr.spin.x; fr.m.rotation.y += dt * fr.spin.y; fr.m.rotation.z += dt * fr.spin.z;
            fr.m.scale.setScalar(fr.base * (1 - smooth(clamp01((ft - 0.55) / 0.45)))); // shrink away near the end
          }
        }
        // crystals burst from the meteor centre, then settle into a draggable physics field
        crystalsGroup.visible = shatterT > 0.001;
        if (crystalsGroup.visible) {
          const settled = shatterT > 0.985;
          if (settled) runCrystalPhysics(dt);
          for (let i = 0; i < crystals.length; i++) {
            const cr = crystals[i];
            const st = smooth(clamp01((shatterT - cr.delay) * 1.3));
            if (settled) {
              cr.g.position.set(CRYS_DEPTH, cr.py, cr.pz); // physics-driven
            } else {
              cr.g.position.lerpVectors(meteorCenterV, cr.gridPos, st); // cinematic delivery
              cr.g.position.y += Math.sin(st * Math.PI) * cr.arc;
              cr.py = cr.g.position.y; cr.pz = cr.g.position.z; cr.vy = 0; cr.vz = 0; // sync physics for handoff
            }
            const isFocusCr = i === lastFocusIdx && focusT > 0.01;
            cr.hoverT += ((i === hoverIdx || i === dragIdx || isFocusCr ? 1 : 0) - cr.hoverT) * Math.min(1, dt * 8);
            cr.body.rotation.y += dt * (cr.spin + (1 - st) * 4 + cr.hoverT * 1.4);
            cr.body.rotation.x += dt * (1 - st) * 2.5;
            cr.body.scale.setScalar(1 + cr.hoverT * 0.16);
            const o = clamp01(st * 1.6);
            const dim = isFocusCr ? 1 : 1 - focusT * 0.82; // other crystals fade when one is focused
            // hover / drag / focus → MORE transparent body (the logo inside reads clearer) + brighter edges & glow
            cr.bodyMat.opacity = o * (0.3 - cr.hoverT * 0.2) * dim;
            cr.edgeMat.opacity = o * (0.8 + cr.hoverT * 0.5) * dim;
            cr.cgMat.opacity = o * (0.5 + cr.hoverT * 0.6) * dim;
            cr.iconMat.opacity = o * dim; // logo suspended inside, tinted by the glass body drawn over it
          }
        }
        // debris burst — particles fly out from the shatter point, peak then fade
        const debrisA = Math.sin(clamp01(shatterT) * Math.PI);
        debris.visible = debrisA > 0.01;
        if (debris.visible) {
          const dp = debrisGeo.attributes.position;
          for (let i = 0; i < DEBRIS_N; i++) {
            const r = shatterT * debrisDir[i * 4 + 3];
            dp.setXYZ(i, meteorCenterV.x + debrisDir[i * 4] * r, meteorCenterV.y + debrisDir[i * 4 + 1] * r, meteorCenterV.z + debrisDir[i * 4 + 2] * r);
          }
          dp.needsUpdate = true;
          debrisMat.opacity = debrisA * 0.85;
        }
        // final blast: a white flash + an expanding shockwave ring, peaking right on the kill
        flash.visible = blastPulse > 0.01;
        if (flash.visible) { flash.position.copy(meteorCenterV); flash.scale.setScalar(3 + blastPulse * 7); flashMat.opacity = blastPulse; }
        blastRing.visible = shatterT > 0.001 && shatterT < 0.6;
        if (blastRing.visible) { blastRing.position.copy(meteorCenterV); const rr = 2 + smooth(clamp01(shatterT / 0.5)) * 18; blastRing.scale.set(rr, rr, 1); blastRingMat.opacity = blastPulse * 0.9; }

        // ---- drama: the 3D cat-ship flies in, holds + fires until the meteor's destroyed, then banks away ----
        const inT = clamp01((p - SHIP0) / (FIRE0 - SHIP0));               // fly-in
        const outT = clamp01((p - SHIP_OUT0) / (SHIP_OUT1 - SHIP_OUT0));  // bank + leave
        ship.visible = p > SHIP0 + 0.001 && outT < 0.999;
        shipLight.intensity = 0;
        let shx = 8.5, shy = 0.5 + Math.sin(now * 0.002) * 0.22, shz = 9.5; // hold position beside the meteor
        if (ship.visible) {
          if (p < FIRE0) { shy = 1.8 * Math.sin(inT * Math.PI * 3) * (1 - inT) + 0.5 * inT; shz = 2 + inT * 7.5; } // weave in
          if (outT > 0) { const e = outT * outT; shz = 9.5 + e * 24; shy += e * 5; shx = 8.5 - e * 2; }            // whoosh off-right + up
          ship.position.set(shx, shy, shz);
          const popIn = smooth(clamp01(inT * 4));
          ship.scale.setScalar(Math.max(0.0001, SHIP_SCALE * popIn * (1 - smooth(outT) * 0.85)));                  // grow in / shrink out
          shipLight.position.set(shx - 1.2, shy + 1.6, shz + 1.5);
          shipLight.intensity = 3.6 * popIn * (1 - outT * 0.6);
          // face travel (+Z); swing to aim at the meteor while firing; hard bank on the way out
          const aimYaw = Math.atan2(-(meteorCenterV.z - shz), meteorCenterV.x - shx);
          const aimBlend = clamp01((p - FIRE0) / 0.02) * (1 - clamp01((p - SHA0) / 0.025));
          ship.rotation.y = -Math.PI / 2 + (aimYaw + Math.PI / 2) * aimBlend;
          ship.rotation.z = (p < FIRE0 ? -0.4 * Math.cos(inT * Math.PI * 3) : 0) - outT * 0.9;
          ship.rotation.x = Math.sin(now * 0.0021) * 0.06;
          const flick = 0.7 + 0.3 * Math.sin(now * 0.03);
          shipFlames.forEach((fl: any, i: number) => { const s = (0.8 + outT * 1.2) * flick; fl.scale.set(s, (0.55 + outT * 0.6) * flick, 1); fl.material.opacity = 0.9 * (0.7 + 0.3 * Math.sin(now * 0.026 + i)); });
        }
        for (let i = 0; i < smalls.length; i++) {
          const sm = smalls[i];
          const t = clamp01((inT - sm.off) * 1.4);
          sm.m.visible = t > 0.001 && t < 0.999 && p < FIRE0 + 0.02;
          if (sm.m.visible) {
            sm.m.position.set(8.5, sm.y, sm.z0 - t * 16 * sm.spd);
            sm.m.rotation.x += dt * 2; sm.m.rotation.y += dt * 1.5;
          }
        }
        // sustained laser from the ship's nose to the meteor — keeps firing until the meteor's destroyed
        const firing = p >= FIRE0 && shatterT < 0.06 && meteorGroup.visible;
        beam.visible = beamGlow.visible = muzzle.visible = impact.visible = firing;
        if (firing) {
          _v1.subVectors(meteorGroup.position, ship.position);
          const len = Math.max(0.01, _v1.length());
          const mid = _v2.copy(ship.position).addScaledVector(_v1, 0.5);
          const flick = 0.78 + 0.22 * Math.sin(now * 0.05);                // sustained, flickering core
          const q = _quat.setFromUnitVectors(_yAxis, _v1.clone().normalize());
          beam.position.copy(mid); beam.scale.set(flick, len, flick); beam.quaternion.copy(q); beamMat.opacity = 0.92 * flick;
          beamGlow.position.copy(mid); beamGlow.scale.set(0.8 + dmgT * 0.5, len, 0.8 + dmgT * 0.5); beamGlow.quaternion.copy(q); beamGlowMat.opacity = 0.38 * flick;
          muzzle.position.copy(ship.position); muzzle.scale.setScalar(1.0 + Math.sin(now * 0.08) * 0.4); muzzleMat.opacity = flick;
          impact.position.copy(meteorGroup.position); impact.scale.setScalar(2.0 + dmgT * 2.0 + Math.sin(now * 0.09) * 0.5); impactMat.opacity = 0.85 * flick; // contact grows hotter as damage builds
        }

        const active = landed();
        if (!active) { hover = false; pinned = false; chipHoverCount = 0; mount.style.cursor = ''; }
        const rawEngaged = hover || pinned || chipHoverCount > 0;
        if (rawEngaged) lastEngaged = now;
        const engaged = active && (rawEngaged || now - lastEngaged < GRACE_MS);
        const k = Math.min(1, dt * 4);

        // Planet animation — skip once the camera has fully turned away to the skills act (off-view).
        if (turn < 1) {
          if (engaged) {
            const ty = Math.round(planet.rotation.y / TWO_PI) * TWO_PI;
            planet.rotation.y += (ty - planet.rotation.y) * k;
            planet.rotation.x += (-0.08 - planet.rotation.x) * k;
          } else {
            planet.rotation.y += dt * 0.18;
            planet.rotation.x += (0 - planet.rotation.x) * k;
            ring.rotation.z += dt * 0.06;
          }
          const pulse = 1 + 0.18 * Math.sin(now * 0.004);
          skillNodes.forEach((mNode, i) => mNode.scale.setScalar(pulse + (engaged ? 0.25 : 0) + 0.05 * Math.sin(now * 0.005 + i)));
          skillMat.opacity = engaged ? 1 : 0.92;
        }
        const targetAlpha = engaged ? 1 : 0;
        labelAlpha += (targetAlpha - labelAlpha) * Math.min(1, dt * (targetAlpha > labelAlpha ? 6 : 1.7));

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
        if (copyEl) { copyEl.style.transform = ''; copyEl.style.opacity = ''; copyEl.style.visibility = ''; }
        io.disconnect();
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        canvas.removeEventListener('pointerdown', onPointerDown);
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
        starGeo.dispose(); starMat.dispose(); nebTex.dispose(); nebMat.dispose();
        cGeo.dispose(); cEdgeGeo.dispose(); hitGeo.dispose(); hitMat.dispose();
        crystalMats.forEach((m) => m.dispose());
        iconTexes.forEach((t) => t.dispose());
        meteorGeo.dispose(); meteorMat.dispose(); meteorGlowMat.dispose();
        fragGeo.dispose(); fragMat.dispose();
        debrisGeo.dispose(); debrisMat.dispose();
        shipDisposables.forEach((d) => { try { d.dispose && d.dispose(); } catch {} });
        flameTex.dispose(); shipFlames.forEach((fl: any) => fl.material.dispose());
        smallGeo.dispose(); smallMat.dispose();
        beamGeo.dispose(); beamMat.dispose(); beamGlowGeo.dispose(); beamGlowMat.dispose(); muzzleMat.dispose(); impactMat.dispose();
        flashMat.dispose(); blastRingTex.dispose(); blastRingMat.dispose();
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
      {/* (Tech-skill logos now live INSIDE the gems as 3D sprites — see makeIconTexture in the scene.) */}
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
      {/* M4 — focused crystal detail card (camera has zoomed to the crystal in 3D; this reveals its name + description) */}
      {focused >= 0 && (() => {
        const s = TECH_SKILLS[focused];
        const close = () => { focusRef.current = -1; setFocused(-1); };
        return (
          <div className="skill-focus pointer-events-auto absolute inset-0 z-40 flex items-end justify-center pb-[10vh] sm:items-end sm:pb-[8vh]" onClick={close}>
            <div className="absolute inset-0 bg-[#04030c]/45 backdrop-blur-[1px]" />
            <div
              className="relative mx-6 w-full max-w-md animate-[skillCardIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)] rounded-2xl border border-white/12 bg-[#0a0914]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={close} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#8b86a6] transition-colors hover:bg-white/10 hover:text-white">✕</button>
              <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${s.color}, transparent)` }} />
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: s.color + '22', border: `1px solid ${s.color}55` }}>
                  <img
                    src={`/assets/tech-icons/${iconSlug(s.dev)}.svg`}
                    alt=""
                    className="h-7 w-7 object-contain"
                    onError={(e) => { const t = e.currentTarget; const i = document.createElement('i'); i.className = s.dev; i.setAttribute('style', `color:${s.color};font-size:1.7rem`); t.replaceWith(i); }}
                  />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: s.color }}>{s.group === 'lang' ? 'Language / Core' : 'Tool / Framework'}</p>
                  <h3 className="font-display text-2xl font-extrabold leading-tight text-[#F5F3FF]">{s.name}</h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#c3bdda]">{s.desc}</p>
            </div>
          </div>
        );
      })()}
      <ul className="sr-only">
        {SKILLS.map((s) => (<li key={s.name}><strong>{s.name}</strong>: {s.desc}</li>))}
      </ul>
    </>
  );
};

export default SpaceScene;
