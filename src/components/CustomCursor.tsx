import React from 'react';

/**
 * Renders the two cursor elements. All motion (quickTo follow, hover-grow, click
 * burst) is driven by animations/cursor.ts, which is booted once from App and is
 * skipped on touch / reduced-motion. Hidden below md.
 */
const CustomCursor: React.FC = () => (
  <>
    <div className="custom-cursor hidden md:block" aria-hidden="true" />
    <div className="custom-cursor-dot hidden md:block" aria-hidden="true" />
  </>
);

export default CustomCursor;
