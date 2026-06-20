import React from 'react';

/**
 * DOM gradient backdrop. Two jobs:
 *  1. The full visual background when the 3D scene is gated off
 *     (reduced-motion / no-WebGL / low-power / mobile).
 *  2. A backstop painted *behind* the canvas so there is never a blank flash
 *     in the moment before WebGL initialises (it replaces the old
 *     MeshBackground, which used to be the deepest painted layer).
 *
 * All colors come from the theme CSS variables, so it adapts to light/dark for
 * free (see `.scene-fallback` in style.css). Decorative only → aria-hidden.
 */
const SceneFallback: React.FC = () => <div className="scene-fallback" aria-hidden="true" />;

export default SceneFallback;
