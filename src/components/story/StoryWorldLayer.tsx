import ShipFlight from './ShipFlight';
import MascotPilot from './MascotPilot';

/** Persistent decorative layer hosting the scroll-flying spaceship + cat pilot. */
export default function StoryWorldLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-20]">
      <ShipFlight />
      <MascotPilot />
    </div>
  );
}
