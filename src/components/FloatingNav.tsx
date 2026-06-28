import React, { useEffect, useRef, useState } from 'react';
import { Home, User, Gem, Rocket, FolderGit2, Radio } from 'lucide-react';

/* ============================================================================
   FloatingNav — a floating glass pill nav for the space-journey redesign.
   Adapted from Aceternity's FloatingNav, but for THIS stack: no motion/react
   (a tiny scrollY-direction listener + CSS transition), lucide icons (not
   tabler), no cn/shadcn, and the project's own dark neon tokens.

   Reveal: hidden near the top (never covers the Hero), slides in when you
   scroll UP, hides when you scroll DOWN.

   Jumps use one-off programmatic smooth scroll (the sanctioned pattern here —
   index.html forbids GLOBAL css smooth-scroll because it fights ScrollTrigger;
   Contact.tsx already uses window.scrollTo({behavior:'smooth'}) the same way).

   About / Skills / Experience aren't real anchors — they're beats INSIDE the
   single pinned Journey (Hero→About→Skills→Experience). Each `beat` is a
   fraction of that ScrollTrigger's scroll range (id 'journey'), verified
   visually:
     • 0.37  — About fully settled (planet landed, all copy shown)
     • 0.60  — Skills universe, all crystals flowing
     • 0.785 — Experience: ship docked at the 1st station (ONE ERP)
   Projects / Contact are ordinary sections after the pin.
   ============================================================================ */

declare global {
  interface Window { gsap: any; ScrollTrigger: any }
}

type NavItem = { id: string; name: string; icon: React.ReactNode; beat?: number };

const NAV: NavItem[] = [
  { id: 'home', name: 'Home', icon: <Home className="h-4 w-4" /> },
  { id: 'about', name: 'About', icon: <User className="h-4 w-4" />, beat: 0.37 },
  { id: 'skills', name: 'Skills', icon: <Gem className="h-4 w-4" />, beat: 0.6 },
  { id: 'experience', name: 'Experience', icon: <Rocket className="h-4 w-4" />, beat: 0.785 },
  { id: 'projects', name: 'Projects', icon: <FolderGit2 className="h-4 w-4" /> },
  { id: 'contact', name: 'Contact', icon: <Radio className="h-4 w-4" /> },
];

const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

const FloatingNav: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('home');
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;

      // reveal: hidden near the top, shown on scroll-up, hidden on scroll-down
      if (y < 120) setVisible(false);
      else if (y < lastY.current - 2) setVisible(true);
      else if (y > lastY.current + 2) setVisible(false);
      lastY.current = y;

      // active-section highlight — which section/beat owns the middle of the viewport
      const mid = y + window.innerHeight * 0.5;
      const proj = document.getElementById('projects');
      const contact = document.getElementById('contact');
      const projTop = proj ? docTop(proj) : Infinity;
      const contactTop = contact ? docTop(contact) : Infinity;
      let act = 'home';
      if (mid >= contactTop) act = 'contact';
      else if (mid >= projTop) act = 'projects';
      else {
        const st = window.ScrollTrigger?.getById?.('journey');
        if (st && st.end > st.start) {
          const prog = (y - st.start) / (st.end - st.start);
          act = prog >= 0.69 ? 'experience' : prog >= 0.48 ? 'skills' : prog >= 0.14 ? 'about' : 'home';
        }
      }
      setActive(act);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    let y = 0;
    if (item.id === 'home') {
      y = 0;
    } else if (item.beat !== undefined) {
      const st = window.ScrollTrigger?.getById?.('journey');
      if (st) y = st.start + item.beat * (st.end - st.start);
      else {
        // reduced-motion / no pin: fall back to a real anchor if one exists, else the About section
        const el = document.getElementById(item.id) || document.getElementById('about');
        y = el ? docTop(el) : 0;
      }
    } else {
      const el = document.getElementById(item.id);
      if (el) y = docTop(el);
    }
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-x-0 top-6 z-40 mx-auto flex max-w-fit justify-center transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-140%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <nav className="flex items-center gap-0.5 rounded-full border border-white/10 bg-[#05030f]/70 px-1.5 py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md sm:gap-1 sm:px-2">
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <a
              key={item.id}
              href={item.id === 'home' ? '#' : `#${item.id}`}
              onClick={(e) => go(e, item)}
              aria-current={on ? 'page' : undefined}
              className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:px-3.5 ${
                on ? 'bg-[#22D3EE]/15 text-white' : 'text-[#C3BFD6] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={on ? 'text-[#22D3EE]' : 'text-[#22D3EE]/80'}>{item.icon}</span>
              <span className="hidden sm:inline">{item.name}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default FloatingNav;
