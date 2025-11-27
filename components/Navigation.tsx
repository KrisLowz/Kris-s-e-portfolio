import React, { useState, useEffect } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { PROFILE } from '../constants';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 flex justify-center py-6 px-4">
      <div className={`
        relative w-full max-w-5xl rounded-full transition-all duration-300
        flex items-center justify-between px-6 py-3
        ${isScrolled 
          ? 'glass-panel' 
          : 'bg-transparent'}
      `}>
        
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="p-2 bg-pop-primary text-white rounded-full group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-pop-primary/30">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-pop-text tracking-tight hidden sm:block">
            {PROFILE.name.split(' ')[0]}<span className="text-pop-primary">.dev</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-5 py-2 text-sm font-semibold text-pop-text hover:text-pop-primary hover:bg-white/50 rounded-full transition-all"
            >
              {link.name}
            </a>
          ))}
        </div>
        
        {/* Right Side: Avatars + Theme + CTA */}
        <div className="flex items-center gap-4">
          
          {/* Active Users Avatars */}
          <div className="hidden lg:flex items-center -space-x-2" title="3 users active now">
            {[1, 2, 3].map((i) => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/100?img=${10 + i}`}
                alt="User"
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
              />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
              +3
            </div>
          </div>

          <ThemeToggle />

          <div className="hidden md:block">
             <a
              href="#contact"
              className="px-6 py-2.5 bg-pop-text text-soft-bg text-sm font-bold rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Let's Talk
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-pop-text bg-white/50 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-4 right-4 glass-panel rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-pop-text p-4 hover:bg-white/20 rounded-2xl transition-colors"
              >
                {link.name}
              </a>
            ))}
             <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 w-full py-4 text-center bg-pop-primary text-white font-bold rounded-xl shadow-lg shadow-pop-primary/30"
            >
              Let's Talk
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;