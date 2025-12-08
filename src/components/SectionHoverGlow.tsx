import React, { useState, useEffect } from 'react';

const SectionHoverGlow: React.FC = () => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-glow-section]');
    
    sections.forEach((section) => {
      section.addEventListener('mouseenter', () => {
        const sectionId = section.getAttribute('data-glow-section');
        setHoveredSection(sectionId);
      });
      
      section.addEventListener('mouseleave', () => {
        setHoveredSection(null);
      });
    });

    return () => {
      sections.forEach((section) => {
        section.removeEventListener('mouseenter', () => {});
        section.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  if (!hoveredSection) return null;

  return (
    <div
      className="fixed pointer-events-none z-30"
      style={{
        left: `${mousePos.x - 150}px`,
        top: `${mousePos.y - 150}px`,
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        transition: 'all 0.1s ease-out',
      }}
    />
  );
};

export default SectionHoverGlow;
