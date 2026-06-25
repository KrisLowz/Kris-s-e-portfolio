import { useState, useEffect, useRef } from 'react';

export default function StoryCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);

  // Effect 1: detection only. Runs once after mount, flips `fine`.
  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine)').matches);
  }, []);

  // Effect 2: listener. Re-runs whenever `fine` changes. When `fine` flips
  // true the div has already rendered, so ref.current is populated here.
  useEffect(() => {
    if (!fine) return;
    const el = ref.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      // Reveal only after the first real pointer position is known,
      // so we never flash a ring in the top-left corner.
      if (el.style.opacity !== '1') el.style.opacity = '1';
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [fine]);

  if (!fine) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      // Real cyan via the accent var + a glow. We deliberately do NOT use
      // `border-pop-primary/70` here: Tailwind cannot inject an alpha into a
      // `var()`-based colour, so that class silently falls back to the default
      // gray-200 border (an almost-invisible ring). The rest of the site uses
      // `color-mix(... transparent)` for accent alpha — match that.
      style={{
        opacity: 0,
        willChange: 'transform',
        border: '1.5px solid var(--accent-primary)',
        boxShadow:
          '0 0 9px 1px color-mix(in srgb, var(--accent-primary) 65%, transparent), inset 0 0 4px color-mix(in srgb, var(--accent-primary) 40%, transparent)',
      }}
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-3 -mt-3 h-6 w-6 rounded-full"
    />
  );
}
