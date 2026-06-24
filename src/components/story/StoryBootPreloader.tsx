import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../motion/register';
import { CONFIG } from '../../motion/config';
import { WORLD_ASSETS } from '../../story/worldAssets';
import { PROFILE } from '../../content';

export default function StoryBootPreloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(CONFIG.reducedMotion); // reduced motion: never shown

  useEffect(() => {
    if (CONFIG.reducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
          window.dispatchEvent(new CustomEvent('story:boot-complete'));
        },
      });
      tl.fromTo('[data-boot-mascot]', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5 })
        .fromTo('[data-boot-line]', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', stagger: 0.25, duration: 0.4 }, 0.2)
        .to('[data-boot-flash]', { opacity: 1, duration: 0.25 }, '+=0.2')
        .to(root.current, { autoAlpha: 0, duration: 0.3 });
    }, root);
    return () => ctx.revert();
  }, []);

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-pop-bg">
      <div className="flex flex-col items-center gap-4 text-center">
        <img src={WORLD_ASSETS.mascot} alt="" data-boot-mascot className="w-24 opacity-0" />
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
          <p data-boot-line>Initializing voyage</p>
          <p data-boot-line>Pilot profile detected</p>
          <p data-boot-line className="text-pop-text-main">{PROFILE.name}</p>
        </div>
      </div>
      <div data-boot-flash className="pointer-events-none absolute inset-0 bg-white opacity-0" />
    </div>
  );
}
