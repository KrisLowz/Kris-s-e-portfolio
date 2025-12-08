import React, { useEffect, useState, useRef } from 'react';

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

const ScrollRippleEffect: React.FC = () => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollDelta = Math.abs(currentScroll - lastScrollRef.current);

      // Create ripple every 200px of scroll
      if (scrollDelta > 200) {
        const newRipple: RippleEffect = {
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.3 + window.innerHeight * 0.3,
        };
        setRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1200);

        lastScrollRef.current = currentScroll;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '20px',
            height: '20px',
            border: '2px solid rgba(59, 130, 246, 0.6)',
            borderRadius: '50%',
            animation: `ripple-expand 1.2s ease-out forwards`,
          }}
        >
          <style>{`
            @keyframes ripple-expand {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) scale(3);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      ))}
    </>
  );
};

export default ScrollRippleEffect;
