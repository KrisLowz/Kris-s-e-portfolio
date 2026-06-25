import { useEffect, useRef } from 'react';
import { gsap } from '../../motion/register';
import { cinematicOn } from '../../motion/config';
import { useMascotFlight } from '../../motion/useMascotFlight';
import { useActiveAct } from '../../motion/useActiveAct';
import { STORY_ACTS } from '../../content';
import { MascotState } from '../../types';
import { WORLD_ASSETS } from '../../story/worldAssets';

/** Per-mascotState "mood": a small yoyo loop on the inner sprite. */
const MOODS: Record<MascotState, gsap.TweenVars> = {
  sleep:     { y: 3, duration: 1.6 },
  wave:      { rotation: 8, duration: 0.8 },
  pilot:     { y: 3, duration: 1.4 },
  scan:      { x: 6, duration: 1.2 },
  alarm:     { x: 3, duration: 0.12 },
  aim:       { y: 4, scale: 0.96, duration: 0.5 },
  celebrate: { y: -10, scale: 1.1, duration: 0.4 },
  archive:   { y: 3, duration: 1.4 },
  relay:     { rotation: -6, duration: 0.45 },
  goodbye:   { rotation: 12, duration: 0.7 },
};

/** The cat pilot. Rides the ship (OUTER wrapper travels) and plays a mood on the
 *  INNER sprite per the active act's mascotState; celebrates on a sent signal.
 *  Static near the ship under reduced-motion / mobile. */
export default function MascotPilot() {
  const outerRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<HTMLImageElement>(null);
  useMascotFlight(outerRef);
  const act = useActiveAct();
  const on = cinematicOn('mascot');
  const mascotState: MascotState = STORY_ACTS.find((a) => a.id === act)?.mascotState ?? 'pilot';

  // Mood loop — re-created when the active act's mascotState changes.
  useEffect(() => {
    if (!on) return;
    const el = moodRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, { ...MOODS[mascotState], repeat: -1, yoyo: true, ease: 'sine.inOut', overwrite: true });
    });
    return () => ctx.revert();
  }, [mascotState, on]);

  // One-shot celebrate when a signal is sent (decoupled from RelayConsole).
  useEffect(() => {
    if (!on) return;
    const el = moodRef.current;
    if (!el) return;
    const onSignal = () => {
      gsap.fromTo(el, { y: 0, scale: 1 }, { y: -16, scale: 1.2, duration: 0.25, yoyo: true, repeat: 3, ease: 'power1.out' });
    };
    window.addEventListener('story:signal-sent', onSignal);
    return () => window.removeEventListener('story:signal-sent', onSignal);
  }, [on]);

  return (
    <div
      ref={outerRef}
      aria-hidden
      className={on
        ? 'pointer-events-none fixed left-0 top-0 w-24 will-change-transform'
        : 'pointer-events-none fixed right-[14%] top-[20%] w-20 opacity-60'}
    >
      <img ref={moodRef} src={WORLD_ASSETS.mascot} alt="" aria-hidden className="w-full" />
      {on && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-widest text-pop-primary/70">
          Pilot · {mascotState}
        </span>
      )}
    </div>
  );
}
