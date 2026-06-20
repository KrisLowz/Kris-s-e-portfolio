/**
 * Capability detection + the single gate that decides whether the WebGL scene
 * mounts at all. Everything under `shouldRenderScene()` may assume a capable,
 * motion-OK, non-low-power device; otherwise the app renders <SceneFallback />
 * (a pure-DOM gradient) instead.
 *
 * Imports CONFIG directly from the animations config module (no heavy side
 * effects) to reuse the existing reducedMotion / isMobile resolution.
 */
import { CONFIG } from '../animations/config';

/** True only if a real WebGL (2 or 1) context can be created on this device. */
export function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl && typeof (gl as WebGLRenderingContext).getParameter === 'function';
  } catch {
    return false;
  }
}

/**
 * Conservative low-power heuristic. We only exclude clearly weak devices and
 * let the runtime PerformanceMonitor (Phase 7) scale quality on the middle
 * ground — a "wow" showcase should still try to render on mainstream desktops.
 * Tunable: tighten these thresholds if low-end machines struggle.
 */
export function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2)
    return true;
  return false;
}

/**
 * True only if the GPU can render to a float/half-float color buffer, which the
 * postprocessing bloom pass requires. Integrated GPUs often can't — there bloom
 * is skipped and the baked-in glow (halos + additive) carries the look. Without
 * this gate, an unsupported HDR target makes the whole scene clamp to black.
 */
export function supportsFloatBloom(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    return !!gl.getExtension('EXT_color_buffer_float');
  } catch {
    return false;
  }
}

/**
 * Master gate. The scene mounts only when the central kill-switch is on, motion
 * is allowed, the device isn't mobile or low-power, and WebGL is available.
 * Pure read — safe to call once at mount.
 */
export function shouldRenderScene(): boolean {
  if (typeof window === 'undefined') return false;
  if (!CONFIG.toggles.scene3d) return false;
  if (CONFIG.reducedMotion) return false;
  if (CONFIG.isMobile) return false;
  if (isLowPower()) return false;
  if (!detectWebGL()) return false;
  return true;
}
