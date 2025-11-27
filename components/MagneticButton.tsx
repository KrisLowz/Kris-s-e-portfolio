import React, { useRef, useEffect } from 'react';

declare global {
  interface Window {
    gsap: any;
  }
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // How strong the pull is
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  onClick, 
  strength = 30 
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !window.gsap) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      window.gsap.to(btn, {
        x: x * 0.3, // Movement multiplier
        y: y * 0.3,
        rotate: x * 0.05,
        duration: 0.5,
        ease: "power3.out"
      });
    };

    const handleMouseLeave = () => {
      window.gsap.to(btn, {
        x: 0,
        y: 0,
        rotate: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.3)" // Bouncy return
      });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <button 
      ref={btnRef} 
      className={className} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default MagneticButton;