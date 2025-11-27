import React from 'react';

const MeteorShower: React.FC = () => {
  // Generate a consistent set of meteors so they don't re-render chaotically
  const meteors = [...Array(10)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 50}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${2 + Math.random() * 3}s`,
    width: `${100 + Math.random() * 200}px`
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden">
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="meteor"
          style={{
            left: meteor.left,
            top: meteor.top,
            width: meteor.width,
            animationDelay: meteor.delay,
            animationDuration: meteor.duration
          }}
        />
      ))}
    </div>
  );
};

export default MeteorShower;