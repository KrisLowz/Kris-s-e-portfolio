import ShipFlight from './ShipFlight';

/** Persistent decorative layer hosting the scroll-flying spaceship. Sits behind
 *  all content (z-[-20]); the ship itself is viewport-fixed. */
export default function StoryWorldLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-20]">
      <ShipFlight />
    </div>
  );
}
