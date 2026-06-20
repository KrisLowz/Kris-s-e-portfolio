import React, { useRef, useEffect } from 'react';
import { applyMagnetic } from '../animations';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  /** When provided, renders an <a> instead of a <button> (valid for CTAs). */
  href?: string;
  download?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

/**
 * Button (or link) that magnetically follows the cursor. Magnetism, pressed-state
 * feedback and elastic spring-back all live in animations/magnetic.ts (gsap
 * quickTo, honours `strength`, auto-disabled on touch / reduced motion).
 */
const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  strength = 30,
  href,
  download,
  target,
  rel,
  ariaLabel,
}) => {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return applyMagnetic(ref.current, strength);
  }, [strength]);

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        download={download}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
};

export default MagneticButton;
