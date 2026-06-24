import { StoryActId } from '../types';

/** One waypoint on the ship's scroll-driven flight. x/y are VIEWPORT FRACTIONS
 *  (0 = left/top edge, 1 = right/bottom edge) of the ship's CENTER; rotate is
 *  degrees; scale is a multiplier; thruster is 0..1 glow intensity. The ship
 *  interpolates between consecutive waypoints as global scroll progresses. */
export interface ShipWaypoint {
  act: StoryActId;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  thruster: number;
}

/** Full flight path in scroll order: parked at the hero (lower-right, idling),
 *  crossing the cosmos to each act, then streaking off-screen at the end.
 *  First-pass values; tuned live so the ship never occludes text. */
export const SHIP_PATH: ShipWaypoint[] = [
  { act: 'hero',       x: 0.78, y: 0.74, rotate: -8,  scale: 1.0,  thruster: 0.3 },
  { act: 'about',      x: 0.30, y: 0.42, rotate: 6,   scale: 0.8,  thruster: 0.6 },
  { act: 'skills',     x: 0.64, y: 0.30, rotate: -4,  scale: 0.7,  thruster: 0.5 },
  { act: 'experience', x: 0.24, y: 0.60, rotate: 8,   scale: 0.75, thruster: 0.5 },
  { act: 'projects',   x: 0.70, y: 0.48, rotate: -6,  scale: 0.72, thruster: 0.6 },
  { act: 'contact',    x: 0.40, y: 0.34, rotate: 4,   scale: 0.78, thruster: 0.7 },
  { act: 'end',        x: 1.15, y: 0.10, rotate: -12, scale: 0.3,  thruster: 1.0 },
];
