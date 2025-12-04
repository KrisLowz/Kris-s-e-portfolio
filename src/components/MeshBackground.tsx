import React from 'react';

const MeshBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-soft-bg transition-colors duration-500">
      {/* Animated Blobs using CSS Variables */}
      <div 
        className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
        style={{ backgroundColor: 'var(--blob-1)' }}
      ></div>
      <div 
        className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
        style={{ backgroundColor: 'var(--blob-2)' }}
      ></div>
      <div 
        className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"
        style={{ backgroundColor: 'var(--blob-3)' }}
      ></div>
      
      {/* Mesh Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
    </div>
  );
};

export default MeshBackground;