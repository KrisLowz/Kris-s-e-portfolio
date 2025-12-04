import React from 'react';

const WireframeGlobe: React.FC = () => {
  return (
    <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-[-10] opacity-50 md:opacity-100">
      <div className="absolute top-[-20%] right-[-20%] md:top-[-10%] md:right-[-10%] w-[800px] h-[800px] animate-spin-slow">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <defs>
            <radialGradient id="globe-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--globe-color)" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          
          {/* Main Sphere Halo */}
          <circle cx="250" cy="250" r="240" fill="url(#globe-gradient)" />
          
          {/* Wireframe Meridians (Vertical Lines) */}
          {[...Array(12)].map((_, i) => (
            <ellipse
              key={`meridian-${i}`}
              cx="250"
              cy="250"
              rx={240 * Math.cos((i * 15 * Math.PI) / 180)}
              ry="240"
              fill="none"
              stroke="var(--globe-color)"
              strokeWidth="1.5"
              className="transition-colors duration-500"
              transform={`rotate(${i * 15} 250 250)`}
            />
          ))}

          {/* Wireframe Parallels (Horizontal Lines) */}
          {[...Array(8)].map((_, i) => (
            <ellipse
              key={`parallel-${i}`}
              cx="250"
              cy="250"
              rx="240"
              ry={240 * Math.cos(((i + 1) * 10 * Math.PI) / 180)}
              fill="none"
              stroke="var(--globe-color)"
              strokeWidth="1.5"
              className="transition-colors duration-500"
            />
          ))}
          
          {/* Equator */}
          <circle cx="250" cy="250" r="240" fill="none" stroke="var(--globe-color)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default WireframeGlobe;