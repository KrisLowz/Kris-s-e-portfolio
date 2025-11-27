import React, { useEffect, useState, useRef } from 'react';
import { Code2, Smartphone, Database, Terminal, Cpu, Layers, Globe, Server, Command } from 'lucide-react';

declare global {
  interface Window {
    gsap: any;
  }
}

const About: React.FC = () => {
  const [avatarPopped, setAvatarPopped] = useState(false);
  const solarSystemRef = useRef<HTMLDivElement>(null);

  const skills = [
    { name: 'HTML', icon: Globe, ring: 1 },
    { name: 'CSS', icon: Layers, ring: 1 },
    { name: 'JS', icon: Code2, ring: 1 },
    { name: 'Python', icon: Terminal, ring: 2 },
    { name: 'Kotlin', icon: Smartphone, ring: 2 },
    { name: 'SQL', icon: Database, ring: 2 },
    { name: 'Django', icon: Server, ring: 3 },
    { name: 'Firebase', icon: Cpu, ring: 3 },
    { name: 'Oracle', icon: Command, ring: 3 },
  ];

  const handleAvatarClick = () => {
    setAvatarPopped(true);
    setTimeout(() => setAvatarPopped(false), 500); // Reset animation
  };

  useEffect(() => {
    if (!window.gsap) return;

    // Animate Solar System
    // Ring rotations
    window.gsap.to('.orbit-ring-1', { rotation: 360, duration: 20, repeat: -1, ease: 'linear' });
    window.gsap.to('.orbit-ring-2', { rotation: -360, duration: 30, repeat: -1, ease: 'linear' });
    window.gsap.to('.orbit-ring-3', { rotation: 360, duration: 40, repeat: -1, ease: 'linear' });

    // Counter-rotate planets so icons stay upright
    window.gsap.to('.planet-inner-1', { rotation: -360, duration: 20, repeat: -1, ease: 'linear' });
    window.gsap.to('.planet-inner-2', { rotation: 360, duration: 30, repeat: -1, ease: 'linear' });
    window.gsap.to('.planet-inner-3', { rotation: -360, duration: 40, repeat: -1, ease: 'linear' });

    // Background Reveal Animation
    window.gsap.fromTo('.solar-bg-text', 
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 0.05, 
        scale: 1, 
        duration: 2, 
        scrollTrigger: {
          trigger: '.solar-system-container',
          start: 'top center'
        }
      }
    );

  }, []);

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="reveal-on-scroll z-10">
            <div className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold mb-4">
              About Me
            </div>
            <h2 className="text-4xl font-extrabold text-pop-text-main mb-6">
              Engineering with <br /> <span className="text-pop-primary">Purpose & Precision</span>
            </h2>
            <div className="space-y-6 text-pop-text-muted text-lg leading-relaxed mb-8">
              <p>
                I'm a software developer who believes that great code should be invisible to the user. 
                Whether it's a mobile app or an enterprise ERP, the experience should be fluid, intuitive, and reliable.
              </p>
              <p>
                Currently finishing my degree at <strong>Swinburne University</strong>, I've already helped businesses solve real-world logistic challenges through my award-winning work.
              </p>
            </div>

            {/* Interactive Avatar */}
            <div className="flex items-center gap-6 mt-12">
               <div 
                 className={`relative w-24 h-24 cursor-pointer avatar-float ${avatarPopped ? 'pop-effect' : ''}`}
                 onClick={handleAvatarClick}
               >
                 {/* Thought Bubble */}
                 <div className={`absolute -top-10 -right-10 bg-pop-surface shadow-lg border border-pop-border rounded-xl px-3 py-2 text-xs font-bold text-pop-text-main transition-opacity duration-300 ${avatarPopped ? 'opacity-100' : 'opacity-0'}`}>
                   Let's Code! 🚀
                 </div>
                 
                 {/* Avatar Image (DiceBear) */}
                 <img 
                   src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" 
                   alt="Avatar" 
                   className="w-full h-full rounded-full border-4 border-pop-surface shadow-xl"
                 />
                 
                 {/* Status Dot */}
                 <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-pop-surface rounded-full"></div>
               </div>
               
               <div>
                 <p className="font-bold text-pop-text-main text-sm">Click me!</p>
                 <p className="text-pop-text-muted text-xs">I love building cool stuff.</p>
               </div>
            </div>
          </div>

          {/* Skills Solar System */}
          <div className="solar-system-container" ref={solarSystemRef}>
            <h1 className="solar-bg-text">FULLSTACK</h1>
            
            {/* Sun Core */}
            <div className="sun-core">
              <Code2 className="w-8 h-8 text-white animate-pulse" />
            </div>

            {/* Ring 1 */}
            <div className="orbit-ring orbit-ring-1 w-[200px] h-[200px]">
               {skills.filter(s => s.ring === 1).map((skill, i) => (
                 <div 
                   key={skill.name}
                   className="planet"
                   style={{ 
                     width: '40px', 
                     height: '40px',
                     transform: `rotate(${i * 120}deg) translate(100px) rotate(-${i * 120}deg)` // Static initial position
                   }}
                 >
                   <div className="planet-inner-1 p-2" title={skill.name}>
                     <skill.icon className="w-5 h-5 text-pop-primary" />
                   </div>
                 </div>
               ))}
            </div>

            {/* Ring 2 */}
            <div className="orbit-ring orbit-ring-2 w-[340px] h-[340px]">
               {skills.filter(s => s.ring === 2).map((skill, i) => (
                 <div 
                   key={skill.name}
                   className="planet"
                   style={{ 
                     width: '50px', 
                     height: '50px',
                     transform: `rotate(${i * 120 + 45}deg) translate(170px) rotate(-${i * 120 + 45}deg)`
                   }}
                 >
                   <div className="planet-inner-2 p-2.5" title={skill.name}>
                     <skill.icon className="w-6 h-6 text-pop-secondary" />
                   </div>
                 </div>
               ))}
            </div>

             {/* Ring 3 */}
             <div className="orbit-ring orbit-ring-3 w-[480px] h-[480px]">
               {skills.filter(s => s.ring === 3).map((skill, i) => (
                 <div 
                   key={skill.name}
                   className="planet"
                   style={{ 
                     width: '45px', 
                     height: '45px',
                     transform: `rotate(${i * 120 + 90}deg) translate(240px) rotate(-${i * 120 + 90}deg)`
                   }}
                 >
                   <div className="planet-inner-3 p-2" title={skill.name}>
                     <skill.icon className="w-5 h-5 text-emerald-500" />
                   </div>
                 </div>
               ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;