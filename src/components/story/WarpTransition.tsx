import { useRef, useEffect } from 'react';
import { gsap } from '../../motion/register';
import { cinematicOn } from '../../motion/config';
import { WORLD_ASSETS } from '../../story/worldAssets';

/** Full-screen wormhole warp at a section boundary. The wormhole image is
 *  always viewport-fixed; an in-flow spacer supplies the scroll RANGE that
 *  scrubs the bloom — no ScrollTrigger pin (pinning reparents DOM and crashes
 *  React 19's reconciler). Desktop+motion: a full grow → peak → blow-past
 *  bloom over a 60vh spacer. Reduced-motion / mobile: a short crossfade over a
 *  small spacer. Either way scroll never traps and content stays reachable. */
export default function WarpTransition({ id }: { id: string }) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<HTMLImageElement>(null);
  const full = cinematicOn('warp');

  useEffect(() => {
    const spacer = spacerRef.current;
    const warp = warpRef.current;
    if (!spacer || !warp) return;

    const ctx = gsap.context(() => {
      if (full) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: spacer,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            },
          })
          .fromTo(
            warp,
            { scale: 0.15, autoAlpha: 0, rotate: -8, filter: 'blur(8px)' },
            { scale: 1.4, autoAlpha: 1, rotate: 6, filter: 'blur(0px)', ease: 'none' }
          )
          .to(warp, { scale: 2.5, autoAlpha: 0, rotate: 12, filter: 'blur(12px)', ease: 'none' });
      } else {
        gsap
          .timeline({
            scrollTrigger: { trigger: spacer, start: 'top bottom', end: 'bottom top', scrub: true },
          })
          .fromTo(warp, { autoAlpha: 0 }, { autoAlpha: 0.4, ease: 'none' })
          .to(warp, { autoAlpha: 0, ease: 'none' });
      }
    });

    return () => ctx.revert();
  }, [full]);

  return (
    <>
      <div ref={spacerRef} data-warp={id} aria-hidden className={full ? 'h-[60vh] w-full' : 'h-[15vh] w-full'} />
      <img
        ref={warpRef}
        src={WORLD_ASSETS.wormhole}
        alt=""
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] m-auto h-[120vh] w-[120vh] max-w-none opacity-0 will-change-transform"
      />
    </>
  );
}
