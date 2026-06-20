import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import SceneRoot from './SceneRoot';
import { SCENE } from './config';

interface Props {
  /** Called when the WebGL context is lost so the parent can remount/recover. */
  onContextLost?: () => void;
}

/**
 * Lazy entry point for the entire three.js / R3F tree — the default export is
 * the `React.lazy` target in App.tsx, so none of this ships in the initial
 * bundle or blocks first paint.
 *
 * Hardening:
 *  - DPR is capped at 1.5 (not 2.0): on a 4K/retina display, 2× would render
 *    ~4M+ fragments through the bloom pass every frame and can crash the GPU
 *    (context loss). 1.5× roughly halves that and is the key stability fix.
 *  - PerformanceMonitor + AdaptiveDpr further scale resolution down under load.
 *  - Bloom is mounted permanently (no runtime toggle) to avoid pipeline churn.
 *  - The render loop pauses while the tab is hidden (battery).
 *  - On context loss we preventDefault (keep the canvas) and ask the parent to
 *    remount with a fresh context, so a transient GPU reset recovers instead of
 *    leaving a frozen/dead canvas.
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
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
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
      <PerformanceMonitor>
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
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </PerformanceMonitor>
    </Canvas>
  );
};

export default CosmicCanvas;
