import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import SceneRoot from './SceneRoot';
import { SCENE } from './config';

interface Props {
  /** Called when the WebGL context is lost so the parent can degrade gracefully. */
  onContextLost?: () => void;
}

/**
 * Lazy entry point for the three.js / R3F tree (React.lazy target in App.tsx, so
 * none of this ships in the initial bundle).
 *
 * Stability over flash: this scene must survive on integrated GPUs.
 *  - Fixed DPR of 1 and antialias OFF — the single biggest load cut. No
 *    AdaptiveDpr/PerformanceMonitor: their dynamic resolution changes churned
 *    the canvas (visible flicker) and stressed the driver without preventing
 *    the crash.
 *  - The render loop pauses while the tab is hidden (battery).
 *  - On context loss we preventDefault and tell the parent, which silently
 *    unmounts the canvas so the DOM gradient shows through — NO remount loop
 *    (the remount was the black-flash the user saw).
 */
const CosmicCanvas: React.FC<Props> = ({ onContextLost }) => {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={1}
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault();
            onContextLost?.();
          },
          false
        );
      }}
    >
      <Suspense fallback={null}>
        <SceneRoot />
      </Suspense>
      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={SCENE.bloom.intensity}
          luminanceThreshold={SCENE.bloom.threshold}
          luminanceSmoothing={SCENE.bloom.smoothing}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default CosmicCanvas;
