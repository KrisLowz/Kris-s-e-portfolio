import React from 'react';

const FogBackground: React.FC = () => {
  return (
    <div className="fog-overlay">
      <div className="fog-layer-global"></div>
      <div className="fog-layer-global two"></div>
    </div>
  );
};

export default FogBackground;