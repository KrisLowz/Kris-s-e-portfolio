import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let activeTheme: 'light' | 'dark' = 'light';

    if (savedTheme) {
      activeTheme = savedTheme;
    } else if (systemPrefersDark) {
      activeTheme = 'dark';
    }

    applyTheme(activeTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 1. Set Data Attribute for CSS Variables (MeshGradient, etc.)
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 2. Set Class for Tailwind Dark Mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-white/20 hover:bg-white/40 border border-white/20 backdrop-blur-md transition-all text-pop-text shadow-sm hover:scale-110"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5 text-amber-500 fill-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-300 fill-indigo-300" />
      )}
    </button>
  );
};

export default ThemeToggle;