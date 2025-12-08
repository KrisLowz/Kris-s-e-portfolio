import React, { useState, useEffect } from 'react';

const ScrollProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-pop-primary via-purple-500 to-cyan-500 z-40"
      style={{ width: `${progress}%`, transition: 'width 0.1s ease-out' }}
    />
  );
};

export default ScrollProgressBar;
