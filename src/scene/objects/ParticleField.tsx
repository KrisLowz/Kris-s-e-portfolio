import { useMemo } from 'react';
import Billboards from './Billboards';
import { SCENE } from '../config';
import type { ThemeColors } from '../hooks/useThemeColors';

/**
 * The star/dust field — GPU-safe instanced billboard quads (not gl.POINTS).
 * Positions are generated once; all motion is in the vertex shader.
 */
export default function ParticleField({ theme }: { theme: ThemeColors }) {
  const count = SCENE.particles.count;

  const data = useMemo(() => {
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = SCENE.particles.innerRadius + Math.random() * SCENE.particles.shell;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      offsets[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      offsets[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      offsets[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = 0.5 + Math.random() * 1.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { offsets, scales, phases };
  }, [count]);

  return (
    <Billboards
      offsets={data.offsets}
      scales={data.scales}
      phases={data.phases}
      count={count}
      size={SCENE.particles.size}
      color={theme.primary}
      drift={0.25}
    />
  );
}
