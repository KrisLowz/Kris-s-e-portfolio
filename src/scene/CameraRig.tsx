import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, CAMERA_WAYPOINTS, CURVE, PACING, pace } from './config';
import { useScrollProgress } from './hooks/useScrollProgress';
import { voyage } from './voyage';
import Probe from './objects/Probe';
import type { ThemeColors } from './hooks/useThemeColors';

/**
 * The voyage rig. The PROBE rides the CatmullRom path (t = damped scroll
 * progress), oriented along the path tangent. The camera follows it
 * 3rd-person — trailing behind + above, looking slightly ahead — with cinematic
 * damping and a subtle cursor sway. (Replaces the old camera-on-path.)
 */
function CameraRig({ theme }: { theme: ThemeColors }) {
  const camera = useThree((s) => s.camera);
  const { progress } = useScrollProgress();
  const probeRef = useRef<THREE.Group>(null);

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

  const tRef = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const sway = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());
  const tangent = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const camTarget = useRef(new THREE.Vector3());
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    // Damp the path parameter toward the PACED scroll position, so the probe
    // decelerates into each world and warps between them.
    const prevT = tRef.current;
    const kt = 1 - Math.exp(-CAMERA.positionDamping * delta);
    tRef.current += (pace(progress.value) - tRef.current) * kt;
    const t = THREE.MathUtils.clamp(tRef.current, 0, 1);

    curve.getPointAt(t, pos.current);
    curve.getTangentAt(t, tangent.current).normalize();

    // Publish voyage state: smoothed travel speed → warp intensity (high on the
    // open legs, ~0 while arriving). Read by warp streaks, the trail and HUD.
    const inst = Math.abs(t - prevT) / Math.max(delta, 1 / 120);
    voyage.speed += (inst - voyage.speed) * (1 - Math.exp(-6 * delta));
    const targetWarp = THREE.MathUtils.clamp(
      (voyage.speed - PACING.warpLo) / (PACING.warpHi - PACING.warpLo),
      0,
      1
    );
    voyage.warp += (targetWarp - voyage.warp) * (1 - Math.exp(-5 * delta));
    voyage.t = t;
    voyage.probe.copy(pos.current);
    voyage.tangent.copy(tangent.current);

    // Place + orient the probe along the path.
    const probe = probeRef.current;
    if (probe) {
      probe.position.copy(pos.current);
      target.current.copy(pos.current).add(tangent.current);
      probe.lookAt(target.current);
    }

    // Cursor sway.
    const kp = 1 - Math.exp(-CAMERA.parallaxDamping * delta);
    sway.current.x += (pointer.current.x * CAMERA.parallaxAmount - sway.current.x) * kp;
    sway.current.y += (-pointer.current.y * CAMERA.parallaxAmount - sway.current.y) * kp;

    // Follow-cam target: behind + above the probe.
    camTarget.current
      .copy(pos.current)
      .addScaledVector(tangent.current, -CAMERA.followBack)
      .addScaledVector(up, CAMERA.followUp)
      .add(sway.current);

    camera.position.lerp(camTarget.current, 1 - Math.exp(-CAMERA.followDamping * delta));

    // Look ahead of — and slightly above — the probe so the craft frames into
    // the lower third (cinematic negative space, clear of headline copy).
    target.current
      .copy(pos.current)
      .addScaledVector(tangent.current, CAMERA.lookAhead)
      .addScaledVector(up, CAMERA.lookUp);
    camera.lookAt(target.current);
  });

  return <Probe ref={probeRef} theme={theme} />;
}

export default CameraRig;
