import { useCallback, useEffect, useRef } from 'react';
import { gsap } from '../../../motion/register';
import { Project } from '../../../types';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import ProjectModal from './ProjectModal';

/** Wraps ProjectModal with a black-hole portal transition: a fixed black-hole
 *  overlay expands to "pull you in" on open (then fades to reveal the modal),
 *  and on close it sweeps back in before the modal unmounts. Transform/opacity
 *  only; no pin; the open animation lives in a reverted gsap.context. The modal
 *  keeps its own role=dialog / Escape / focus behaviour — we only wrap onClose
 *  so the reverse plays before the real close fires. */
export default function ProjectPortalTransition({ project, onClose }: { project: Project; onClose: () => void }) {
  const bhRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const bh = bhRef.current;
    if (!bh) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(bh, { scale: 0.2, autoAlpha: 0, rotate: -10 }, { scale: 2.2, autoAlpha: 1, rotate: 10, duration: 0.32, ease: 'power2.in' })
        .to(bh, { autoAlpha: 0, duration: 0.22, ease: 'power1.out' });
    });
    return () => ctx.revert();
  }, []);

  // Close: sweep the black-hole back in, then fire the real onClose (unmounts).
  const handleClose = useCallback(() => {
    const bh = bhRef.current;
    if (!bh) { onClose(); return; }
    gsap
      .timeline({ onComplete: onClose })
      .fromTo(bh, { scale: 1.8, autoAlpha: 0, rotate: 8 }, { scale: 0.3, autoAlpha: 1, rotate: -8, duration: 0.3, ease: 'power2.in' });
  }, [onClose]);

  return (
    <>
      <img
        ref={bhRef}
        src={WORLD_ASSETS.blackHole}
        alt=""
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[110] m-auto h-[140vh] w-[140vh] max-w-none opacity-0 will-change-transform"
      />
      <ProjectModal project={project} onClose={handleClose} />
    </>
  );
}
