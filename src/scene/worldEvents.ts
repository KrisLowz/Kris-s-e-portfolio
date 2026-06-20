/**
 * Tiny typed CustomEvent bus linking the DOM and the 3D scene without coupling
 * React state to the render loop. All events fire on `window`. No three.js
 * imports here, so DOM components can emit safely even when the scene is gated
 * off (the events simply have no listener).
 */
export interface WorldFocusDetail {
  type: 'skill' | 'project' | 'experience';
  id: string;
}

const FOCUS = 'world:focus';
const BLUR = 'world:blur';
const PROJECT_OPEN = 'project:open';

export function emitWorldFocus(detail: WorldFocusDetail): void {
  window.dispatchEvent(new CustomEvent(FOCUS, { detail }));
}
export function emitWorldBlur(detail: WorldFocusDetail): void {
  window.dispatchEvent(new CustomEvent(BLUR, { detail }));
}
export function emitProjectOpen(id: string): void {
  window.dispatchEvent(new CustomEvent(PROJECT_OPEN, { detail: { id } }));
}

export function onWorldFocus(fn: (d: WorldFocusDetail) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<WorldFocusDetail>).detail);
  window.addEventListener(FOCUS, h);
  return () => window.removeEventListener(FOCUS, h);
}
export function onWorldBlur(fn: (d: WorldFocusDetail) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<WorldFocusDetail>).detail);
  window.addEventListener(BLUR, h);
  return () => window.removeEventListener(BLUR, h);
}
export function onProjectOpen(fn: (id: string) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<{ id: string }>).detail.id);
  window.addEventListener(PROJECT_OPEN, h);
  return () => window.removeEventListener(PROJECT_OPEN, h);
}
