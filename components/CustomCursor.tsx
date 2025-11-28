import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    gsap: any;
  }
}

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.gsap) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    
    // Initial Position
    window.gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    window.gsap.set(dot, { xPercent: -50, yPercent: -50 });

    const handleMouseMove = (e: MouseEvent) => {
      // Smooth follow for the ring
      window.gsap.to(cursor, { 
        x: e.clientX, 
        y: e.clientY, 
        duration: 0.15,
        ease: "power2.out" 
      });
      // Instant follow for the dot
      window.gsap.set(dot, { 
        x: e.clientX, 
        y: e.clientY 
      });
    };

    // Magnetic / Expand Effect
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        target.classList.contains('cursor-pointer')
      ) {
        cursor?.classList.add('hovering');
      }
    };

    const handleMouseOut = () => {
      cursor?.classList.remove('hovering');
    };

    // Click Particles
    const handleClick = (e: MouseEvent) => {
      const particleCount = 6;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('click-particle');
        document.body.appendChild(particle);

        // Random Angle
        const angle = Math.random() * Math.PI * 2;
        const velocity = 30 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        window.gsap.fromTo(particle, 
          { x: e.clientX, y: e.clientY, opacity: 1, scale: 1 },
          { 
            x: e.clientX + tx, 
            y: e.clientY + ty, 
            opacity: 0, 
            scale: 0, 
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => particle.remove()
          }
        );
      }
      
      // Small scale bounce for cursor ring
      window.gsap.fromTo(cursor, 
        { scale: 0.8 }, 
        { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" }
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor hidden md:block"></div>
      <div ref={dotRef} className="custom-cursor-dot hidden md:block"></div>
    </>
  );
};

export default CustomCursor;