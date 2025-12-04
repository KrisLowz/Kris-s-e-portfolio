import React, { useEffect, useRef } from 'react';
import { MousePointer2 } from 'lucide-react';

declare global {
  interface Window {
    gsap: any;
  }
}

const GhostCursors: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const users = [
    { id: 1, name: 'Recruiter @ TechCorp', color: '#f87171', initialX: 100, initialY: 100 }, // Red-400
    { id: 2, name: 'Visitor from SG', color: '#34d399', initialX: 800, initialY: 300 }, // Emerald-400
    { id: 3, name: 'Design Lead', color: '#fbbf24', initialX: 400, initialY: 600 }, // Amber-400
  ];

  useEffect(() => {
    if (!window.gsap || !containerRef.current) return;

    users.forEach(user => {
      const cursor = document.getElementById(`cursor-${user.id}`);
      if (!cursor) return;

      const moveCursor = () => {
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        const duration = 2 + Math.random() * 3;
        
        window.gsap.to(cursor, {
          x: x,
          y: y,
          duration: duration,
          ease: "power2.inOut",
          onComplete: moveCursor,
          delay: Math.random() * 2 // Pause briefly before moving again
        });
      };

      moveCursor();
    });

    return () => {
      window.gsap.killTweensOf(".ghost-cursor");
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40 overflow-hidden hidden md:block opacity-70">
      {users.map(user => (
        <div 
          key={user.id} 
          id={`cursor-${user.id}`}
          className="ghost-cursor absolute flex items-center gap-2"
          style={{ transform: `translate(${user.initialX}px, ${user.initialY}px)` }}
        >
          <MousePointer2 
            className="w-5 h-5 fill-current" 
            style={{ color: user.color }} 
          />
          <span 
            className="px-2 py-1 text-[10px] font-bold text-white rounded-full shadow-sm whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GhostCursors;