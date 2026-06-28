import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../constants';

/* ============================================================================
   Projects — a cinematic, scroll-driven gallery (GTA-VI style). A vertical
   stack of full-bleed project cards (promo image + title + hook + "Learn More").
   Clicking one opens a full-screen gallery that scrolls HORIZONTALLY: a tall
   cinematic info column first (all the story laid out vertically), then every
   screenshot in a device frame flowing off to the right — wheel/scroll moves
   the page rightward. TrackPoint is a phone (mobile app); Cinemate & Splash
   Aquatics are browser windows (web apps). No 3D; pure HTML/CSS + an
   IntersectionObserver reveal + a wheel→horizontal mapper. Reduced motion
   shows everything at once.
   ============================================================================ */

const ACCENT: Record<string, string> = { trackpoint: '#f59e0b', cinemate: '#8b5cf6', splashaquatics: '#06b6d4' };
// Which device frame each project lives in.
const DEVICE: Record<string, 'mobile' | 'desktop'> = { trackpoint: 'mobile', cinemate: 'desktop', splashaquatics: 'desktop' };

// A phone mockup wrapping a portrait screenshot (mobile apps).
const Phone: React.FC<{ src: string }> = ({ src }) => (
  <figure className="shot-reveal flex h-full shrink-0 items-center">
    <div className="relative rounded-[2.2rem] border-[10px] border-[#17151f] bg-[#17151f] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.85)]">
      <div className="absolute left-1/2 top-[7px] z-10 h-[15px] w-20 -translate-x-1/2 rounded-full bg-[#17151f]" />
      <img src={src} alt="" loading="lazy" className="block h-[60vh] w-auto rounded-[1.5rem] sm:h-[68vh]" />
    </div>
  </figure>
);

// A browser-window mockup wrapping a landscape screenshot (web apps).
const Browser: React.FC<{ src: string }> = ({ src }) => (
  <figure className="shot-reveal flex h-full shrink-0 items-center">
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d0b16] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#17141f] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 hidden h-5 flex-1 rounded-md bg-[#0d0b16] sm:block" />
      </div>
      <img src={src} alt="" loading="lazy" className="block h-[52vh] w-auto sm:h-[58vh]" />
    </div>
  </figure>
);

const Projects: React.FC = () => {
  const [open, setOpen] = useState(-1); // index of the project whose gallery is open (-1 = card list)
  const railRef = useRef<HTMLDivElement>(null);

  // scroll-reveal: add `.in` to reveal elements as they enter view (one-way).
  // In the open gallery this fires horizontally — frames off to the right are
  // not intersecting the viewport, so they reveal as you scroll into them.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.proj-reveal, .shot-reveal'));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    return () => io.disconnect();
  }, [open]);

  // lock the page scroll while a gallery is open (it scrolls internally)
  useEffect(() => {
    const v = open >= 0 ? 'hidden' : '';
    document.documentElement.style.overflow = v;
    document.body.style.overflow = v;
    return () => { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; };
  }, [open]);

  // Escape closes the gallery
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Map vertical wheel onto horizontal scroll so "keep scrolling goes right".
  // Over the info column, let it scroll vertically until its bounds, then hand
  // the remaining delta to the horizontal rail.
  useEffect(() => {
    if (open < 0) return;
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollLeft = 0; // always start at the info column
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      const col = (e.target as HTMLElement)?.closest?.('[data-info-col]') as HTMLElement | null;
      if (col && col.scrollHeight > col.clientHeight + 1) {
        const atTop = col.scrollTop <= 0;
        const atBottom = col.scrollTop + col.clientHeight >= col.scrollHeight - 1;
        if (!(delta < 0 && atTop) && !(delta > 0 && atBottom)) return; // let the column scroll vertically
      }
      rail.scrollLeft += delta;
      e.preventDefault();
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, [open]);

  const p = open >= 0 ? PROJECTS[open] : null;
  const accent = p ? ACCENT[p.id] ?? '#22D3EE' : '#22D3EE';
  const device = p ? DEVICE[p.id] ?? 'mobile' : 'mobile';

  return (
    <section id="projects" aria-labelledby="proj-heading" className="relative bg-[#05030f] py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#0e0b22_0%,#06051a_45%,#03020c_100%)]" />

      {/* ---- card list ---- */}
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="proj-reveal text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">Destinations // Projects</p>
        <h2 id="proj-heading" className="proj-reveal mt-3 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] text-[#F5F3FF] sm:text-7xl">
          Worlds I&apos;ve built
        </h2>
        <p className="proj-reveal mt-5 max-w-xl text-lg text-[#A8A3C2]">Real products shipped for real people. Open one to fly through the full story and every screen.</p>

        <div className="mt-16 space-y-10 sm:mt-20 sm:space-y-14">
          {PROJECTS.map((proj, i) => (
            <button
              key={proj.id}
              onClick={() => setOpen(i)}
              className="proj-reveal group relative block h-[62vh] min-h-[400px] w-full overflow-hidden rounded-[2rem] text-left ring-1 ring-white/10 transition-shadow duration-500 hover:ring-white/25 hover:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
            >
              <img src={proj.image} alt="" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT[proj.id] }}>{String(i + 1).padStart(2, '0')} — {proj.subtitle}</p>
                <h3 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white drop-shadow sm:text-6xl">{proj.title}</h3>
                <p className="mt-3 max-w-xl text-[#dcd9ee] sm:text-lg">{proj.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#14121A] transition-all duration-300 group-hover:gap-3.5">
                  Learn More <span aria-hidden="true">→</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ---- full-screen horizontal gallery ---- */}
      {p && (
        <div className="fixed inset-0 z-50 bg-[#05030f]">
          {/* top bar (floats over the rail) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
            <button onClick={() => setOpen(-1)} className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#05030f]/70 px-4 py-1.5 text-xs font-bold text-[#C3BFD6] backdrop-blur transition-colors hover:bg-white/10 hover:text-white">
              <span aria-hidden="true">←</span> All projects
            </button>
            <span className="font-display text-sm font-extrabold text-white drop-shadow sm:text-base">{p.title}</span>
            <button onClick={() => setOpen(-1)} aria-label="Close" className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-[#05030f]/70 text-[#C3BFD6] backdrop-blur transition-colors hover:bg-white/10 hover:text-white">✕</button>
          </div>

          {/* horizontal rail */}
          <div ref={railRef} className="gallery-rail flex h-full items-center gap-6 overflow-x-auto overflow-y-hidden px-6 sm:gap-12 sm:px-16">
            {/* column 1 — cinematic hero: promo image + title + hook + award */}
            <div className="relative flex h-[80vh] w-[86vw] max-w-[440px] shrink-0 overflow-hidden rounded-[1.8rem] ring-1 ring-white/10">
              <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05030f] via-[#05030f]/80 to-[#05030f]/35" />
              <div className="relative flex w-full flex-col justify-end px-7 py-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: accent }}>{String(open + 1).padStart(2, '0')} — {p.subtitle}</p>
                <h2 className="mt-2 font-display text-4xl font-extrabold leading-[1.04] text-white sm:text-5xl">{p.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#dcd9ee]">{p.description}</p>
                {p.achievements?.length ? (
                  <ul className="mt-4 space-y-1 text-[13px] leading-snug text-[#ffe3a0]">{p.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                ) : null}
                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">Scroll to explore <span aria-hidden="true">→</span></p>
              </div>
            </div>

            {/* column 2 — the brief: overview, challenge → solution, tech */}
            <div data-info-col className="flex h-[80vh] w-[86vw] max-w-[480px] shrink-0 flex-col overflow-y-auto rounded-[1.8rem] border border-white/10 bg-white/[0.03] px-7 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="my-auto">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b96b8]">Overview</p>
                <p className="mt-2 text-[13px] leading-snug text-[#cfcbe4]">{p.overview}</p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#FF2BD6]/25 bg-[#160a18]/40 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF2BD6]">Challenge</p>
                    <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-[#a8a3c2]">{p.challenges?.map((c) => <li key={c}>{c}</li>)}</ul>
                  </div>
                  <div className="rounded-xl border border-[#22D3EE]/25 bg-[#08161a]/40 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#22D3EE]">Solution</p>
                    <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-[#a8a3c2]">{p.solutions?.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                </div>

                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]/80">Tech deployed</p>
                <div className="mt-2 space-y-1.5">
                  {p.techStackDetails?.map((g) => (
                    <div key={g.category} className="flex flex-wrap items-center gap-1.5">
                      <span className="w-16 shrink-0 text-[10px] font-bold uppercase text-[#7c5cff]">{g.category}</span>
                      {g.tools.map((t) => <span key={t} className="rounded-full border border-[#22D3EE]/35 bg-[#0a0820]/60 px-2.5 py-0.5 text-[10px] font-semibold text-[#dffaff]">{t}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* screenshots — device frame per project type, flowing rightward */}
            {p.screenshots.map((s) => (device === 'desktop' ? <Browser key={s} src={s} /> : <Phone key={s} src={s} />))}

            {/* end card */}
            <div className="flex h-[80vh] w-[78vw] max-w-[340px] shrink-0 flex-col items-center justify-center gap-5 rounded-[1.8rem] border border-white/10 bg-white/[0.03] px-8 text-center">
              <p className="font-display text-2xl font-extrabold text-white">End of the tour</p>
              <p className="text-sm text-[#A8A3C2]">{p.screenshots.length} screens from {p.title}.</p>
              <button onClick={() => setOpen(-1)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-[#C3BFD6] transition-colors hover:bg-white/10 hover:text-white">
                <span aria-hidden="true">←</span> Back to all projects
              </button>
            </div>
          </div>

          {/* scroll hint */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
            Scroll <span aria-hidden="true">→</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
