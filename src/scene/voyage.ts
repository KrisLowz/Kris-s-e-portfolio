import * as THREE from 'three';

/**
 * Shared, mutable voyage state — the cinematic equivalent of scroll.ts's
 * progress refs. CameraRig writes it every frame; warp streaks, the engine
 * trail, the scan beam and the HUD read it in their own useFrame loops WITHOUT
 * triggering React re-renders. One source of truth for "where is the probe and
 * how fast is it travelling".
 */
export const voyage = {
  /** Current curve parameter the probe rides (0 = launch, 1 = arrival). */
  t: 0,
  /** Smoothed probe speed along the path (curve-units / second). */
  speed: 0,
  /** 0..1 warp intensity — high mid-leg (between worlds), ~0 at each arrival. */
  warp: 0,
  /** Probe world position (for the scan beam and any probe-anchored effect). */
  probe: new THREE.Vector3(),
  /** Probe travel direction (unit tangent of the path at t). */
  tangent: new THREE.Vector3(),
};
