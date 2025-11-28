import React, { useEffect, useState, useRef } from 'react';
import { Code2 } from 'lucide-react';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const About: React.FC = () => {
  const [avatarPopped, setAvatarPopped] = useState(false);
  const solarSystemRef = useRef<HTMLDivElement>(null);

  // Devicon Skills
  const innerRingSkills = [
    { name: 'HTML5', iconClass: 'devicon-html5-plain colored' },
    { name: 'CSS3', iconClass: 'devicon-css3-plain colored' },
    { name: 'JavaScript', iconClass: 'devicon-javascript-plain colored' },
    { name: 'Python', iconClass: 'devicon-python-plain colored' },
    { name: 'Java', iconClass: 'devicon-java-plain colored' },
    { name: 'C++', iconClass: 'devicon-cplusplus-plain colored' },
    { name: 'C#', iconClass: 'devicon-csharp-plain colored' },
    { name: 'SQL', iconClass: 'devicon-mysql-plain colored' },
  ];

  const outerRingSkills = [
    { name: 'Django', iconClass: 'devicon-django-plain colored' },
    { name: 'Flask', iconClass: 'devicon-flask-original colored' },
    { name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain colored' },
    { name: 'Firebase', iconClass: 'devicon-firebase-plain colored' },
    { name: 'Kotlin', iconClass: 'devicon-kotlin-plain colored' },
    { name: 'Flutter', iconClass: 'devicon-flutter-plain colored' },
    { name: 'Android', iconClass: 'devicon-android-plain colored' },
    { name: 'Git', iconClass: 'devicon-git-plain colored' },
    { name: 'VS Code', iconClass: 'devicon-vscode-plain colored' },
  ];

  const handleAvatarClick = () => {
    setAvatarPopped(true);
    setTimeout(() => setAvatarPopped(false), 500); // Reset animation
  };

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
    
    if (!window.gsap) return;

    // Animate Solar System
    window.gsap.to('.orbit-ring-1', { rotation: 360, duration: 30, repeat: -1, ease: 'linear' });
    window.gsap.to('.orbit-ring-2', { rotation: -360, duration: 45, repeat: -1, ease: 'linear' });

    // Counter-rotate planets
    window.gsap.to('.planet-inner-1', { rotation: -360, duration: 30, repeat: -1, ease: 'linear' });
    window.gsap.to('.planet-inner-2', { rotation: 360, duration: 45, repeat: -1, ease: 'linear' });

    // Background Reveal Animation
    window.gsap.fromTo('.solar-bg-text', 
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 0.15, 
        scale: 1, 
        duration: 1.5, 
        scrollTrigger: {
          trigger: '.solar-system-container',
          start: 'top 70%',
          end: 'bottom center',
          scrub: 1
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
                 <div className={`absolute -top-10 -right-10 bg-pop-surface shadow-lg border border-pop-border rounded-xl px-3 py-2 text-xs font-bold text-pop-text-main transition-opacity duration-300 ${avatarPopped ? 'opacity-100' : 'opacity-0'}`}>
                   Let's Code! 🚀
                 </div>
                 <img 
                   src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" 
                   alt="Avatar" 
                   className="w-full h-full rounded-full border-4 border-pop-surface shadow-xl"
                 />
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
            {/* Fog Atmosphere */}
            <div className="fog-wrapper">
              <div className="fog-layer"></div>
              <div className="fog-layer layer-2"></div>
            </div>

            {/* Background Text - BOLD & VISIBLE */}
            <h1 className="solar-bg-text">SKILLS</h1>
            
            {/* Sun Core */}
            <div className="sun-core">
              <Code2 className="w-8 h-8 text-white animate-pulse" />
            </div>

            {/* Ring 1 (Inner) */}
            <div className="orbit-ring orbit-ring-1 w-[260px] h-[260px]">
               {innerRingSkills.map((skill, i) => {
                 const count = innerRingSkills.length;
                 const angle = (360 / count) * i;
                 return (
                   <div 
                     key={skill.name}
                     className="planet"
                     style={{ 
                       width: '44px', 
                       height: '44px',
                       transform: `rotate(${angle}deg) translate(130px) rotate(-${angle}deg)`
                     }}
                   >
                     <div className="planet-inner-1 flex items-center justify-center w-full h-full" title={skill.name}>
                       <i className={`${skill.iconClass} text-xl`} />
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Ring 2 (Outer) */}
            <div className="orbit-ring orbit-ring-2 w-[420px] h-[420px]">
               {outerRingSkills.map((skill, i) => {
                 const count = outerRingSkills.length;
                 const angle = (360 / count) * i;
                 return (
                   <div 
                     key={skill.name}
                     className="planet"
                     style={{ 
                       width: '50px', 
                       height: '50px',
                       transform: `rotate(${angle + 20}deg) translate(210px) rotate(-${angle + 20}deg)`
                     }}
                   >
                     <div className="planet-inner-2 flex items-center justify-center w-full h-full" title={skill.name}>
                       <i className={`${skill.iconClass} text-2xl`} />
                     </div>
                   </div>
                 );
               })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;