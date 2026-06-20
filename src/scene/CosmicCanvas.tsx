import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import SceneRoot from './SceneRoot';
import { SCENE } from './config';

/**
 * Lazy entry point for the entire three.js / R3F tree — the default export is
 * the `React.lazy` target in App.tsx, so none of this ships in the initial
 * bundle or blocks first paint.
 *
 * Owns the <Canvas> and its global concerns: DPR clamp (never raw
 * devicePixelRatio), performance floor, the camera, and the bloom pass.
 * Adaptive quality + visibility pausing (Phase 7) are wired in here later.
 */
const CosmicCanvas: React.FC = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
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
