import { useRef } from 'react';
import { WORLD_ASSETS } from '../../story/worldAssets';
import { useShipFlight } from '../../motion/useShipFlight';
import { cinematicOn } from '../../motion/config';

/** The persistent spaceship. On capable desktops it flies along SHIP_PATH,
 *  scrubbed by scroll; otherwise it parks at a static decorative spot so the
 *  world still reads as a continuous scene. */
export default function ShipFlight() {
  const ref = useRef<HTMLImageElement>(null);
  useShipFlight(ref);

  const flying = cinematicOn('shipFlight');

  return (
    <img
      ref={ref}
      src={WORLD_ASSETS.spaceship}
      alt=""
      aria-hidden
      className={
        flying
          ? 'pointer-events-none fixed left-0 top-0 w-40 opacity-80 will-change-transform md:w-56'
          : 'pointer-events-none fixed right-[8%] top-[14%] w-40 opacity-30'
      }
    />
  );
}
