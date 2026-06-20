import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, CAMERA_WAYPOINTS, CURVE } from './config';
import { useScrollProgress } from './hooks/useScrollProgress';

/**
 * The only thing that moves the camera. Builds a CatmullRom curve through the
 * section waypoints and, each frame, damps the camera along it toward the
 * shared scroll progress, plus a subtle cursor-driven parallax sway.
 *
 * Reads progress via a mutable ref (never React state) so it stays glued to the
 * Lenis/GSAP rAF without re-rendering. Returns null — it only side-effects the
 * camera.
 */
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const { progress } = useScrollProgress();

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_WAYPOINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
        false,
        'catmullrom',
        CURVE.tension
      ),
    []
  );
  const lookAt = useMemo(() => new THREE.Vector3(...CAMERA.lookAt), []);

  const tRef = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const sway = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    // Damp the curve parameter toward the global scroll progress.
    const kt = 1 - Math.exp(-CAMERA.positionDamping * delta);
    tRef.current += (progress.value - tRef.current) * kt;
    const t = THREE.MathUtils.clamp(tRef.current, 0, 1);
    curve.getPointAt(t, pos.current);

    // Damp the parallax sway toward the pointer target (inverted Y = screen→world).
    const kp = 1 - Math.exp(-CAMERA.parallaxDamping * delta);
    sway.current.x += (pointer.current.x * CAMERA.parallaxAmount - sway.current.x) * kp;
    sway.current.y += (-pointer.current.y * CAMERA.parallaxAmount - sway.current.y) * kp;

    camera.position.set(
      pos.current.x + sway.current.x,
      pos.current.y + sway.current.y,
      pos.current.z
    );
    camera.lookAt(lookAt);
  });

  return null;
}

export default CameraRig;
