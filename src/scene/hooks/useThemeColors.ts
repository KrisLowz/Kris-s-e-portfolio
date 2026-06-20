import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Reads the site's theme CSS variables into a set of THREE.Colors and keeps
 * them in sync with the light/dark toggle.
 *
 * Returns a STABLE object whose Color instances are mutated in place and lerped
 * toward the active theme each frame (~300ms, matching the site's CSS
 * transition). Because the Color objects are stable references, passing them as
 * shader uniform values means the GPU automatically uploads the live, lerped
 * value every frame — no manual uniform updates, no React re-renders.
 */
export interface ThemeColors {
  bg: THREE.Color;
  primary: THREE.Color;
  secondary: THREE.Color;
  meteor: THREE.Color;
  nebula: [THREE.Color, THREE.Color, THREE.Color];
}

const VARS = {
  bg: '--bg-primary',
  primary: '--accent-primary',
  secondary: '--accent-secondary',
  meteor: '--meteor-color',
  nebula1: '--blob-1',
  nebula2: '--blob-2',
  nebula3: '--blob-3',
} as const;

const FALLBACK: Record<string, string> = {
  bg: '#020617',
  primary: '#818cf8',
  secondary: '#a78bfa',
  meteor: '#22d3ee',
  nebula1: '#312e81',
  nebula2: '#134e4a',
  nebula3: '#172554',
};

export function useThemeColors(): ThemeColors {
  const current = useMemo<ThemeColors>(
    () => ({
      bg: new THREE.Color(FALLBACK.bg),
      primary: new THREE.Color(FALLBACK.primary),
      secondary: new THREE.Color(FALLBACK.secondary),
      meteor: new THREE.Color(FALLBACK.meteor),
      nebula: [
        new THREE.Color(FALLBACK.nebula1),
        new THREE.Color(FALLBACK.nebula2),
        new THREE.Color(FALLBACK.nebula3),
      ],
    }),
    []
  );

  const target = useMemo<ThemeColors>(
    () => ({
      bg: current.bg.clone(),
      primary: current.primary.clone(),
      secondary: current.secondary.clone(),
      meteor: current.meteor.clone(),
      nebula: [current.nebula[0].clone(), current.nebula[1].clone(), current.nebula[2].clone()],
    }),
    [current]
  );

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const get = (name: string, fb: string) => style.getPropertyValue(name).trim() || fb;
      // All these vars are hex; THREE.Color parses hex/rgb() directly.
      target.bg.set(get(VARS.bg, FALLBACK.bg));
      target.primary.set(get(VARS.primary, FALLBACK.primary));
      target.secondary.set(get(VARS.secondary, FALLBACK.secondary));
      target.meteor.set(get(VARS.meteor, FALLBACK.meteor));
      target.nebula[0].set(get(VARS.nebula1, FALLBACK.nebula1));
      target.nebula[1].set(get(VARS.nebula2, FALLBACK.nebula2));
      target.nebula[2].set(get(VARS.nebula3, FALLBACK.nebula3));
    };

    read();
    // Seed current = target so there's no startup lerp from the fallback set.
    current.bg.copy(target.bg);
    current.primary.copy(target.primary);
    current.secondary.copy(target.secondary);
    current.meteor.copy(target.meteor);
    current.nebula.forEach((c, i) => c.copy(target.nebula[i]));

    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => obs.disconnect();
  }, [current, target]);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-6 * delta); // ~300ms ease toward the active theme
    current.bg.lerp(target.bg, k);
    current.primary.lerp(target.primary, k);
    current.secondary.lerp(target.secondary, k);
    current.meteor.lerp(target.meteor, k);
    current.nebula[0].lerp(target.nebula[0], k);
    current.nebula[1].lerp(target.nebula[1], k);
    current.nebula[2].lerp(target.nebula[2], k);
  });

  return current;
}
