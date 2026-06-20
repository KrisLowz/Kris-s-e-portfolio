import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import SceneRoot from './SceneRoot';
import { SCENE } from './config';

/**
 * Lazy entry point for the entire three.js / R3F tree — the default export is
 * the `React.lazy` target in App.tsx, so none of this ships in the initial
 * bundle or blocks first paint.
 *
 * Hardening (Phase 7):
 *  - PerformanceMonitor + AdaptiveDpr auto-scale resolution under load, and the
 *    bloom pass (heaviest) is dropped first on a sustained decline.
 *  - The render loop is paused entirely while the tab is hidden (battery). The
 *    canvas is fixed/full-viewport so it's never scrolled offscreen — tab
 *    visibility is the only meaningful pause signal.
 *  - A lost WebGL context is allowed to auto-restore instead of crashing.
 */
const CosmicCanvas: React.FC = () => {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');
  const [bloom, setBloom] = useState(true);

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => {
        // Let the browser auto-restore a lost context instead of hard-crashing.
        gl.domElement.addEventListener(
          'webglcontextlost',
          (e) => e.preventDefault(),
          false
        );
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setBloom(false)}
        onFallback={() => setBloom(false)}
      >
        <Suspense fallback={null}>
          <SceneRoot />
        </Suspense>
        {bloom && (
          <EffectComposer>
            <Bloom
              mipmapBlur
              intensity={SCENE.bloom.intensity}
              luminanceThreshold={SCENE.bloom.threshold}
              luminanceSmoothing={SCENE.bloom.smoothing}
            />
          </EffectComposer>
        )}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </PerformanceMonitor>
    </Canvas>
  );
};

export default CosmicCanvas;
