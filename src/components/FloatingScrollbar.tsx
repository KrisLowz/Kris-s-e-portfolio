import React, { useEffect, useRef, useState } from 'react';

/* ============================================================================
   FloatingScrollbar — a tiny, floating scroll-position indicator that stands in
   for the (hidden) native page scrollbar. A ~40vh-tall track pinned 5px from the
   right edge and vertically centred, with a neon thumb that tracks whole-page
   scroll. Passive (pointer-events:none — purely an indicator, not draggable) and
   it auto-hides ~1s after you stop scrolling. Desktop only.
   ============================================================================ */

const FloatingScrollbar: React.FC = () => {
  const [progress, setProgress] = useState(0); // 0..1 down the page
  const [thumbPct, setThumbPct] = useState(16); // thumb height as % of the track
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      // thumb size mirrors the viewport/content ratio, clamped so it stays tiny but legible
      const ratio = doc.scrollHeight > 0 ? window.innerHeight / doc.scrollHeight : 1;
      setThumbPct(Math.min(60, Math.max(14, ratio * 100)));

      // reveal while scrolling, then fade out when idle
      setVisible(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 1100);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const top = progress * (100 - thumbPct); // thumb's top, as % within the track

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-[5px] top-[30vh] z-30 hidden h-[40vh] w-1.5 rounded-full bg-white/10 transition-opacity duration-500 ease-out md:block"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute left-0 w-full rounded-full bg-gradient-to-b from-[#22D3EE] to-[#7C5CFF] shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        style={{ height: `${thumbPct}%`, top: `${top}%` }}
      />
    </div>
  );
};

export default FloatingScrollbar;
