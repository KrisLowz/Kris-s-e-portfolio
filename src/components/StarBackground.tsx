import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    const numStars = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - centerX,
        y: Math.random() * height - centerY,
        z: Math.random() * width,
        size: Math.random() * 2
      });
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.5;
      mouseY = (e.clientY - height / 2) * 0.5;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.fillStyle = '#030014'; // Clear with Deep Space Black
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        
        // Move star towards screen (Z-axis)
        star.z -= 2;

        // Reset if passed viewer
        if (star.z <= 0) {
          star.x = Math.random() * width - centerX;
          star.y = Math.random() * height - centerY;
          star.z = width;
        }

        // Project 3D coordinates to 2D
        const k = 128.0 / star.z;
        // Parallax offset
        const px = (star.x + mouseX * 0.1) * k + centerX;
        const py = (star.y + mouseY * 0.1) * k + centerY;

        // Draw only if within bounds
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / width) * 3;
          const alpha = (1 - star.z / width);
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();

          // Add faint cyan glow to close stars
          if (alpha > 0.8) {
             ctx.shadowBlur = 10;
             ctx.shadowColor = '#00f3ff';
          } else {
             ctx.shadowBlur = 0;
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none"
    />
  );
};

export default StarBackground;