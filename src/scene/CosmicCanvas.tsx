import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import SceneRoot from './SceneRoot';
import { SCENE } from './config';
import { supportsFloatBloom } from './capability';

interface Props {
  /** Called when the WebGL context is lost so the parent can degrade gracefully. */
  onContextLost?: () => void;
}

/**
 * Lazy entry point for the three.js / R3F tree.
 *
 * Cross-GPU correctness (the scene must look right on integrated GPUs):
 *  - Opaque base (alpha:false + scene.background) so additive blending
 *    composites correctly — a transparent canvas broke it on some GPUs.
 *  - Bloom is mounted ONLY when the GPU can render to a float buffer
 *    (supportsFloatBloom), and with multisampling:0. An unsupported MSAA
 *    half-float target was clamping the whole scene to black. The glow is baked
 *    into the materials, so the scene looks right with bloom OFF too.
 *  - Fixed DPR 1, no MSAA — light enough to avoid context-loss crashes.
 *  - Render loop pauses while the tab is hidden; on context loss we tell the
 *    parent, which silently drops the canvas (no remount flashing).
 */
const CosmicCanvas: React.FC<Props> = ({ onContextLost }) => {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');
  const bloomOk = useMemo(() => supportsFloatBloom(), []);

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
        alpha: false,
        powerPreference: 'default',
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
      {bloomOk && (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={SCENE.bloom.intensity}
            luminanceThreshold={SCENE.bloom.threshold}
            luminanceSmoothing={SCENE.bloom.smoothing}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
};

export default CosmicCanvas;
