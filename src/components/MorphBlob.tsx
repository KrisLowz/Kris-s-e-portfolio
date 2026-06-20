import { useEffect, useRef } from 'react';
import { gsap } from '../animations';

// Three organic blob paths (200×200 viewBox) the shape continuously morphs
// between — the Transform & Morph technique, via GSAP MorphSVG.
const SHAPES = [
  'M100,28 C138,28 172,55 172,100 C172,145 138,172 100,172 C62,172 28,145 28,100 C28,55 62,28 100,28 Z',
  'M112,30 C152,36 174,68 168,112 C162,156 128,176 88,170 C48,164 26,128 32,88 C38,48 72,24 112,30 Z',
  'M96,32 C140,26 178,58 172,104 C166,150 132,174 92,176 C52,178 22,140 30,96 C36,56 56,38 96,32 Z',
];

interface Props {
  className?: string;
  colorVar?: string;
}

/**
 * A slowly morphing glow blob — a decorative organic accent. Rendered blurred +
 * low-opacity behind content (see `.contact-blob`).
 */
export default function MorphBlob({ className = '', colorVar = '--accent-primary' }: Props) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 5, ease: 'sine.inOut' } });
    tl.to(p, { morphSVG: SHAPES[1] }).to(p, { morphSVG: SHAPES[2] });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path ref={pathRef} d={SHAPES[0]} fill={`var(${colorVar})`} />
    </svg>
  );
}
