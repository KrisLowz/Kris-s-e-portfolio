import { WORLD_ASSETS } from '../../story/worldAssets';

/** Persistent decorative sprites that will travel between acts in later phases.
 *  In v1 it renders a faint parked spaceship so the world reads as continuous. */
export default function StoryWorldLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-20] overflow-hidden">
      <img
        src={WORLD_ASSETS.spaceship}
        alt=""
        className="absolute right-[8%] top-[14%] w-40 opacity-30"
        data-float
      />
    </div>
  );
}
