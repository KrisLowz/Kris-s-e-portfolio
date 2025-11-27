import React, { useRef } from 'react';
import { Heart } from 'lucide-react';

declare global {
  interface Window {
    gsap: any;
  }
}

const ReactionButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerReaction = () => {
    if (!containerRef.current || !window.gsap) return;

    // Create emoji element
    const emoji = document.createElement('div');
    const reactions = ['❤️', '👏', '🔥', '🚀'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    emoji.textContent = randomReaction;
    emoji.className = 'reaction-emoji';
    
    // Random start position near the button
    const randomX = Math.random() * 40 - 20; 
    
    containerRef.current.appendChild(emoji);

    // Animate using GSAP
    window.gsap.fromTo(emoji, 
      {
        x: randomX,
        y: 0,
        opacity: 1,
        scale: 0.5,
        rotation: Math.random() * 40 - 20
      },
      {
        y: -150 - Math.random() * 100,
        x: randomX + (Math.random() * 40 - 20),
        opacity: 0,
        scale: 1.5,
        duration: 1.5 + Math.random(),
        ease: "power1.out",
        onComplete: () => {
          if (containerRef.current && containerRef.current.contains(emoji)) {
            containerRef.current.removeChild(emoji);
          }
        }
      }
    );
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none md:pointer-events-auto" ref={containerRef}>
      <div className="relative">
        <button 
          onClick={triggerReaction}
          className="pointer-events-auto p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group border border-slate-100 dark:border-slate-700"
        >
          <Heart className="w-6 h-6 text-red-500 fill-red-500 group-hover:animate-pulse" />
        </button>
      </div>
    </div>
  );
};

export default ReactionButton;