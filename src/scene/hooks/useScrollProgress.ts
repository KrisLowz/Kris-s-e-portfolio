import { getScrollProgress, getSectionProgress } from '../../animations/scroll';

/**
 * Surfaces the scroll-progress refs to in-canvas components. Returns stable
 * mutable objects (NOT React state), so reading `.value` / `sections[key]` in
 * useFrame never causes a re-render. Under reduced motion these stay at 0 (the
 * scene isn't mounted there anyway).
 */
export function useScrollProgress() {
  return {
    progress: getScrollProgress(),
    sections: getSectionProgress(),
  };
}
